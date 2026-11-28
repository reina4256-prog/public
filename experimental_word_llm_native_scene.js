'use strict';
// Shared island art and sprite renderer only. No old understanding/learning loop.
var currentMode='play',catalog=JSON.parse(JSON.stringify(defaultCatalog)),assets=null;
var aiPet={x:300,y:200,baseType:'robot',currentSkin:'robot',visualScale:1,actionState:'idle',schedule:[],bgmVolume:0};
var floatingTexts=[],images={},imagesLoaded=0,totalImages=0;
window.aiPet=aiPet;
window.NativeScene={
    visible(game){return game.perception===2?window.NativePerception.chips(game):window.NativeGame.supply(game).visible;},
    load(){
        for(const key of ['field','terrain','field_3','field_4','field_5','field_6','field_bg','room_bg',...ExperimentalWordStartQuestions.appearances]){
            const img=new Image();images[key]=img;totalImages++;
            img.onload=()=>imagesLoaded++;img.onerror=()=>{imagesLoaded++;console.error('Island asset could not load: '+key);};img.src=imageSources[key];
        }
        window.NativeHomeInterior.load();
    },
    draw(game,time,reduced){
        if(!game)return;
        const passage=window.NativePassageUI?.view();if(passage)game=passage.game;
        assets=game.island.assets;const skin=game.origin.appearance;
        aiPet.type=aiPet.baseType=aiPet.currentSkin=skin;aiPet.x=game.x*800;aiPet.y=game.y*480;
        aiPet.visualScale=passage?.scale??1;
        if(passage){const a=passage.target==='chip:player_home'?NativeHome.asset(game):NativePerception.asset(game,passage.target);
            if(a){const x=a.dx+a.sw*a.scale/2,y=a.dy+a.sh*a.scale/2,f=passage.direction==='enter'?passage.progress:1-passage.progress;aiPet.x+=(x-aiPet.x)*f;aiPet.y+=(y-aiPet.y)*f;}}
        const practice=window.NativePractice.current(game),practiceRoute=practice&&!practice.suspended?practice.route:[],travel=practiceRoute?.length>0&&!window.NativePracticeUI?.pending&&!window.NativePractice.due(practice);
        const searching=practice?.phase==='survey'&&practice.gather&&!practice.suspended&&!practiceRoute.length&&practice.surveyIndex<2&&!window.NativePracticeUI?.pending&&!NativePractice.due(practice);
        const homeRoute=game.home?.travel?.route||[],bedSleep=!!window.NativeHome?.sleeping(game),moving=!!passage||game.mode==='move'||travel||homeRoute.length>0||!!window.NativeHome?.resting(game)&&!bedSleep;
        aiPet.actionState=moving?'moving':bedSleep?'sleeping':'idle';aiPet.visualAction=bedSleep||game.mode==='rest'?'sleep':game.mode==='eat'?'eat_raw':'idle';
        const frames=aiConfigs[skin].actions[moving?'move':aiPet.visualAction]||aiConfigs[skin].actions.idle;
        aiPet.frameIndex=reduced?0:Math.floor((bedSleep?game.home.rest.elapsed:time)/.25)%frames.length;
        const next=(homeRoute.length?homeRoute:practiceRoute?.length?practiceRoute:game.route).find(p=>Math.hypot(p.x-game.x,p.y-game.y)>.00001);
        if(game.home?.inside){camera.x=0;camera.y=0;NativeHomeInterior.draw(ctx,canvas.width,canvas.height,game);
            if(bedSleep){aiPet.flip=false;aiPet.indoorTarget={...NativeHome.asset(game),type:'house'};aiPet.exploreState=null;drawActionWindow('sleep','inside',true);}
            this.drawHomeFade(game);return;}
        if(next&&Math.abs(next.x-game.x)>.00001)aiPet.flip=next.x<game.x;
        if(searching&&!reduced)aiPet.flip=Math.floor(time/1.1)%2===1;
        const reported=(game.practices||[]).findLast(p=>p.remote?.target)?.remote,targetAsset=reported&&game.focus&&reported.target===game.focus.targetId&&!this.visible(game).some(p=>p.id===game.focus.targetId)?NativePerception.asset(game,reported.target):null;
        camera.x=(targetAsset?targetAsset.dx+targetAsset.sw*targetAsset.scale/2:aiPet.x)-canvas.width/2;camera.y=(targetAsset?targetAsset.dy+targetAsset.sh*targetAsset.scale/2:aiPet.y)-canvas.height/2;
        const objects=[];
        if(game.home?.phase==='ready'){const h=game.home,sprite=defaultCatalog.hut,scale=Math.min(44/sprite.sw,58/sprite.sh);
            objects.push({...sprite,scale,dx:h.site.x*800-sprite.sw*scale/2,dy:h.site.y*480+10-sprite.sh*scale});}
        render(objects);
        const house=game.home;if(house?.site){const x=house.site.x*800-camera.x,y=house.site.y*480-camera.y;
            if(house.phase==='planning'&&!game.focus)this.drawTarget({x:x/800,y:y/480,width:.055,height:.06});
            else if(house.phase==='building'){ctx.save();ctx.strokeStyle='#e8cf9b';ctx.lineWidth=3;ctx.strokeRect(x-20,y-12,40,20);ctx.restore();}
        }
        // A single circle is shown only for an explicitly proposed real map chip.
        const target=this.visible(game).find(p=>p.id===game.focus?.targetId);
        if(game.perception===2&&target)this.drawTarget(target);
        if(targetAsset)this.drawTarget({x:.5,y:.5,width:targetAsset.sw*targetAsset.scale/800,height:targetAsset.sh*targetAsset.scale/480});
        if(practice?.phase==='survey'&&!passage){
            aiPet.indoorTarget=NativePerception.asset(game,practice.target);aiPet.exploreState={currentFacility:practice.target.startsWith('chip:mountain_')?'mountain':'palms'};
            drawActionWindow(travel?'move':'idle','inside',true);
        }
        this.drawHomeFade(game);
        if(passage){ctx.save();ctx.globalAlpha=passage.alpha;ctx.fillStyle='#000';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.restore();}
    },
    drawHomeFade(game){const e=game.home?.exit;if(!e||e.phase==='walk')return;
        ctx.save();ctx.globalAlpha=e.phase==='out'?Math.min(1,e.elapsed/.3):Math.max(0,1-e.elapsed/.3);ctx.fillStyle='#000';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.restore();},
    drawTarget(p){
        ctx.save();ctx.strokeStyle='#ffe08a';ctx.lineWidth=3;
        ctx.shadowColor='#162b2a';ctx.shadowBlur=4;
        ctx.beginPath();ctx.ellipse(p.x*800,p.y*480,Math.max(18,p.width*400)+7,Math.max(12,p.height*240)+7,0,0,Math.PI*2);ctx.stroke();ctx.restore();
    }
};
