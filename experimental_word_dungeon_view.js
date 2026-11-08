(function () {
    'use strict';
    window.ExperimentalWordDungeonView = function (canvas, stage, controls, text, onAction, onPoint, onReturn, canAct) {
        const model = window.ExperimentalWordDungeonLearning;
        const atlas = new Image(); atlas.src = 'dungeon_scull_mapchip.png';
        const sprites = new Map();
        let session = null, visuals, appearance, running = false, elapsed = 0, camera = { x: 0, y: 0, tile: 112 };
        const hud = document.createElement('div'); hud.className = 'word-dungeon-hud'; hud.hidden = true; stage.append(hud);
        const title = document.createElement('strong'); title.textContent = text('dungeonTitle'); hud.append(title);
        const selection = document.createElement('p'); selection.id = 'dungeon-selection'; hud.append(selection);
        const buttons = document.createElement('div'); buttons.className = 'word-dungeon-buttons'; buttons.hidden = true; stage.append(buttons);
        const make = (id, label, parent, click) => { const button = document.createElement('button'); button.type = 'button';
            button.id = id; button.textContent = text(label); button.addEventListener('click', click); parent.append(button); return button; };
        make('dungeon-return', 'dungeonReturn', buttons, onReturn);
        const auto = make('dungeon-auto', 'dungeonAuto', buttons, () => { if (!canAct()) return; running = !running; auto.setAttribute('aria-pressed', String(running)); });
        const panel = document.createElement('div'); panel.className = 'word-dungeon-controls'; panel.hidden = true; controls.prepend(panel);
        make('dungeon-step', 'dungeonStep', panel, () => { if (!canAct()) return; running = false; onAction(model.advance(session)); });
        const guide = document.createElement('p'); guide.textContent = text('dungeonGuide'); panel.append(guide);
        function point(id) { running = false; model.perceive(session, id); draw(); onPoint(); }
        function sprite(id, x, y, enemy) {
            const entry = visuals[id] || visuals.robot;
            if (!sprites.has(entry.image)) { const img = new Image(); img.src = entry.image; sprites.set(entry.image, img); }
            const img = sprites.get(entry.image), frame = entry.actions.idle[0], ctx = canvas.getContext('2d');
            const h = 105, w = h * frame.sw / frame.sh;
            ctx.save();
            if (enemy) ctx.filter = 'sepia(100%) hue-rotate(-50deg) saturate(200%) brightness(0.7)';
            if (img.complete && img.naturalWidth) ctx.drawImage(img, frame.sx, frame.sy, frame.sw, frame.sh, x - w / 2, y - h + 35, w, h);
            ctx.restore();
        }
        function draw() {
            const ctx = canvas.getContext('2d'), tile = camera.tile;
            camera.x = canvas.width / 2 - (session.position.x + .5) * tile;
            camera.y = canvas.height / 2 - (session.position.y + .5) * tile;
            ctx.fillStyle = '#16151d'; ctx.fillRect(0, 0, canvas.width, canvas.height); ctx.imageSmoothingEnabled = false;
            model.grid.forEach((row, y) => [...row].forEach((cell, x) => {
                const dx = camera.x + x * tile, dy = camera.y + y * tile;
                if (atlas.complete && atlas.naturalWidth) {
                    const crop = cell === '#' ? [5, 337, 341, 429] : [9, 0, 341, 331];
                    ctx.drawImage(atlas, ...crop, dx, dy, tile, tile);
                } else { ctx.fillStyle = cell === '#' ? '#322f35' : '#20212b'; ctx.fillRect(dx, dy, tile - 2, tile - 2); }
            }));
            const center = obj => ({ x: camera.x + (obj.x + .5) * tile, y: camera.y + (obj.y + .5) * tile });
            const exit = center(model.objects[1]);
            if (atlas.complete && atlas.naturalWidth) ctx.drawImage(atlas, 448, 1168, 341, 376,
                exit.x - tile / 2, exit.y - tile / 2, tile, tile);
            const enemy = center(model.objects[0]); sprite(appearance, enemy.x, enemy.y, true);
            const actor = center(session.position); sprite(appearance, actor.x, actor.y, false);
            const focus = model.objects.find(o => o.id === (session.proposal || session.attention));
            if (focus) { const p = center(focus); ctx.strokeStyle = '#00d8ed'; ctx.lineWidth = 3; ctx.strokeRect(p.x - 48, p.y - 72, 96, 110); }
            selection.textContent = text(session.proposal ? 'dungeonProposal' : 'dungeonPoint');
            auto.disabled = session.complete; document.getElementById('dungeon-step').disabled = session.complete;
            auto.setAttribute('aria-pressed', String(running));
        }
        return {
            enter(value, images, actor) { session = value; visuals = images; appearance = actor; running = false; elapsed = 0;
                hud.hidden = buttons.hidden = panel.hidden = false; stage.classList.add('word-dungeon-stage'); draw(); },
            leave() { running = false; session = null; hud.hidden = buttons.hidden = panel.hidden = true; stage.classList.remove('word-dungeon-stage'); },
            tick(dt, holding) { if (holding || document.hidden) running = false;
                if (running && !session.complete) { elapsed += Math.min(dt, .1); if (elapsed >= .85) { elapsed = 0; onAction(model.advance(session)); } }
                if (session.complete) running = false; draw(); },
            stop() { running = false; },
            bubbleTop() { return Math.max(stage.clientHeight * .18, hud.offsetTop + hud.offsetHeight + 12); },
            refresh: draw,
            hit(event) { const rect = canvas.getBoundingClientRect(), scale = Math.min(rect.width / canvas.width, rect.height / canvas.height);
                const x = (event.clientX - rect.left - (rect.width - canvas.width * scale) / 2) / scale;
                const y = (event.clientY - rect.top - (rect.height - canvas.height * scale) / 2) / scale;
                const object = model.objects.find(o => Math.abs(x - (camera.x + (o.x + .5) * camera.tile)) < 52
                    && Math.abs(y - (camera.y + (o.y + .5) * camera.tile)) < 75);
                if (object) point(object.id); }
        };
    };
})();
