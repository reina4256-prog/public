(function () {
    'use strict';
    window.ExperimentalWordAdventureView = function (canvas, controls, text, act, onError = () => {}) {
        const api = window.ExperimentalWordAdventureConnection, physical = window.ExperimentalWordAdventure;
        const line = document.createElement('p'); line.id = 'word-adventure-status'; line.setAttribute('role','status'); controls.append(line);
        let elapsed = 0, skin = 'robot', authored = {}, facing = 'down', room = null, failed = false;
        const images = new Map();
        const local = value => window.GameI18n.translate(value);
        fetch('experimental_word_dungeon_visuals.json').then(r => { if (!r.ok) throw Error('visuals'); return r.json(); })
            .then(value => {
                authored = value;
                for (const key of ['skull_floor','crystal_floor','spr_item_herb','spr_item_bag']) image(authored[key].img);
            }).catch(error);
        function error(e) { failed = true; onError(e); }
        function image(file) {
            if (!images.has(file)) { const img = new Image(); img.onerror = error; img.src = file; images.set(file, img); }
            return images.get(file);
        }
        function ready(state) {
            const id = window.ExperimentalWordGrowth.visualSkin(skin), run = state.adventure.run;
            const keys = [run?.dungeon+'_floor',id+'_down'];
            if (state.adventure.items.some(i=>i.location==='floor'&&i.dungeon===run?.dungeon&&i.floor===run?.floor)) keys.push('spr_item_herb','spr_item_bag');
            return !failed && keys.every(key=>{const a=authored[key];if(!a)return false;const img=image(a.img);return img.complete&&img.naturalWidth;});
        }
        function chip(ctx, key, x, y, w, h) {
            const a = authored[key]; if (!a) return;
            const img = image(a.img);
            if (img.complete && img.naturalWidth) ctx.drawImage(img,a.sx,a.sy,a.sw,a.sh,x,y,w,h);
        }
        function actor(ctx, x, y, direction, enemy) {
            const id = window.ExperimentalWordGrowth.visualSkin(skin);
            const key = authored[id+'_'+direction] ? id+'_'+direction : authored[id+'_down'] ? id+'_down' : 'robot_down';
            const a = authored[key]; if (!a) return;
            const h = 100, w = h*a.sw/a.sh;
            ctx.save(); if (enemy) ctx.filter = 'sepia(100%) hue-rotate(-50deg) saturate(200%) brightness(.7)';
            chip(ctx,key,x-w/2,y-h+35,w,h);ctx.restore();
        }
        function draw(state) {
            const a = state.adventure, r = a.run; if (!r) return;
            const ctx = canvas.getContext('2d'), tile = 112, ox = canvas.width/2-(r.position.x+.5)*tile, oy = canvas.height/2-(r.position.y+.5)*tile;
            const roomKey = r.dungeon+':'+r.floor;
            if (room!==roomKey) { facing='down';room=roomKey; }
            const transition = [...a.events].reverse().find(e=>e.kind==='enter' || e.kind==='action'&&['up','down'].includes(e.action));
            const move = [...a.events].reverse().find(e=>e.kind==='action' && ['walk','avoid','return'].includes(e.action) && e.id>(transition?.id||0) && e.dungeon===r.dungeon && e.floor===r.floor
                && e.before && e.after && (e.before.x!==e.after.x || e.before.y!==e.after.y));
            if (move) facing=move.after.x>move.before.x?'right':move.after.x<move.before.x?'left':move.after.y>move.before.y?'down':'up';
            ctx.fillStyle='#17151c';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.imageSmoothingEnabled=false;
            r.grid.forEach((row,y)=>[...row].forEach((cell,x)=>chip(ctx,r.dungeon+'_'+(cell==='#'?'wall':'floor'),ox+x*tile,oy+y*tile,tile,tile)));
            for (const p of [r.entry,r.exit]) chip(ctx,r.dungeon+'_stair',ox+p.x*tile,oy+p.y*tile,tile,tile);
            for (const i of a.items.filter(i=>i.location==='floor' && i.dungeon===r.dungeon && i.floor===r.floor)) {
                const key='spr_item_bag';
                chip(ctx,key,ox+(i.position.x+.22)*tile,oy+(i.position.y+.15)*tile,tile*.56,tile*.65);
                const label=local(text('advItem_'+i.type)),x=ox+(i.position.x+.5)*tile,y=oy+(i.position.y+1.12)*tile;
                ctx.font='13px sans-serif';ctx.textAlign='center';const width=ctx.measureText(label).width;
                ctx.fillStyle='#16131dee';ctx.fillRect(x-width/2-4,y-13,width+8,18);ctx.fillStyle='#fff1d1';ctx.fillText(label,x,y);
            }
            if (!r.enemy.defeated) {
                const direction=Math.abs(r.position.x-r.enemy.x)>Math.abs(r.position.y-r.enemy.y)
                    ?r.position.x>r.enemy.x?'right':'left':r.position.y>r.enemy.y?'down':'up';
                actor(ctx,ox+(r.enemy.x+.5)*tile,oy+(r.enemy.y+.6)*tile,direction,true);
                if (r.enemy.phase==='ready') {ctx.strokeStyle='#ffb65b';ctx.lineWidth=3;ctx.strokeRect(ox+r.enemy.x*tile,oy+r.enemy.y*tile,tile,tile);}
            }
            actor(ctx,canvas.width/2,canvas.height/2+tile*.1,facing,false);
            const title=api.dungeonName(r.dungeon,window.GameI18n.language)+' B'+r.floor+'F';
            ctx.font='bold 19px sans-serif';ctx.textAlign='left';ctx.fillStyle='#16131ddd';
            ctx.fillRect(10,10,Math.min(canvas.width-20,ctx.measureText(title).width+24),38);ctx.fillStyle='#ffe2a4';ctx.fillText(title,22,36);
        }
        return {
            update(state, world, assets, appearance) {
                skin=appearance;
                const actor=authored[window.ExperimentalWordGrowth.visualSkin(skin)+'_down'];if(actor)image(actor.img);
                const a=state.adventure,active=!!a.run;
                line.hidden=!active && !a.connection.task && !physical.carried(a).length;
                if (active) draw(state);
                line.textContent=active ? api.dungeonName(a.run.dungeon,window.GameI18n.language)+' · '+local(text(a.run.training?'advTrainingTitle':'advExploreTitle'))+' · B'+a.run.floor+'F · '+local(text(a.damage?'advHurt':'advWell'))
                    :local(text(api.taskStatus(a)||(a.connection.task?'advStarted':a.mastery.stage===4?'advMastery':'advHelp')));
                const items=a.items.filter(i=>['hand','body','bag'].includes(i.location));
                if (items.length) line.textContent+=' / '+items.map(i=>local(text('advItem_'+i.type))+' ('+local(text('advLocation_'+i.location))+')').join(', ');
                line.setAttribute('data-i18n-skip','');canvas.setAttribute('aria-label',active?line.textContent:local(text('islandLabel')));
                if(failed) {line.hidden=false;line.textContent=local(text('failed'));}
            },
            tick(dt, holding, omakase, state, world) {
                if (holding) {elapsed=0;return;}
                if (state.adventure.run && !ready(state)) {elapsed=0;return;}
                if (!state.adventure.run || !(state.adventure.run.training&&!state.adventure.connection.trainingPaused || state.adventure.connection.goal || omakase)) {elapsed=0;return;}
                elapsed+=Math.min(.1,Math.max(0,dt));
                if (elapsed>=1.2) {elapsed=0;const next=api.choice(state,world);if(next)act(next.action,next.target,true,next.reason,next.input);}
            },
            stop() {elapsed=0;}
        };
    };
})();
