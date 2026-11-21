'use strict';
// Shared island art and sprite renderer only. No old understanding/learning loop.
var currentMode='play',catalog=JSON.parse(JSON.stringify(defaultCatalog)),assets=null;
var aiPet={x:300,y:200,baseType:'robot',currentSkin:'robot',visualScale:1,actionState:'idle',schedule:[],bgmVolume:0};
var floatingTexts=[],images={},imagesLoaded=0,totalImages=0;
window.aiPet=aiPet;
window.NativeScene={
    names:{'berry:1':'木の実',path:'道',shade:'木陰'},
    visible(game){return window.NativeGame.visible(game);},
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
        // The markers use the exact perception predicate used by packet.world.visible.
        const visible=this.visible(game);
        for(const p of visible)this.drawTarget(p,game);
    },
    drawTarget(p,game){
        // Food/rest belong to the existing tree, while p.x/y are its reachable
        // interaction point. Anchor the name to the tree rather than nearby grass.
        const tree=p.assetKey&&game.island.assets[p.assetKey];
        const x=(tree?tree.dx+tree.sw*tree.scale/2:p.x*800)-camera.x;
        const y=(tree?tree.dy+tree.sh*tree.scale:p.y*480)-camera.y,selected=p.id===game.destination;
        ctx.save();ctx.translate(x,y);
        ctx.strokeStyle=selected?'#ffe08a':'#ffffff88';ctx.lineWidth=2;
        ctx.beginPath();ctx.ellipse(0,0,19,8,0,0,Math.PI*2);ctx.stroke();
        const label=window.GameI18n.translate(this.names[p.id]);ctx.font='16px sans-serif';
        const width=ctx.measureText(label).width+14,labelY=12;
        ctx.fillStyle='#183a32cc';ctx.fillRect(-width/2,labelY,width,25);
        ctx.fillStyle=selected?'#ffe08a':'#fff8df';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(label,0,labelY+13);
        ctx.restore();
    }
};
