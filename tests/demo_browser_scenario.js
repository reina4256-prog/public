(async () => {
    const assert = (value, message) => { if (!value) throw Error(message); };
    window.isGamePaused = true;
    if (aiPet.timeProgress?.report) aiPet.timeProgress.report.acknowledged = true;
    for (const key of ['intel', 'power', 'beauty', 'speed']) { aiPet.stats[key] = 1000; assert(aiPet.stats[key] === 150, key + ' cap'); }
    assert(aiPet.getAvailableEvolutions().length === 0, 'evolution candidate leak');
    window.openEvolutionMenu(); window.startEvolutionRoulette();
    assert(!document.getElementById('evolutionOverlay').classList.contains('active'), 'evolution menu opened');
    const deliveries = {
        explore: ['high_wood', 'high_wood', 'high_wood', 'high_stone', 'high_stone', 'high_stone'],
        farming: ['high_carrot', 'high_carrot', 'high_carrot'], fishing: ['fish_boss_river'],
        cooking: ['food_practice_great', 'food_practice_great', 'food_practice_great'],
        smithing: ['smith_art_pot', 'smith_art_pot', 'smith_art_pot'],
        building: ['build_practice_great', 'build_practice_great', 'build_practice_great']
    };
    for (const [master, items] of Object.entries(deliveries)) {
        aiPet.apprentice = { currentMaster: master, rank: { [master]: 8 }, activeQuests: [], learnedWords: [], metMasters: [master], retired: {} };
        aiPet.inventory = [...items, 'wood'];
        const quest = aiPet.getMasterQuestData(master, 8); quest.setup();
        aiPet.apprentice.activeQuests.push({ masterType: master, rank: 8, name: quest.name, desc: quest.desc, qVal: 0 });
        assert(quest.check(), master + ' Rank8 fixture');
        window.checkMasterVisit(master, 'report');
        assert(aiPet.apprentice.rank[master] === 9, master + ' report did not advance to boundary');
        assert(aiPet.apprentice.activeQuests.length === 0, master + ' report left active quest');
        assert(aiPet.inventory.length === 1 && aiPet.inventory[0] === 'wood', master + ' delivery consumption');
        window.confirmEncounter(true);
        window.checkMasterVisit(master, 'report'); window.confirmEncounter(true);
        assert(!aiPet.apprentice.isGraduated, master + ' graduated');
        assert(!aiPet.apprentice.activeQuests.length, master + ' accepted Rank9');
        assert(!aiPet.getMasterQuestData(master, 9).check(), master + ' Rank9 evaluated');
        window.openEncounterUI(master, 'test', 'quest_offer'); window.confirmEncounter(true);
        assert(!aiPet.apprentice.activeQuests.length, master + ' direct acceptance bypass');
        window.openEncounterUI(master, 'test', 'graduate_skip'); window.confirmEncounter(true);
        assert(!aiPet.apprentice.isGraduated, master + ' graduation bypass');
    }
    // A capped stat quest remains impossible, as specified.
    aiPet.apprentice.qVal = 0;
    const capped = aiPet.getMasterQuestData('explore', 1); capped.setup();
    assert(!capped.check() && aiPet.apprentice.qVal > 150, 'unexpected cap relief');
    const originalCreate = URL.createObjectURL, originalClick = HTMLAnchorElement.prototype.click;
    let exported;
    URL.createObjectURL = blob => { exported = blob; return originalCreate(blob); };
    HTMLAnchorElement.prototype.click = function () {};
    try {
        aiPet.age = 10; aiPet.lifespan = 100; aiPet.gold = 321;
        await window.DemoTransfer.exportData();
        assert(!(await exported.text()).includes('ai_pet_data_v1'), 'plaintext save leak');
        const living = await window.DemoSave.decrypt(await exported.arrayBuffer());
        aiPet.age = 100; aiPet.update();
        window.DemoTransfer.showEnd();
        assert(aiPet.demoProgress?.ended, 'live death did not end demo');
        const firstCount = window.TCG.myCollection.length;
        const memoryUid = aiPet.demoProgress.memoryCard?.uid;
        assert(memoryUid, 'no lifespan memory');
        window.DemoTransfer.showEnd(); await window.DemoTransfer.exportData();
        assert(window.TCG.myCollection.length === firstCount, 'duplicate death memory');
        const ended = await window.DemoSave.decrypt(await exported.arrayBuffer());
        assert(document.getElementById('demo-end-ui'), 'end screen missing');
        assert(!document.getElementById('inheritance-shop-ui') || getComputedStyle(document.getElementById('inheritance-shop-ui')).display === 'none', 'demo inheritance screen leak');
        return { living, ended, memoryUid };
    } finally { URL.createObjectURL = originalCreate; HTMLAnchorElement.prototype.click = originalClick; }
})()
