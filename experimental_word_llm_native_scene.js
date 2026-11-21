'use strict';
// Shared island art and sprite renderer only. No old understanding/learning loop.
var currentMode='play',catalog=JSON.parse(JSON.stringify(defaultCatalog)),assets=null;
var aiPet={x:300,y:200,baseType:'robot',currentSkin:'robot',visualScale:1,actionState:'idle',schedule:[],bgmVolume:0};
var floatingTexts=[],images={},imagesLoaded=0,totalImages=0;
window.aiPet=aiPet;
window.NativeScene={
    load(){
        for(const key of ['field','terrain','field_3','field_4','field_5','field_6',...ExperimentalWordStartQuestions.appearances]){
            const img=new Image();images[key]=img;totalImages++;
            img.onload=()=>imagesLoaded++;img.onerror=()=>{imagesLoaded++;console.error('Island asset could not load: '+key);};img.src=imageSources[key];
        }
    },
    draw(game,time,reduced){
        if(!game)return;
        assets=game.island.assets;const skin=game.origin.appearance;
        aiPet.type=aiPet.baseType=aiPet.currentSkin=skin;aiPet.x=game.x*800;aiPet.y=game.y*480;
        aiPet.actionState=game.mode==='move'?'moving':'idle';aiPet.visualAction=game.mode==='rest'?'sleep':game.mode==='eat'?'eat_raw':'idle';
        const frames=aiConfigs[skin].actions[game.mode==='move'?'move':aiPet.visualAction]||aiConfigs[skin].actions.idle;
        aiPet.frameIndex=reduced?0:Math.floor(time/.25)%frames.length;
        if(game.route[0])aiPet.flip=game.route[0].x<game.x;
        camera.x=aiPet.x-canvas.width/2;camera.y=aiPet.y-canvas.height/2;render();
        for(const p of game.island.places.slice(0,3)){
            ctx.beginPath();ctx.strokeStyle=game.destination===p.id?'#ffe08a':'#ffffff88';ctx.lineWidth=2;
            ctx.ellipse(p.x*800-camera.x,p.y*480-camera.y+18,19,8,0,0,Math.PI*2);ctx.stroke();
            if(p.id==='berry:1')for(let i=0;i<game.fruit;i++){ctx.beginPath();ctx.fillStyle='#b34463';ctx.arc(p.x*800-camera.x-10+i*10,p.y*480-camera.y+18,4,0,Math.PI*2);ctx.fill();}
        }
    }
};
