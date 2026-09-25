(function () {
    'use strict';
    window.ExperimentalWordView = function (canvas, visuals, onError) {
        const ctx = canvas.getContext('2d');
        const images = {};
        for (const [id, config] of Object.entries(visuals)) {
            const img = new Image(); img.src = config.image; img.onerror = onError; images[id] = img;
        }
        const field = new Image(); field.src = 'field_2.png'; field.onerror = onError;
        function sprite(image, frame, x, y, width, height) {
            if (!image.complete || !image.naturalWidth) return;
            const scale = Math.min(width / frame.sw, height / frame.sh);
            ctx.drawImage(image, frame.sx, frame.sy, frame.sw, frame.sh,
                x - frame.sw * scale / 2, y - frame.sh * scale, frame.sw * scale, frame.sh * scale);
        }
        this.draw = function (world, skin, reducedMotion = false) {
            const w = 900, h = 470;
            ctx.clearRect(0, 0, w, h);
            const sky = ctx.createLinearGradient(0, 0, 0, h);
            sky.addColorStop(0, '#d3edf0'); sky.addColorStop(.43, '#eff5d5'); sky.addColorStop(1, '#91be76');
            ctx.fillStyle = sky; ctx.fillRect(0, 0, w, h);
            ctx.fillStyle = '#9ec68a'; ctx.beginPath(); ctx.ellipse(430, 445, 600, 265, 0, 0, Math.PI * 2); ctx.fill();
            ctx.strokeStyle = '#dace9e'; ctx.lineWidth = 65; ctx.lineCap = 'round';
            ctx.beginPath(); ctx.moveTo(80, 470); ctx.bezierCurveTo(280, 350, 520, 425, 900, 350); ctx.stroke();
            sprite(field, { sx: 299, sy: 391, sw: 196, sh: 221 }, 115, 246, 155, 165);
            sprite(field, { sx: 551, sy: 440, sw: 166, sh: 153 }, 726, 261, 225, 200);
            for (let i = 0; i < 24; i++) {
                ctx.fillStyle = i % 3 ? '#72a965' : '#f5ecba';
                ctx.beginPath(); ctx.ellipse(30 + (i * 137) % 850, 270 + (i * 43) % 190, 3, 2, 0, 0, 7); ctx.fill();
            }
            // Fruit grows at one site; each picked fruit has its own learner identity.
            ctx.fillStyle = '#836047'; ctx.fillRect(247, 278, 6, 43);
            ctx.fillStyle = '#548652'; ctx.beginPath(); ctx.ellipse(250, 281, 30, 23, 0, 0, 7); ctx.fill();
            ctx.fillStyle = '#6e8d48'; ctx.beginPath(); ctx.ellipse(250, 324, 28, 12, 0, 0, 7); ctx.fill();
            for (let i = 0; i < world.fruit; i++) {
                ctx.fillStyle = '#ac4562'; ctx.beginPath(); ctx.arc(237 + i * 15, 313 - (i % 2) * 8, 9, 0, 7); ctx.fill();
            }
            const x = world.x * w, y = world.y * h;
            ctx.fillStyle = '#35563d33'; ctx.beginPath(); ctx.ellipse(x, y + 6, 32, 10, 0, 0, 7); ctx.fill();
            const action = world.mode === 'move' ? 'move' : world.mode === 'rest' ? 'sleep' : 'idle';
            const frames = visuals[skin].actions[action];
            const frame = frames[reducedMotion ? 0 : Math.floor(world.elapsed / .25) % frames.length];
            ctx.save();
            if (world.reactionTime > 0 && world.reaction === 'recognize' && world.speech?.target?.startsWith('berry:')) {
                ctx.strokeStyle = '#fff8b3'; ctx.lineWidth = 3;
                ctx.beginPath(); ctx.ellipse(250, 317, 34, 20, 0, 0, 7); ctx.stroke();
            }
            // Walking follows the destination, including when resuming an existing save.
            // Recognition may turn a stationary character, but must not reverse a walk.
            const destination = world.mode === 'move'
                ? window.ExperimentalWordWorld.PLACES.find(place => place.id === world.destination) : null;
            const faceLeft = destination ? destination.x < world.x
                : world.reactionTime > 0 && world.reaction === 'recognize'
                    && world.speech?.target?.startsWith('berry:') && world.x > .28;
            if (faceLeft) { ctx.translate(x * 2, 0); ctx.scale(-1, 1); }
            if (world.reactionTime > 0 && world.reaction === 'uncertain' && !reducedMotion) {
                ctx.translate(x, y); ctx.rotate(Math.sin(world.elapsed * 3) * .07); ctx.translate(-x, -y);
            }
            if (world.fatigue > .55 && action !== 'sleep' && !reducedMotion) {
                ctx.translate(x, y); ctx.rotate(.08); ctx.translate(-x, -y);
            }
            sprite(images[skin], frame, x, y, action === 'sleep' ? 105 : 85, action === 'sleep' ? 55 : 105);
            if (world.mode === 'eat') {
                ctx.fillStyle = '#ac4562'; ctx.beginPath();
                ctx.arc(x + 12, y - 35, reducedMotion ? 7 : 6 + Math.sin(world.elapsed * 5) * 2, 0, 7); ctx.fill();
            }
            ctx.restore();
            if (world.reactionTime > 0) {
                ctx.fillStyle = '#fffdf2'; ctx.beginPath(); ctx.arc(x + 40, y - 100, 16, 0, 7); ctx.fill();
                ctx.fillStyle = '#37594e'; ctx.font = 'bold 20px system-ui'; ctx.textAlign = 'center';
                ctx.fillText(world.reaction === 'uncertain' ? '?' : world.reaction === 'care' ? '♡' : '♪', x + 40, y - 93);
            }
        };
    };
})();
