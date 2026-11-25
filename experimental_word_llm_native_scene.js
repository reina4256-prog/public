'use strict';
// Shared island art and sprite renderer only. No old understanding/learning loop.
var currentMode='play',catalog=JSON.parse(JSON.stringify(defaultCatalog)),assets=null;
var aiPet={x:300,y:200,baseType:'robot',currentSkin:'robot',visualScale:1,actionState:'idle',schedule:[],bgmVolume:0};
var floatingTexts=[],images={},imagesLoaded=0,totalImages=0;
window.aiPet=aiPet;
window.NativeScene={
    visible(game){return game.perception===2?window.NativePerception.chips(game):window.NativeGame.supply(game).visible;},
    load(){
        for(const key of ['field','terrain','field_3','field_4','field_5','field_6','field_bg',...ExperimentalWordStartQuestions.appearances]){
            const img=new Image();images[key]=img;totalImages++;
            img.onload=()=>imagesLoaded++;img.onerror=()=>{imagesLoaded++;console.error('Island asset could not load: '+key);};img.src=imageSources[key];
        }
    },
    draw(game,time,reduced){
        if(!game)return;
        assets=game.island.assets;const skin=game.origin.appearance;
        aiPet.type=aiPet.baseType=aiPet.currentSkin=skin;aiPet.x=game.x*800;aiPet.y=game.y*480;
        const practice=window.NativePractice.current(game),practiceRoute=practice&&!practice.suspended?practice.route:[],travel=practiceRoute?.length>0&&!window.NativePracticeUI?.pending&&!window.NativePractice.due(practice);
        aiPet.actionState=game.mode==='move'||travel?'moving':'idle';aiPet.visualAction=game.mode==='rest'?'sleep':game.mode==='eat'?'eat_raw':'idle';
        const frames=aiConfigs[skin].actions[game.mode==='move'||travel?'move':aiPet.visualAction]||aiConfigs[skin].actions.idle;
        aiPet.frameIndex=reduced?0:Math.floor(time/.25)%frames.length;
        const next=(practiceRoute?.length?practiceRoute:game.route).find(p=>Math.hypot(p.x-game.x,p.y-game.y)>.00001);
        if(next&&Math.abs(next.x-game.x)>.00001)aiPet.flip=next.x<game.x;
        camera.x=aiPet.x-canvas.width/2;camera.y=aiPet.y-canvas.height/2;render();
        // A single circle is shown only for an explicitly proposed real map chip.
        const target=this.visible(game).find(p=>p.id===game.focus?.targetId);
        if(game.perception===2&&target)this.drawTarget(target);
        if(practice?.phase==='survey'){
            aiPet.indoorTarget=NativePerception.asset(game,practice.target);aiPet.exploreState={currentFacility:practice.target.startsWith('chip:mountain_')?'mountain':'palms'};
            const searching=practice.gather&&!practice.suspended&&!practiceRoute.length&&practice.surveyIndex<2&&!window.NativePracticeUI?.pending&&!NativePractice.due(practice);
            drawActionWindow(travel||searching?'move':'idle','inside',true);
            if(searching){ctx.save();ctx.strokeStyle='#ffe08a';ctx.lineWidth=2;const x=canvas.width/2+(reduced?0:Math.sin(time*2)*65),y=canvas.height/2+44;
                ctx.beginPath();ctx.ellipse(x,y,28,10,0,0,Math.PI*2);ctx.stroke();ctx.fillStyle='#122936';ctx.fillRect(canvas.width/2-120,canvas.height/2+76,240,17);
                ctx.fillStyle='#e6f6ff';ctx.font='13px sans-serif';ctx.textAlign='center';ctx.fillText(GameI18n.translate('探している'),canvas.width/2,canvas.height/2+89);ctx.restore();}
        }
    },
    drawTarget(p){
        ctx.save();ctx.strokeStyle='#ffe08a';ctx.lineWidth=3;
        ctx.shadowColor='#162b2a';ctx.shadowBlur=4;
        ctx.beginPath();ctx.ellipse(p.x*800,p.y*480,Math.max(18,p.width*400)+7,Math.max(12,p.height*240)+7,0,0,Math.PI*2);ctx.stroke();ctx.restore();
    }
};
