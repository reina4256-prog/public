(async () => {
    const assert = (v, label) => { if (!v) throw Error(label); };
    const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
    switchMode('play');
    document.querySelectorAll('.resident-overlay, #in-game-tutorial').forEach(el => el.remove());
    isGamePaused = false;
    aiPet.age = 1; aiPet.lifespan = 100; aiPet.isReincarnating = false; aiPet._tutorialDone = true;
    aiPet.timeProgress = { version: 1, checkpoint: Date.now() };
    window.showGameTutorial = () => {};
    const state = Residents.ensure(aiPet, assets);
    for (let i = 0; i < 105; i++) {
        const id = 'directory-test-' + i;
        state.people[id] = { personId: id, generation: i + 1, status: 'waiting', home: null, location: null,
            profile: { name: i === 0 ? '<img src=x onerror=alert(1)>' : 'Resident ' + String(i).padStart(3, '0'), currentSkin: aiPet.currentSkin, stats: { intel: 10, power: 20, beauty: 10, speed: 10 } },
            possessions: { inventory: [], warehouse: [], freezer: [], equipment: {}, gold: 0, safeGold: 0 } };
    }
    ResidentUI.roster(); await wait(250);
    const root = document.querySelector('.resident-directory');
    assert(root.querySelectorAll('.resident-directory-row').length === 20, 'bounded list');
    const search = root.querySelector('input[type=search]');
    search.value = 'Resident 004'; search.dispatchEvent(new Event('input')); await wait(100);
    assert(root.querySelectorAll('.resident-directory-row').length === 1, 'name search');
    root.querySelector('.resident-directory-row').click();
    assert(root.querySelector('.resident-directory-detail h3').textContent === 'Resident 004', 'inline selection');
    const scroll = root.querySelector('.resident-directory-list'); scroll.scrollTop = 10;
    search.value = ''; search.dispatchEvent(new Event('input'));
    assert(root.querySelectorAll('.resident-directory-row').length === 20, 'clear search');
    root.querySelector('.resident-directory-row').click();
    const detail = root.querySelector('.resident-directory-detail').getBoundingClientRect();
    const list = root.querySelector('.resident-directory-list').getBoundingClientRect();
    assert(detail.left >= list.right, 'desktop side-by-side');
    assert(root.scrollWidth <= root.clientWidth + 2, 'no horizontal overflow');
    assert(!root.querySelector('img[src=x]'), 'names remain text');
    ScheduleUI.open('directory-test-104'); await wait(100);
    const editor = document.querySelector('.schedule-editor');
    assert(editor && GameShell.isPaused(), 'schedule editor pauses world');
    const findButton = (parent, text) => [...parent.querySelectorAll('button')].find(b => b.textContent === text);
    editor.querySelector('input[type=checkbox]').checked = true;
    findButton(editor, '追加').click();
    const row = editor.querySelector('.schedule-slot');
    const action = row.querySelector('select'); action.value = 'study'; action.dispatchEvent(new Event('change'));
    const end = editor.querySelectorAll('.schedule-slot input[type=text]')[1]; end.value = '24:00'; end.dispatchEvent(new Event('change'));
    findButton(editor, '保存前に試算').click(); await wait(100);
    const overlays = document.querySelectorAll('.resident-overlay');
    const preview = overlays[overlays.length - 1];
    assert(preview.textContent.includes('体力・満腹度不足'), 'unsafe forecast visible');
    findButton(preview, '不足する可能性を承知して保存する').click();
    assert(aiPet.residentState.people['directory-test-104'].routine.enabled, 'explicitly save unsafe routine');
    assert(JSON.parse(localStorage.getItem('ai_pet_data_v1')).residentState.people['directory-test-104'].routine.enabled, 'routine persisted');
    ScheduleUI.open('directory-test-104');
    const reopenedEditor = document.querySelector('.schedule-editor');
    assert(reopenedEditor.querySelector('input[type=checkbox]').checked, 'editor reload');
    reopenedEditor.closest('.resident-overlay').querySelector('header button').click();
    assert(GameShell.isPaused(), 'closing editor preserves directory pause');
    await wait(100);
    return { people: Object.keys(state.people).length, visibleRows: 20, search: true, inlineDetail: true, nestedPause: true };
})()
