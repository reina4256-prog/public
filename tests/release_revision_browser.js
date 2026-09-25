(async () => {
    const assert = (ok, message) => { if (!ok) throw Error(message); };
    window.closeLoginBonus();
    for (const button of document.querySelectorAll('.resident-overlay header button')) button.click();
    window.GameShell.syncOverlays();
    window.isGamePaused = false;
    const demo = window.DemoRules.enabled;
    let continued = false;
    window.showGameTutorial('test', 'test', () => { continued = true; });
    assert(continued && !document.getElementById('in-game-tutorial'), 'tutorial popup or lost callback');
    assert(!document.querySelector('.tutorial-highlight, #chat-tutorial-guide'), 'chat tutorial glow');
    aiPet.generation = 1; updateStatUI();
    assert(getComputedStyle(document.getElementById('btnResidents')).display === 'none', 'generation1 roster');
    aiPet.generation = 2; updateStatUI();
    assert(getComputedStyle(document.getElementById('btnResidents')).display !== 'none', 'generation2 roster');
    aiPet.generation = 1; updateStatUI();
    const aliases = window.GameCommandAliases;
    for (const display of Object.keys(GameI18n.languages)) {
        GameI18n.setLanguage(display);
        for (const inputLocale of Object.keys(GameI18n.languages)) {
            const word = window.GAME_I18N_CATALOGS[inputLocale]?.['勉強'] || '勉強';
            aiPet.apprentice.learnedWords = []; aiPet.schedule = [];
            document.getElementById('chatInput').value = word;
            window.sendChat();
            assert(aiPet.apprentice.learnedWords[0] === '勉強', display + '/' + inputLocale + ' memory: ' + JSON.stringify(aiPet.apprentice.learnedWords));
            assert(aiPet.schedule.some(task => task.type === 'study'), display + '/' + inputLocale + ' action');
        }
    }
    GameI18n.setLanguage('en');
    aiPet.apprentice.learnedWords = [];
    window.learnIndoorChatWord('勉強'); window.learnIndoorChatWord('Study');
    assert(aiPet.apprentice.learnedWords.length === 1 && aiPet.apprentice.learnedWords[0] === '勉強', 'indoor duplicate translated memories');
    const literal = 'My special friend 42';
    window.learnIndoorChatWord(literal);
    assert(aiPet.apprentice.learnedWords.includes(literal), 'free text was translated');
    const NativeSpeech = window.SpeechRecognition;
    let recognition;
    window.SpeechRecognition = class { constructor() { recognition = this; } start() {} };
    document.getElementById('voiceLanguage').value = 'ja-JP';
    aiPet.apprentice.learnedWords = []; aiPet.schedule = [];
    window.startVoiceRecognition();
    assert(recognition.lang === 'ja-JP', 'speech language override');
    recognition.onresult({ results: [[{ transcript: '勉強。' }]] });
    assert(aiPet.apprentice.learnedWords.includes('勉強') && aiPet.schedule.some(task => task.type === 'study'), 'voice transcript routing');
    window.SpeechRecognition = NativeSpeech;
    document.getElementById('voiceLanguage').value = '';
    GameI18n.setLanguage('ja');
    aiPet.schedule = [];
    if (demo) {
        const gold = aiPet.gold;
        window.checkLoginBonus(); window.progressDailyQuest('study'); window.claimDailyReward(0);
        assert(aiPet.gold === gold && !localStorage.getItem('daily_quests'), 'demo daily reward');
        for (const id of ['btnDailyQuest', 'btnMusicHall', 'btn-menu-rescue']) {
            assert(getComputedStyle(document.getElementById(id)).display === 'none', id + ' visible');
        }
        assert(!Object.values(assets).some(asset => asset.type === 'pharmacy'), 'demo pharmacy');
        aiPet.conditions = { cold: true, poisoning: true, stomachache: true }; aiPet.isSick = true;
        assert(!aiPet.isSick && !Object.values(aiPet.conditions).some(Boolean), 'demo illness');
        const age = aiPet.age, now = Date.now();
        aiPet.inventory.push({ id: 'fish', freshnessStartedAt: now - 86400000 });
        aiPet.timeProgress.checkpoint = now - 86400000;
        ScheduleRuntime.settle(now);
        assert(aiPet.age === age && aiPet.inventory.at(-1).freshnessStartedAt === now, 'offline clocks ' + JSON.stringify({ age, currentAge: aiPet.age, now, item: aiPet.inventory.at(-1), checkpoint: aiPet.timeProgress.checkpoint }));
        aiPet.inventory.pop();
    }
    return { demo, languagePairs: 49, tutorial: true, roster: true, speech: true };
})()
