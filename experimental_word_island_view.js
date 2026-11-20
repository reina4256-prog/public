'use strict';
// Renderer-facing state only: no legacy AI constructor, update, save or offline timer.
var currentMode = 'play';
var catalog = JSON.parse(JSON.stringify(defaultCatalog));
var assets = null;
var aiPet = { x: 300, y: 200, baseType: 'robot', currentSkin: 'robot', visualScale: 1,
    actionState: 'idle', schedule: [], bgmVolume: .5 };
var floatingTexts = [];
var images = {};
var imagesLoaded = 0;
var totalImages = 0;
window.aiPet = aiPet;
window.ExperimentalWordView = function (surface, visuals, onError) {
    surface.width = 800; surface.height = 480;
    const sources = { ...imageSources };
    // Evolved images load on demand through the shared renderer's dynamic catalog.
    for (const key of ['field', 'terrain', 'field_3', 'field_4', 'field_5', 'field_6', ...Object.keys(visuals)]) {
        const img = new Image(); images[key] = img; totalImages++;
        img.onload = () => { imagesLoaded++; };
        img.onerror = () => { imagesLoaded++; onError(); };
        img.src = sources[key];
    }
    window.ExperimentalWordWorld.setNavigation(window.WordIslandNavigation.route);
    let renderedIsland = null, renderedBridge = null;
    function sceneAssets(world) {
        const island = world.island;
        if (renderedIsland === island && renderedBridge === island.bridgeOpen) return;
        renderedIsland = island; renderedBridge = island.bridgeOpen;
        assets = island.assets;
        if (!island.bridgeOpen) return;
        // Reuse the original bridge chip in the shared scene, below the actor.
        // Keep the retained water tiles and saved navigation graph unchanged.
        assets = { ...island.assets };
        const bridge = defaultCatalog.bridge, w = bridge.sw * bridge.scale, h = bridge.sh * bridge.scale;
        for (const key of island.crossing || []) {
            const tile = island.assets[key];
            assets['adventure_bridge_' + key] = { ...bridge, type: 'bridge',
                dx: tile.dx + tile.sw * tile.scale / 2 - w / 2,
                dy: tile.dy + tile.sh * tile.scale / 2 - h / 2 };
        }
    }
    this.start = function (world, skin) {
        const island = window.WordIslandNavigation.attach(world, world.island?.assets || generateNatureMap());
        renderedIsland = null; sceneAssets(world);
        aiPet.type = aiPet.currentSkin = aiPet.baseType = skin;
        aiPet.bgmVolume = world.island.volume ?? .5;
        camera.x = world.x * 800 - surface.width / 2;
        camera.y = world.y * 480 - surface.height / 2;
        window.audioManager.playBGM(skin);
    };
    this.draw = function (world, skin, reducedMotion, practice, visualElapsed = world.elapsed) {
        sceneAssets(world);
        skin = window.ExperimentalWordGrowth?.visualSkin(skin) || skin;
        aiPet.x = world.x * 800; aiPet.y = world.y * 480;
        aiPet.currentSkin = skin;
        aiPet.actionState = world.mode === 'move' ? 'moving' : 'idle';
        aiPet.visualAction = practice || (world.mode === 'work' ? window.ExperimentalWordCareers.JOBS[world.careers.current].action
            : world.mode === 'rest' ? 'sleep' : world.mode === 'eat' ? 'eat_raw' : 'idle');
        const action = world.mode === 'move' ? 'move' : aiPet.visualAction;
        const frames = aiConfigs[skin].actions[action] || aiConfigs[skin].actions.idle;
        aiPet.frameIndex = reducedMotion ? 0 : Math.floor(visualElapsed / .25) % frames.length;
        const target = world.route?.[0] || world.island.places.find(p => p.id === world.destination);
        if (world.mode === 'move' && target) aiPet.flip = target.x < world.x;
        render();
        const context = surface.getContext('2d');
        for (const p of world.island.places.filter(p => p.id.startsWith('adventure:'))) {
            if(p.id.startsWith('adventure:item:')) { context.fillStyle='#e1b66e';context.fillRect(p.x*800-camera.x-6,p.y*480-camera.y+4,12,9); }
            context.beginPath(); context.strokeStyle = '#e9cc91'; context.lineWidth = 2;
            context.ellipse(p.x * 800-camera.x,p.y * 480-camera.y+12,13,7,0,0,Math.PI*2); context.stroke();
        }
        for (const place of world.island.places.slice(3)) {
            if (world.destination === place.id && world.mode === 'move') {
                context.beginPath(); context.strokeStyle = '#ffe08a'; context.lineWidth = 2;
                context.ellipse(place.x * 800 - camera.x, place.y * 480 - camera.y + 15, 20, 8, 0, 0, Math.PI * 2); context.stroke();
            }
        }
        // Small ground markers expose real places to pointing without replacing the map art.
        for (const p of world.island.places.slice(0, 2)) {
            context.beginPath();
            context.ellipse(p.x * 800 - camera.x, p.y * 480 - camera.y + 18, 19, 8, 0, 0, Math.PI * 2);
            context.strokeStyle = world.destination === p.id && world.mode === 'move' ? '#ffe08a' : '#ffffff88';
            context.lineWidth = 2; context.stroke();
            if (p.id === 'berry:1') for (let i = 0; i < world.fruit; i++) {
                context.beginPath(); context.fillStyle = '#b34463';
                context.arc(p.x * 800 - camera.x - 10 + i * 10, p.y * 480 - camera.y + 18, 4, 0, Math.PI * 2); context.fill();
            }
        }
    };
    this.bubblePosition = () => ({ x: (aiPet.x - camera.x) / surface.width, y: (aiPet.y - camera.y - 90) / surface.height });
    this.hit = function (world, event) {
        const rect = surface.getBoundingClientRect();
        const scale = Math.min(rect.width / surface.width, rect.height / surface.height);
        const x = (event.clientX - rect.left - (rect.width - surface.width * scale) / 2) / scale + camera.x;
        const y = (event.clientY - rect.top - (rect.height - surface.height * scale) / 2) / scale + camera.y;
        const person = world.island.places.slice(3).find(p => Math.hypot(p.x * 800 - x, p.y * 480 + 15 - y) < 28);
        if (person) return person.id;
        return world.island.places.slice(0, 2).find(p => {
            const a = assets[p.assetKey];
            return Math.hypot(p.x * 800 - x, p.y * 480 + 18 - y) < 25 ||
                (x >= a.dx && x <= a.dx + a.sw * a.scale && y >= a.dy && y <= a.dy + a.sh * a.scale);
        })?.id;
    };
    this.volume = function (world, value) {
        world.island.volume = value; window.audioManager.setVolume(value);
    };
};
