(function () {
    'use strict';
    window.ExperimentalWordAdventureView = function (canvas, controls, text, submit, act, stop) {
        const api = window.ExperimentalWordAdventureConnection, physical = window.ExperimentalWordAdventure;
        const panel = document.createElement('details'); panel.id = 'word-adventure'; controls.append(panel);
        const heading = document.createElement('summary'); heading.textContent = text('advTitle'); panel.append(heading);
        const line = document.createElement('p'); line.textContent = text('advHelp'); panel.append(line);
        const select = document.createElement('select'); select.id = 'adventure-command'; select.setAttribute('aria-label', text('advTitle')); panel.append(select);
        const button = (id, label, fn) => { const b = document.createElement('button'); b.id = id; b.type = 'button'; b.textContent = text(label); b.addEventListener('click', fn); panel.append(b); return b; };
        button('adventure-request', 'advAsk', () => submit(select.value));
        button('adventure-stop', 'advStop', stop);
        const inventory = document.createElement('select'); inventory.id = 'adventure-inventory'; inventory.setAttribute('aria-label', text('advItems')); panel.append(inventory);
        const itemActions = document.createElement('span'); panel.append(itemActions);
        for (const action of ['equip', 'use', 'pick', 'drop', 'store', 'take']) {
            const b = button('adventure-' + action, 'adv_' + action, () => act(action, inventory.value)); itemActions.append(b);
        }
        const dungeonControls = document.createElement('span'); panel.append(dungeonControls);
        for (const action of ['observe', 'walk', 'attack', 'avoid', 'return', 'down', 'up']) {
            const b = button('adventure-' + action, 'adv_' + action, () => act(action)); dungeonControls.append(b);
        }
        const auto = button('adventure-auto', 'dungeonAuto', () => { running = !running; auto.setAttribute('aria-pressed', String(running)); });
        let running = false, elapsed = 0, visuals = {}, skin = 'robot', lastInventory = '', lastLocale = '', active = false;
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
                visuals = assets || visuals; skin = appearance; active = !!state.adventure.run;
                const a = state.adventure, locale = window.GameI18n.language;
                if (locale !== lastLocale) {
                    const value = select.selectedIndex; select.replaceChildren();
                    for (const value of api.commands[locale] || api.commands.en) { const o = document.createElement('option'); o.value = value; o.textContent = value; o.setAttribute('data-i18n-skip', ''); select.append(o); }
                    select.selectedIndex = Math.max(0,value); lastLocale = locale; lastInventory = '';
                }
                const items = a.items.filter(i => ['hand','body','bag','home'].includes(i.location) || !a.run && i.location==='ground' || a.run && i.location === 'floor' && i.dungeon === a.run.dungeon && i.floor === a.run.floor);
                const signature = JSON.stringify(items);
                if (signature !== lastInventory) {
                    const value = inventory.value; inventory.replaceChildren();
                    for (const i of items) { const o = document.createElement('option'); o.value = i.id;
                        o.textContent = local(itemLabel(i.type)) + ' · ' + local(text('advLocation_' + i.location)); o.setAttribute('data-i18n-skip',''); inventory.append(o); }
                    if (items.some(i => i.id === value)) inventory.value = value;
                    lastInventory = signature;
                }
                dungeonControls.hidden = auto.hidden = !active;
                auto.setAttribute('aria-pressed', String(running));
                if (active) { panel.open = true; draw(state); }
                else running = false;
                line.textContent = active ? local(text(a.run.training ? 'advTrainingTitle' : 'advExploreTitle')) + ' · ' + a.run.floor
                    + ' · ' + local(text(a.damage ? 'advHurt' : 'advWell')) : local(text(a.connection.task ? 'advStarted' : a.mastery.stage === 4 ? 'advMastery' : 'advHelp'));
                if(active && a.run.training) {
                    const lessons={1:['adv_observe','adv_walk'],2:['adv_observe','adv_attack','adv_avoid'],
                        3:['adv_equip','advItem_stick','advItem_shield','adv_use','advItem_ration','advItem_cloth'],
                        4:['adv_return'],5:['adv_walk','adv_use','adv_return']};
                    line.textContent+=' · '+lessons[a.run.floor].map(key=>local(text(key))).join(' / ');
                }
                line.setAttribute('data-i18n-skip','');
                canvas.setAttribute('aria-label', local(text(active ? 'dungeonTitle' : 'islandLabel')));
            },
            tick(dt, holding, omakase, state, world) {
                if (holding) { elapsed = 0; return; }
                if (!state.adventure.run || !(running || omakase)) { elapsed = 0; return; }
                elapsed += Math.min(.1, Math.max(0,dt));
                if (elapsed >= 1.2) { elapsed = 0; const next = api.choice(state, world); if (next) act(next.action, next.target, true); }
            },
            hit(event, state) {
                const r = state.adventure.run; if (!r) return;
                const rect = canvas.getBoundingClientRect(), scale = Math.min(rect.width/canvas.width,rect.height/canvas.height), tile = Math.min(canvas.width/9,canvas.height/7);
                const x = (event.clientX-rect.left-(rect.width-canvas.width*scale)/2)/scale, y = (event.clientY-rect.top-(rect.height-canvas.height*scale)/2)/scale;
                act('walk', { x:Math.floor((x-(canvas.width-tile*9)/2)/tile),y:Math.floor(y/tile) });
            },
            stop() { running = false; elapsed = 0; auto.setAttribute('aria-pressed','false'); },
            get selection() { return inventory.value; }
        };
    };
})();
