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
        const searching=practice?.phase==='survey'&&practice.gather&&!practice.suspended&&!practiceRoute.length&&practice.surveyIndex<2&&!window.NativePracticeUI?.pending&&!NativePractice.due(practice);
        const homeRoute=game.home?.travel?.route||[],moving=game.mode==='move'||travel||homeRoute.length>0;
        aiPet.actionState=moving?'moving':'idle';aiPet.visualAction=game.mode==='rest'?'sleep':game.mode==='eat'?'eat_raw':'idle';
        const frames=aiConfigs[skin].actions[moving?'move':aiPet.visualAction]||aiConfigs[skin].actions.idle;
        aiPet.frameIndex=reduced?0:Math.floor(time/.25)%frames.length;
        const next=(homeRoute.length?homeRoute:practiceRoute?.length?practiceRoute:game.route).find(p=>Math.hypot(p.x-game.x,p.y-game.y)>.00001);
        if(game.home?.inside){camera.x=0;camera.y=0;NativeHomeInterior.draw(ctx,canvas.width,canvas.height);aiPet.x=canvas.width*.5;aiPet.y=canvas.height*.64;drawAICharacter();return;}
        if(next&&Math.abs(next.x-game.x)>.00001)aiPet.flip=next.x<game.x;
        if(searching&&!reduced)aiPet.flip=Math.floor(time/1.1)%2===1;
        const reported=(game.practices||[]).findLast(p=>p.remote?.target)?.remote,targetAsset=reported&&game.focus&&reported.target===game.focus.targetId&&!this.visible(game).some(p=>p.id===game.focus.targetId)?NativePerception.asset(game,reported.target):null;
        camera.x=(targetAsset?targetAsset.dx+targetAsset.sw*targetAsset.scale/2:aiPet.x)-canvas.width/2;camera.y=(targetAsset?targetAsset.dy+targetAsset.sh*targetAsset.scale/2:aiPet.y)-canvas.height/2;render();
        const house=game.home;if(house?.site){const x=house.site.x*800-camera.x,y=house.site.y*480-camera.y;
            if(house.phase==='planning'&&!game.focus)this.drawTarget({x:x/800,y:y/480,width:.055,height:.06});
            else if(house.phase==='building'){ctx.save();ctx.strokeStyle='#e8cf9b';ctx.lineWidth=3;ctx.strokeRect(x-20,y-12,40,20);ctx.restore();}
            else if(house.phase==='ready'){ctx.save();ctx.fillStyle='#ac7648';ctx.fillRect(x-20,y-32,40,40);ctx.fillStyle='#5f3c37';ctx.beginPath();ctx.moveTo(x-25,y-32);ctx.lineTo(x,y-52);ctx.lineTo(x+25,y-32);ctx.closePath();ctx.fill();ctx.fillStyle='#302c30';ctx.fillRect(x-5,y-12,10,20);ctx.restore();}}
        // A single circle is shown only for an explicitly proposed real map chip.
        const target=this.visible(game).find(p=>p.id===game.focus?.targetId);
        if(game.perception===2&&target)this.drawTarget(target);
        if(targetAsset)this.drawTarget({x:.5,y:.5,width:targetAsset.sw*targetAsset.scale/800,height:targetAsset.sh*targetAsset.scale/480});
        if(practice?.phase==='survey'){
            aiPet.indoorTarget=NativePerception.asset(game,practice.target);aiPet.exploreState={currentFacility:practice.target.startsWith('chip:mountain_')?'mountain':'palms'};
            drawActionWindow(travel?'move':'idle','inside',true);
        }
    },
    drawTarget(p){
        ctx.save();ctx.strokeStyle='#ffe08a';ctx.lineWidth=3;
        ctx.shadowColor='#162b2a';ctx.shadowBlur=4;
        ctx.beginPath();ctx.ellipse(p.x*800,p.y*480,Math.max(18,p.width*400)+7,Math.max(12,p.height*240)+7,0,0,Math.PI*2);ctx.stroke();ctx.restore();
    }
};
