(function () {
    'use strict';
    window.ExperimentalWordAdventureView = function (canvas, controls, text, act) {
        const api = window.ExperimentalWordAdventureConnection, physical = window.ExperimentalWordAdventure;
        const line = document.createElement('p'); line.id = 'word-adventure-status'; line.setAttribute('role','status'); controls.append(line);
        let elapsed = 0, visuals = {}, skin = 'robot';
        const images = new Map(), atlas = new Image(); atlas.src = 'dungeon_scull_mapchip.png';
        const itemLabel = type => text('advItem_' + type);
        const local = value => window.GameI18n.translate(value);
        function sprite(ctx, x, y, enemy) {
            const v = visuals[window.ExperimentalWordGrowth.visualSkin(skin)] || visuals.robot;
            if (!v) return;
            if (!images.has(v.image)) { const img = new Image(); img.src = v.image; images.set(v.image, img); }
            const img = images.get(v.image), f = v.actions.idle[0];
            if (!img.complete || !img.naturalWidth) return;
            ctx.save(); if (enemy) ctx.filter = 'sepia(100%) hue-rotate(-50deg) saturate(200%) brightness(.7)';
            ctx.drawImage(img, f.sx, f.sy, f.sw, f.sh, x - 24, y - 42, 48, 48 * f.sh / f.sw); ctx.restore();
        }
        function draw(state) {
            const r = state.adventure.run; if (!r) return;
            const ctx = canvas.getContext('2d'), tile = Math.min(canvas.width / 9, canvas.height / 7), ox = (canvas.width - tile * 9) / 2;
            ctx.fillStyle = '#17151c'; ctx.fillRect(0, 0, canvas.width, canvas.height); ctx.imageSmoothingEnabled = false;
            r.grid.forEach((row, y) => [...row].forEach((cell, x) => {
                if (atlas.complete && atlas.naturalWidth) ctx.drawImage(atlas, ...(cell === '#' ? [5,337,341,429] : [9,0,341,331]), ox+x*tile,y*tile,tile,tile);
                else { ctx.fillStyle = cell === '#' ? '#50454d' : '#29232c'; ctx.fillRect(ox+x*tile,y*tile,tile-1,tile-1); }
            }));
            for (const [p, symbol] of [[r.entry, '↑'], [r.exit, '↓']]) {
                ctx.fillStyle = '#ffe2a4'; ctx.font = 'bold 28px sans-serif'; ctx.textAlign = 'center'; ctx.fillText(symbol, ox+(p.x+.5)*tile,(p.y+.7)*tile);
            }
            for (const i of state.adventure.items.filter(i => i.location === 'floor' && i.dungeon === r.dungeon && i.floor === r.floor)) {
                ctx.fillStyle = '#e1b66e'; ctx.fillRect(ox+(i.position.x+.3)*tile,(i.position.y+.4)*tile,tile*.4,tile*.3);
            }
            if (!r.enemy.defeated) {
                sprite(ctx, ox+(r.enemy.x+.5)*tile,(r.enemy.y+.6)*tile,true);
                if (r.enemy.phase === 'ready') { ctx.strokeStyle = '#ffb65b'; ctx.lineWidth = 3; ctx.strokeRect(ox+r.enemy.x*tile,r.enemy.y*tile,tile,tile); }
            }
            sprite(ctx, ox+(r.position.x+.5)*tile,(r.position.y+.6)*tile,false);
        }
        return {
            update(state, world, assets, appearance) {
                visuals = assets || visuals; skin = appearance;
                const a = state.adventure, active = !!a.run;
                line.hidden = !active && !a.connection.task && !physical.carried(a).length;
                if (active) draw(state);
                line.textContent = active ? api.dungeonName(a.run.dungeon,window.GameI18n.language) + ' · ' + local(text(a.run.training ? 'advTrainingTitle' : 'advExploreTitle')) + ' · ' + a.run.floor
                    + ' · ' + local(text(a.damage ? 'advHurt' : 'advWell')) : local(text(api.taskStatus(a) || (a.connection.task ? 'advStarted' : a.mastery.stage === 4 ? 'advMastery' : 'advHelp')));
                const items = a.items.filter(i => ['hand','body','bag'].includes(i.location));
                if (items.length) line.textContent += ' / ' + items.map(i => local(itemLabel(i.type)) + ' (' + local(text('advLocation_'+i.location)) + ')').join(', ');
                line.setAttribute('data-i18n-skip','');
                canvas.setAttribute('aria-label', active ? line.textContent : local(text('islandLabel')));
            },
            tick(dt, holding, omakase, state, world) {
                if (holding) { elapsed = 0; return; }
                if (!state.adventure.run || !(state.adventure.run.training && !state.adventure.connection.trainingPaused || state.adventure.connection.goal || omakase)) { elapsed = 0; return; }
                elapsed += Math.min(.1, Math.max(0,dt));
                if (elapsed >= 1.2) { elapsed = 0; const next = api.choice(state, world); if (next) act(next.action, next.target, true, next.reason, next.input); }
            },
            stop() { elapsed = 0; }

        };
    };
})();
