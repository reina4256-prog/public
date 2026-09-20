(async () => {
    const assert = (value, message) => { if (!value) throw Error(message); };
    const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
    switchMode('play');
    document.getElementById('side-panel').style.display = 'none';
    document.getElementById('canvas-wrapper').classList.remove('fullscreen-mode');
    for (const id of ['aiStatus', 'canvas-wrapper', 'gameControls', 'info-column']) {
        const node = document.getElementById(id); node.style.opacity = '1'; node.style.pointerEvents = 'auto';
    }
    window.showGameTutorial = () => {}; window.unlockTutorialEntry = () => {};
    window.triggerTCGUnlock = () => {}; window.tryTriggerConciergeHomeEncounter = () => false;
    document.getElementById('in-game-tutorial')?.remove(); isGamePaused = false;
    for (const key of Object.keys(assets)) delete assets[key];
    assets.scheduleSchool = { type: 'school', dx: 230, dy: 130, sw: 100, sh: 100, scale: .5, name: 'School' };
    Object.assign(aiPet, { x: 100, y: 170, age: 1, lifespan: 10000, energy: 100, hunger: 100,
        isSick: false, conditions: {}, buffs: {}, schedule: [], pathQueue: [], actionState: 'idle', isIndoors: false,
        isReincarnating: false, activeBooks: [], activeMonuments: [], godMode: false, gameTimer: 0 });
    aiPet.apprentice = { learnedWords: ['hello'], rank: {}, retired: {}, activeQuests: [], metMasters: [] };
    Residents.ensure(aiPet, assets);
    const plan = ScheduleCore.empty(); plan.enabled = true;
    plan.days = plan.days.map(() => [{ start: 0, end: 1440, action: 'study', destination: assets.scheduleSchool.instanceId }]);
    aiPet.routine = plan; delete aiPet.routineLive; delete aiPet.routineState;
    ScheduleRuntime.planLiveHero();
    assert(aiPet.schedule[0]?.routineKey, 'calendar queues an ordinary owned task');
    // Keep this visual regression short while executing the real update function.
    aiPet.schedule[0].duration = 60;
    const frames = new Set(); let entered = false, walked = false;
    for (let i = 0; i < 500; i++) {
        aiPet.update();
        if (aiPet.actionState === 'moving_to_enter') { walked = true; frames.add(aiPet.frameIndex); }
        if (aiPet.isIndoors) { entered = true; break; }
    }
    assert(walked && frames.size > 1, 'ordinary walking animates');
    assert(entered && aiPet.indoorTarget === assets.scheduleSchool, 'enters selected building');
    const task = aiPet.schedule[0], beforeDuration = task.duration;
    for (let i = 0; i < 25; i++) aiPet.update();
    assert(task.duration < beforeDuration && task.maxDuration > 0, 'ordinary progress timer advances');
    assert(aiPet.visualAction === 'study' && aiPet.actionState === 'inside', 'ordinary action window state');
    render();
    const pause = GameShell.acquirePause('schedule-regression');
    const frozen = task.duration;
    await wait(250);
    assert(task.duration === frozen, 'shared pause freezes routine task');
    GameShell.releasePause(pause);
    aiPet.routine.enabled = false; ScheduleRuntime.planLiveHero();
    assert(!aiPet.schedule.some(t => t.routineKey), 'disable releases only routine tasks');
    assert(aiPet.actionState === 'exiting', 'disable uses normal building exit');
    for (let i = 0; i < 25; i++) aiPet.update();
    assert(!aiPet.isIndoors, 'ordinary exit completes');
    const manual = { type: 'train', duration: 30 };
    aiPet.schedule = [manual]; aiPet.routine.enabled = true;
    ScheduleRuntime.planLiveHero();
    assert(aiPet.schedule[0] === manual && aiPet.schedule.length === 1, 'manual queue is preserved');
    aiPet.schedule = []; aiPet.pathQueue = []; aiPet.actionState = 'idle';
    aiPet.routine.enabled = false; ScheduleRuntime.planLiveHero();
    assets.scheduleHome = { type: 'hut', dx: 180, dy: 200, sw: 90, sh: 90, scale: .5, name: 'Home' };
    Residents.ensure(aiPet, assets);
    aiPet.conciergeUnlocked = true; aiPet.conciergeEncountered = true;
    const homeState = ensureMyHomeIndoorState();
    if (!homeState.objects.some(object => object.id === 'bed')) homeState.objects.push({ id: 'bed', sprite: 'hfur_bed', x: 8, y: 6, w: 1, h: 1 });
    aiPet.apprentice.learnedWords.push('\u7761\u7720');
    aiPet.routine.days = aiPet.routine.days.map(() => [{ start: 0, end: 1440, action: 'rest', destination: 'home' }]);
    aiPet.routine.enabled = true; delete aiPet.routineLive;
    ScheduleRuntime.planLiveHero();
    assert(aiPet.schedule[0]?.myHomeAction === 'bed', 'home routine uses the ordinary home entry route');
    for (let i = 0; i < 500 && !window.myHomeMapOpen; i++) aiPet.update();
    await wait(3500);
    assert(window.myHomeMapOpen, 'home central map opens');
    assert(aiPet.schedule.some(t => t.myHomeIndoor && t.routineKey && t.type === 'sleep'), 'furniture action inherits routine ownership');
    saveGameData();
    const saved = JSON.parse(localStorage.getItem('ai_pet_data_v1'));
    assert(saved.routine.enabled && saved.schedule.some(t => t.routineKey), 'active routine ownership is saved');
    return { walkingAnimation: true, selectedBuilding: true, progress: true, pause: true,
        disableExit: true, manualPriority: true, homeEntry: true, saved: true };
})();
