(async () => {
    const assert = (value, message) => { if (!value) throw Error(message); };
    switchMode('play');
    window.showGameTutorial = () => {}; window.unlockTutorialEntry = () => {};
    window.triggerTCGUnlock = () => {};
    document.getElementById('in-game-tutorial')?.remove(); isGamePaused = false;
    const pause = GameShell.acquirePause('craft-test-clock');
    for (const key of Object.keys(assets)) delete assets[key];
    assets.pharmacy_1 = { type: 'building', dx: 230, dy: 130, sw: 100, sh: 100, scale: .5, name: 'Pharmacy' };
    assets.hut_1 = { type: 'hut', dx: 100, dy: 200, sw: 90, sh: 90, scale: .5, name: 'Home' };
    assets.hut_2 = { type: 'hut', dx: 100, dy: 300, sw: 90, sh: 90, scale: .5, name: 'Resident home' };
    Object.assign(aiPet, { x: 100, y: 170, age: 1, lifespan: 10000, energy: 100, hunger: 100, inventory: [],
        isSick: false, conditions: {}, buffs: {}, schedule: [], pathQueue: [], actionState: 'idle', isIndoors: false,
        isReincarnating: false, activeBooks: [], activeMonuments: [], godMode: false, gameTimer: 0,
        routine: ScheduleCore.empty(), skills: {} });
    aiPet.apprentice = { learnedWords: ['hello'], rank: { pharmacist: 2 }, retired: {},
        activeQuests: [{ masterType: 'pharmacist', rank: 2, qVal: 0 }], metMasters: ['pharmacist'] };
    Residents.ensure(aiPet, assets);
    const originalStart = CraftCore.start;
    CraftCore.start = (person, action, target, options) => originalStart(person, action, target, { ...options, random: () => 0 });
    let walked = false, indoors = false, progress = false;
    try {
        for (let unit = 0; unit < 3; unit++) {
            aiPet.inventory.push('herb', 'water');
            const task = { type: 'mix', duration: CraftCore.durationSeconds, craftTarget: 'item_medicine_cold' };
            aiPet.schedule.push(task);
            for (let frame = 0; frame < 1800 && aiPet.schedule.includes(task); frame++) {
                aiPet.update();
                walked ||= aiPet.actionState === 'moving_to_enter';
                indoors ||= aiPet.isIndoors;
                progress ||= task.duration > 0 && task.duration < 30 && aiPet.visualAction === 'cook';
            }
            assert(!aiPet.schedule.includes(task), 'ordinary mixing finishes');
        }
    } finally { CraftCore.start = originalStart; }
    assert(walked && indoors && progress, 'ordinary route, entry, animation and progress');
    assert(aiPet.apprentice.activeQuests[0].qVal === 3, 'three Rank 2 successes');
    assert(aiPet.inventory.filter(item => (typeof item === 'string' ? item : item.id) === 'item_medicine_cold').length === 3, 'actual material conversion');
    const state = Residents.ensure(aiPet, assets), id = 'person:craft-browser';
    const person = { personId: id, status: 'resident', generation: 2,
        home: { buildingId: assets.hut_2.instanceId, slot: 0 }, location: { kind: 'island', x: 100, y: 170 },
        profile: { name: 'Craft resident', currentSkin: aiPet.currentSkin, energy: 100, hunger: 100,
            stats: { intel: 50, beauty: 50, power: 20, speed: 20, mood: 80 }, skills: {},
            apprentice: { rank: { pharmacist: 2 }, activeQuests: [{ masterType: 'pharmacist', rank: 2, qVal: 0 }] } },
        possessions: { inventory: ['herb', 'water'], freezer: [], warehouse: [], equipment: {}, gold: 0, safeGold: 0 } };
    state.people[id] = person; state.homes[assets.hut_2.instanceId].slots[0] = id;
    const plan = ScheduleCore.empty(); plan.enabled = true;
    plan.days = plan.days.map(() => [{ start: 0, end: 1440, action: 'mix', destination: assets.pharmacy_1.instanceId, craftTarget: 'item_medicine_cold' }]);
    person.routine = plan;
    const now = Date.now(), snapshot = ScheduleCore.clone(aiPet);
    ScheduleRuntime.simulate(snapshot, assets, now, now + 15000, false);
    const savedPerson = snapshot.residentState.people[id];
    assert(savedPerson.routineState.craft && !savedPerson.routineState.craft.effectsApplied, 'in-progress personal result is stored');
    assert(savedPerson.possessions.inventory.length === 0 && !savedPerson.profile.skills.mixing, 'materials consumed once, result pending');
    aiPet.residentState = snapshot.residentState;
    aiPet.timeProgress = { version: 1, checkpoint: now + 15000 };
    Residents.saveWorld(aiPet, assets);
    localStorage.setItem('craft_test_checkpoint', String(now + 15000));
    ScheduleUI.open(id);
    const editor = document.querySelector('.schedule-editor');
    assert([...editor.querySelectorAll('option')].some(option => option.value === 'mix'), 'resident editor offers mixing');
    assert([...editor.querySelectorAll('option')].some(option => option.value === 'item_medicine_cold'), 'resident editor offers recipe selection');
    assert(GameShell.isPaused(), 'editor keeps shared pause');
    // Keep the editor visible for its screenshot; reload removes test-only pause.
    return { walked, indoors, progress, rank2Successes: 3, residentSaved: true, editor: true, pause: !!pause };
})();
