(function () {
    'use strict';
    const R = window.Residents;
    const t = text => window.translateGameText ? window.translateGameText(text) : text;
    const element = (tag, text, parent) => {
        const node = document.createElement(tag);
        if (text !== undefined) node.textContent = t(text);
        if (parent) parent.appendChild(node);
        return node;
    };
    const name = person => person.profile.name || person.profile.petName ||
        ((typeof monsterBookData !== 'undefined' && monsterBookData[person.profile.currentSkin]?.name)
            ? t(monsterBookData[person.profile.currentSkin].name) : person.profile.currentSkin || 'robot');
    function literal(tag, value, parent) {
        const node = element(tag, undefined, parent); node.dataset.i18nSkip = ''; node.textContent = String(value); return node;
    }
    function button(parent, label, action) { const node = element('button', label, parent); node.type = 'button'; node.onclick = action; return node; }
    function modal(title) {
        const root = element('div'); root.className = 'overlay active resident-overlay';
        const card = element('section', undefined, root); card.className = 'resident-card'; card.setAttribute('role', 'dialog'); card.setAttribute('aria-modal', 'true');
        const header = element('header', undefined, card); element('h2', title, header);
        const close = () => { root.remove(); window.GameShell.endExclusive(root); };
        button(header, '閉じる', close);
        root.addEventListener('keydown', event => { if (event.key === 'Escape') { event.preventDefault(); close(); } event.stopPropagation(); });
        document.body.appendChild(root); window.GameShell.beginExclusive(root, 'residents');
        return { root, card, close };
    }
    function notify(message, retry) {
        const view = modal('お知らせ'); element('p', message, view.card);
        if (retry) button(view.card, '保存', () => { view.close(); retry(); });
    }
    function safe(action) {
        try { action(); } catch (error) { console.error(error); notify('保存できませんでした。もう一度お試しください。'); }
    }
    function place(person) {
        if (person.status === 'waiting') return '入居待ち';
        const phase = person.activity?.phase;
        if (phase === 'scheduled') {
            if (person.routineState?.path?.length) return '移動中';
            if (person.routineState?.failed) return '待機中';
            if (person.routineState?.completed) return '待機中';
            return { rest: '睡眠', study: '勉強', train: '筋トレ', run: 'ランニング', eat: '食事', mix: '調合', tailor: '裁縫' }[person.routineState?.action] || '待機中';
        }
        if (phase === 'work') return { fish: '釣り中', mix: '調合', tailor: '裁縫' }[person.activity.job] || '採集中';
        if (phase === 'enter') return '入場中';
        if (phase === 'exit') return '退場中';
        if (phase === 'return' || phase === 'bed') return '帰宅中';
        if (phase === 'blocked') return '経路を確認中';
        return person.location?.kind === 'island' ? '移動中' : '在宅';
    }
    function portrait(person, parent) {
        const canvas = element('canvas', undefined, parent);
        canvas.width = canvas.height = 128; canvas.className = 'resident-portrait';
        canvas.setAttribute('role', 'img'); canvas.setAttribute('aria-label', name(person));
        const paint = () => {
            if (!canvas.isConnected) return;
            const ctx = canvas.getContext('2d'); ctx.clearRect(0, 0, 128, 128);
            ctx.save(); ctx.filter = `hue-rotate(${Number(person.profile.cosmetic?.hue) || 0}deg)`;
            if (typeof drawCharacterSprite === 'function') drawCharacterSprite(ctx, person.profile.currentSkin || 'robot', 64, 64, 110, 110, false, 1, false);
            ctx.restore();
            window.drawCosmeticAuraOnContext?.(ctx, person.profile, 64, 64, 110, 110);
            requestAnimationFrame(paint);
        };
        requestAnimationFrame(paint);
    }
    function groupedItems(items) {
        const groups = new Map();
        const stable = value => value && typeof value === 'object'
            ? Array.isArray(value) ? value.map(stable) : Object.fromEntries(Object.keys(value).sort().map(key => [key, stable(value[key])])) : value;
        for (const item of items || []) {
            if (!item) continue;
            // Preserve quality, freshness, durability and custom metadata distinctions.
            const displayIdentity = typeof item === 'string' ? { id: item } : { ...item };
            if (typeof itemCatalog !== 'undefined' && itemCatalog[displayIdentity.id]?.type === 'material') {
                delete displayIdentity.age;
                delete displayIdentity.instanceId;
            }
            const key = JSON.stringify(stable(displayIdentity));
            const group = groups.get(key);
            if (group) group.count++;
            else groups.set(key, { item, count: 1 });
        }
        return [...groups.values()];
    }
    function showPerson(personId, storageKind, container) {
        const person = window.aiPet.residentState.people[personId]; if (!person) return;
        const view = container ? { card: container } : modal('住人情報');
        if (container) container.replaceChildren();
        const sheet = element('article', undefined, view.card); sheet.className = 'resident-record-sheet';
        view.card = sheet;
        const caption = element('div', undefined, sheet); caption.className = 'resident-record-caption';
        element('span', '住人情報', caption); literal('small', t('世代') + ' ' + person.generation, caption);
        const identity = element('div', undefined, sheet); identity.className = 'resident-record-identity';
        const fields = element('dl', undefined, identity); fields.className = 'resident-record-fields';
        element('dt', '名前', fields); const personName = element('dd', undefined, fields); literal('h3', name(person), personName);
        element('dt', '世代', fields); literal('dd', person.generation, fields);
        const homes = Object.entries(window.aiPet.residentState.homes || {}).filter(([, home]) => home.role === 'resident');
        element('dt', '住居', fields);
        literal('dd', person.home ? t('小屋') + ' ' + (homes.findIndex(([id]) => id === person.home.buildingId) + 1) + ' · ' + (person.home.slot + 1) : t('入居待ち'), fields);
        element('dt', '現在地', fields); element('dd', place(person), fields);
        const photo = element('div', undefined, identity); photo.className = 'resident-record-photo'; portrait(person, photo);
        const target = Object.values(assets).find(a => a.instanceId === person.activity?.targetId);
        if (target) {
            element('dt', '行き先', fields);
            literal('dd', t(target.name || (typeof facilityData !== 'undefined' && facilityData[person.activity.facility]?.name) || person.activity.facility), fields);
        }
        const stats = element('dl', undefined, sheet); stats.className = 'resident-record-stats';
        for (const [label, value] of [['知力', person.profile.stats?.intel || 0], ['力', person.profile.stats?.power || 0],
            ['素早さ', person.profile.stats?.speed || 0], ['美しさ', person.profile.stats?.beauty || 0]]) {
            element('dt', label, stats); literal('dd', value, stats);
        }
        const careerSection = element('section', undefined, sheet); careerSection.className = 'resident-record-section';
        const wordsSection = element('section', undefined, sheet); wordsSection.className = 'resident-record-section';
        const funds = element('dl', undefined, sheet); funds.className = 'resident-record-stats';
        for (const [label, value] of [['所持金', person.possessions.gold], ['金庫', person.possessions.safeGold]]) {
            element('dt', label, funds); literal('dd', value, funds);
        }
        const itemName = item => {
            const key = typeof item === 'string' ? item : item.id;
            return typeof window.getInventoryItemName === 'function' ? window.getInventoryItemName(item) : t((typeof itemCatalog !== 'undefined' && itemCatalog[key]?.name) || key || '');
        };
        const catalogs = { inventory: '持ち物', warehouse: '倉庫', freezer: '冷凍庫', equipment: '装備' };
        for (const [kind, label] of Object.entries(catalogs)) {
            if (storageKind && storageKind !== kind) continue;
            const items = kind === 'equipment' ? Object.values(person.possessions.equipment) : person.possessions[kind];
            const section = element('section', undefined, sheet); section.className = 'resident-record-section';
            element('h4', label, section);
            if (!items?.length) element('p', '空です', section);
            else {
                const list = element('ul', undefined, section); list.className = 'resident-items';
                for (const group of groupedItems(items)) {
                    const row = element('li', undefined, list);
                    literal('span', itemName(group.item), row); literal('strong', '×' + group.count.toLocaleString(), row);
                }
            }
        }
        const words = person.profile.apprentice?.learnedWords || [];
        element('h4', '習得した言葉', wordsSection); literal('p', words.length ? words.map(word => t(word)).join(' / ') : '—', wordsSection);
        element('h4', '職業ライセンス', careerSection);
        const careers = { explore: '冒険家', farming: '農家', fishing: '漁師', cooking: '料理人', smithing: '鍛冶師', building: '建築士',
            pharmacist: '薬剤師', tailor: '仕立屋', pastry_chef: 'パティシエ', hairdresser: '美容師', concierge: 'コンシェルジュ', dealer: 'ディーラー' };
        const careerList = element('ul', undefined, careerSection); careerList.className = 'resident-record-careers';
        for (const [key, label] of Object.entries(careers)) {
            const rank = person.profile.apprentice?.rank?.[key] || 0;
            const mastered = person.profile.apprentice?.retired?.[key] || rank >= 10;
            if (rank || mastered) literal('li', t(label) + ' · ' + (mastered ? t('免許皆伝') : 'Rank ' + rank), careerList);
        }
        if (!careerList.children.length) literal('li', '—', careerList);
        if (person.home && person.location?.kind === 'home' && window.getVisitedResidentHomeId?.() === person.home.buildingId) {
            button(view.card, '部屋テーマ', () => {
                const choice = modal('部屋テーマ');
                for (const [key, label, hue] of [['auto', 'おまかせ', (person.generation * 67) % 360], ['forest', '森', 110], ['sea', '海', 205], ['sunset', '夕焼け', 25]]) {
                    button(choice.card, label, () => safe(() => {
                        const draft = JSON.parse(JSON.stringify(window.aiPet));
                        draft.residentState.people[personId].roomTheme = { id: key, hue };
                        R.saveWorld(draft, assets); window.aiPet.residentState = draft.residentState; choice.close(); window.renderResidentHome?.();
                    }));
                }
            });
        }
    }
    function roster() {
        const state = R.ensure(window.aiPet, assets);
        const view = modal('住人名簿');
        view.card.classList.add('resident-directory');
        const people = Object.values(state.people);
        const homes = Object.entries(state.homes).filter(([, home]) => home.role === 'resident');
        const tabs = element('nav', undefined, view.card); tabs.className = 'resident-directory-tabs';
        const peopleTab = button(tabs, '住人名簿', () => activate(false));
        const homesTab = button(tabs, '住人用小屋', () => activate(true));
        const directory = element('div', undefined, view.card); directory.className = 'resident-directory-content';
        const housing = element('div', undefined, view.card); housing.className = 'resident-directory-housing'; housing.hidden = true;
        const toolbar = element('div', undefined, directory); toolbar.className = 'resident-directory-toolbar';
        const search = element('input', undefined, toolbar); search.type = 'search';
        search.placeholder = t('名前で検索'); search.setAttribute('aria-label', t('名前で検索'));
        const filter = element('select', undefined, toolbar); filter.setAttribute('aria-label', t('入居状況'));
        for (const [value, label] of [['all', 'すべて'], ['housed', '入居中'], ['waiting', '入居待ち']]) {
            const option = element('option', label, filter); option.value = value;
        }
        const order = element('select', undefined, toolbar); order.setAttribute('aria-label', t('並べ替え'));
        for (const [value, label] of [['new', '世代の新しい順'], ['old', '世代の古い順'], ['name', '名前順']]) {
            const option = element('option', label, order); option.value = value;
        }
        const count = literal('span', '', toolbar); count.setAttribute('aria-live', 'polite');
        const split = element('div', undefined, directory); split.className = 'resident-directory-split';
        const left = element('div', undefined, split); left.className = 'resident-directory-list';
        const listCaption = element('div', undefined, left); listCaption.className = 'resident-list-caption';
        element('span', '住人名簿', listCaption); listCaption.appendChild(count);
        left.appendChild(toolbar);
        const columns = element('div', undefined, left); columns.className = 'resident-list-columns'; columns.setAttribute('aria-hidden', 'true');
        literal('span', '', columns);
        literal('span', t('名前') + ' / ' + t('世代'), columns);
        literal('span', t('住居') + ' / ' + t('現在地'), columns);
        const list = element('div', undefined, left); list.setAttribute('role', 'list');
        const pager = element('div', undefined, left); pager.className = 'resident-directory-pager';
        const detail = element('section', undefined, split); detail.className = 'resident-directory-detail';
        detail.setAttribute('aria-label', t('住人情報'));
        let selected = null, page = 0;
        const pageSize = 20;
        function homeLabel(person) {
            if (!person.home) return t('入居待ち');
            return t('小屋') + ' ' + (homes.findIndex(([id]) => id === person.home.buildingId) + 1) + ' · ' + (person.home.slot + 1);
        }
        function selectPerson(person) {
            selected = person.personId;
            showPerson(selected, undefined, detail);
            const controls = element('div'); controls.className = 'resident-directory-assignment';
            detail.prepend(controls);
            button(controls, '一覧へ戻る', () => { split.classList.remove('show-detail'); list.querySelector('[aria-current="true"]')?.focus(); });
            const choose = element('select', undefined, controls); choose.setAttribute('aria-label', t('入居先'));
            const waiting = element('option', '入居待ち', choose); waiting.value = '';
            for (const [index, [id, home]] of homes.entries()) home.slots.forEach((occupant, slot) => {
                const option = element('option', undefined, choose); option.value = id + '/' + slot;
                option.dataset.i18nSkip = '';
                option.textContent = t('小屋') + ' ' + (index + 1) + ' · ' + (slot + 1) + ' · ' + (occupant ? name(state.people[occupant]) : t('空室'));
                option.selected = person.home?.buildingId === id && person.home?.slot === slot;
            });
            button(controls, '入居先を変更', () => safe(() => {
                const parts = choose.value.split('/');
                R.assignHome(window.aiPet, assets, selected, parts[0] || null, Number(parts[1]));
                // Assignment commits replace residentState; refresh references without rebuilding the modal.
                Object.assign(state, window.aiPet.residentState);
                people.splice(0, people.length, ...Object.values(state.people));
                homes.splice(0, homes.length, ...Object.entries(state.homes).filter(([, home]) => home.role === 'resident'));
                selectPerson(state.people[selected]); renderList(); window.renderResidentHome?.();
            }));
            if (window.ScheduleUI) button(controls, '日課', () => window.ScheduleUI.open(selected));
            split.classList.add('show-detail');
            for (const row of list.querySelectorAll('[data-person-id]')) row.setAttribute('aria-current', String(row.dataset.personId === selected));
        }
        function renderList() {
            const query = search.value.trim().toLocaleLowerCase();
            const filtered = people.filter(p => (!query || name(p).toLocaleLowerCase().includes(query)) &&
                (filter.value === 'all' || (filter.value === 'housed' ? !!p.home : !p.home)));
            filtered.sort((a, b) => order.value === 'name' ? name(a).localeCompare(name(b)) :
                (order.value === 'old' ? 1 : -1) * (a.generation - b.generation) || a.personId.localeCompare(b.personId));
            page = Math.min(page, Math.max(0, Math.ceil(filtered.length / pageSize) - 1));
            count.textContent = filtered.length + ' / ' + people.length;
            list.replaceChildren(columns); pager.replaceChildren();
            if (!filtered.length) element('p', '該当する住人はいません。', list);
            for (const person of filtered.slice(page * pageSize, (page + 1) * pageSize)) {
                const row = button(list, '', () => selectPerson(person)); row.className = 'resident-directory-row';
                row.dataset.personId = person.personId; row.setAttribute('aria-current', String(selected === person.personId));
                portrait(person, row);
                const identity = element('span', undefined, row); literal('strong', name(person), identity);
                literal('small', t('世代') + ' ' + person.generation, identity);
                const status = element('span', undefined, row); literal('span', homeLabel(person), status); element('small', place(person), status);
            }
            const prev = button(pager, '前へ', () => { page--; renderList(); }); prev.disabled = page === 0;
            literal('span', (page + 1) + ' / ' + Math.max(1, Math.ceil(filtered.length / pageSize)), pager);
            const next = button(pager, '次へ', () => { page++; renderList(); }); next.disabled = (page + 1) * pageSize >= filtered.length;
            if (!selected && filtered.length) { selectPerson(filtered[0]); split.classList.remove('show-detail'); }
        }
        search.oninput = filter.onchange = order.onchange = () => { page = 0; renderList(); };
        function activate(showHomes) {
            if (showHomes) renderHousing();
            directory.hidden = showHomes; housing.hidden = !showHomes;
            peopleTab.setAttribute('aria-pressed', String(!showHomes)); homesTab.setAttribute('aria-pressed', String(showHomes));
        }
        renderList(); activate(false);
        if (!people.length) element('p', 'まだ住人はいません。', view.card);
        function renderHousing() {
        housing.replaceChildren();
        if (!homes.length) element('p', '２軒目以降の小屋に住人を迎えられます。', housing);
        for (const [buildingId, home] of homes) {
            const row = element('article', undefined, housing); row.className = 'resident-house-row';
            literal('h3', t('小屋') + ' ' + (homes.findIndex(([id]) => id === buildingId) + 1), row);
            literal('p', home.slots.map((id, slot) => (slot + 1) + ' · ' + (id ? name(state.people[id]) : t('空室'))).join(' / '), row);
            button(row, '訪問する', () => {
                if (window.GameShell.currentScene !== 'island') { notify('島へ戻ってから訪問してください。'); return; }
                const hut = Object.values(assets).find(a => a.instanceId === buildingId);
                if (!hut) return;
                view.close(); window.aiPet.schedule = []; window.aiPet.startBuildingInteraction(hut);
            });
        }
        button(housing, '小屋の建築を予約', () => {
            const hero = window.aiPet;
            const mastered = hero.apprentice?.retired?.building || hero.apprentice?.rank?.building >= 10;
            if (!mastered) { notify('建築士の免許皆伝が必要です。'); return; }
            hero.schedule = hero.schedule || []; hero.schedule.push({ type: 'build', targetBuilding: 'hut', duration: 60 });
            saveGameData(); view.close(); window.updateScheduleList?.();
        });
        }
    }
    const entrance = hut => ({ x: hut.dx + hut.sw * (hut.scale ?? .5) / 2, y: hut.dy + hut.sh * (hut.scale ?? .5) - 10 });
    function route(person, destination) {
        const hero = window.aiPet;
        const actor = Object.create(hero);
        Object.assign(actor, { x: person.location.x, y: person.location.y, pathQueue: [] });
        if (!actor.setDestination(destination.x, destination.y)) return false;
        person.activity.path = actor.pathQueue.map(point => ({ x: point.x, y: point.y })); return true;
    }
    function chooseDestination(person) {
        const app = person.profile.apprentice || {};
        const canExplore = app.currentMaster === 'explore' || app.rank?.explore >= 10 || app.retired?.explore;
        const canFish = person.possessions.inventory.some(item => ['rod_old', 'rod_norm', 'rod_super'].includes(typeof item === 'string' ? item : item.id));
        const options = Object.entries(assets).flatMap(([key, asset]) => {
            const facility = key.split('_')[0];
            const field = ['mountain', 'palms', 'nature'].includes(facility) ? facility : asset.type;
            if (canExplore && ['mountain', 'palms', 'nature'].includes(field)) return [{ asset, facility: field, job: 'gather' }];
            if (canFish && ['sea', 'water', 'bridge'].includes(asset.type)) return [{ asset, facility: asset.type, job: 'fish' }];
            return [];
        });
        const offset = (person.generation + (person.activity.trips || 0)) % Math.max(1, options.length);
        for (let i = 0; i < options.length; i++) {
            const option = options[(i + offset) % options.length];
            const center = entrance(option.asset);
            // Try reachable shoreline/entrance points without putting an actor in water.
            for (const delta of [0, 20, -20, 40, -40, 80, -80]) {
                const goal = { x: center.x + delta, y: center.y + Math.abs(delta) / 2 };
                if (window.aiPet.isPointOnWater(goal.x, goal.y) || !route(person, goal)) continue;
                Object.assign(person.activity, { targetId: option.asset.instanceId, facility: option.facility, job: option.job, trips: (person.activity.trips || 0) + 1 });
                return true;
            }
        }
        return false;
    }
    function finishResidentWork(person) {
        const activity = person.activity;
        if (!Object.values(assets).some(a => a.instanceId === activity.targetId)) { activity.phase = 'exit'; activity.elapsed = 0; return; }
        const season = window.aiPet.season || 'spring';
        let entries = [];
        if (activity.job === 'fish') {
            const table = activity.facility === 'sea' ? (typeof seaFishingTable !== 'undefined' ? seaFishingTable : {}) : (typeof riverFishingTable !== 'undefined' ? riverFishingTable : {});
            entries = table[season] || table.spring || [];
        } else {
            const table = typeof facilityData !== 'undefined' ? facilityData[activity.facility]?.items : null;
            const ids = Array.isArray(table) ? table : [...(table?.default || []), ...(table?.[season] || [])];
            entries = ids.map(id => ({ id, prob: 1 }));
        }
        const total = entries.reduce((sum, item) => sum + item.prob, 0);
        let roll = Math.random() * total;
        const caught = entries.find(item => (roll -= item.prob) < 0);
        const draft = JSON.parse(JSON.stringify(window.aiPet));
        const target = draft.residentState.people[person.personId];
        target.activity.phase = 'exit'; target.activity.elapsed = 0;
        if (caught) {
            const item = { id: caught.id, age: 0 };
            const catalog = typeof itemCatalog !== 'undefined' ? itemCatalog[caught.id] : null;
            if (catalog?.type === 'food') item.freshnessStartedAt = Date.now();
            target.possessions.inventory.push(catalog?.type === 'food' ? item : caught.id);
            target.activity.lastItem = caught.id;
        }
        // Commit loot and the completed phase together; reload cannot award twice.
        try {
            R.saveWorld(draft, assets);
            Object.assign(person, target);
        } catch (error) {
            activity.elapsed = 0;
            console.error(error);
            notify('保存できませんでした。もう一度お試しください。');
        }
    }
    function tick(ms) {
        if (window.GameShell.isPaused() || document.hidden || window.aiPet.isReincarnating) return;
        const scene = window.GameShell.currentScene;
        if (scene !== 'island' && scene !== 'resident-home') return;
        const state = R.ensure(window.aiPet, assets);
        for (const person of Object.values(state.people)) {
            if (!person.home || person.activity?.lockId || person.routine?.enabled) continue;
            const hut = Object.values(assets).find(a => a.instanceId === person.home.buildingId);
            if (!hut) continue;
            if (person.routineState || person.activity?.owner === 'routine' || person.activity?.phase === 'scheduled') releaseRoutine(person);
            person.activity = person.activity || { phase: 'rest', elapsed: 0, path: [] };
            if (person.activity.phase === 'resume') {
                if (person.location.kind === 'home') {
                    person.activity.phase = 'bed';
                    person.activity.path = window.residentIndoorPath?.(person.location, { x: 2 + person.home.slot * 2, y: 1 }) || [];
                } else person.activity.phase = route(person, entrance(hut)) ? 'return' : 'blocked';
            }
            const activity = person.activity; activity.elapsed += ms;
            if (person.location.kind === 'home') {
                if (activity.phase === 'rest' && activity.elapsed >= 12000 + person.home.slot * 2000) {
                    activity.phase = 'depart'; activity.elapsed = 0;
                    activity.path = window.residentIndoorPath?.(person.location, { x: 5, y: 8 }) || [];
                }
                if (activity.phase === 'depart' && activity.elapsed >= 220) {
                    activity.elapsed = 0;
                    if (activity.path.length) Object.assign(person.location, activity.path.shift());
                    else {
                        person.location = { kind: 'island', ...entrance(hut) };
                        activity.phase = 'walk';
                        let found = chooseDestination(person);
                        if (!found) { activity.job = null; activity.targetId = null; }
                        for (let attempt = 0; attempt < 12; attempt++) {
                            if (found) break;
                            const angle = (person.generation + attempt) * 1.7;
                            const destination = { x: person.location.x + Math.cos(angle) * 85, y: person.location.y + Math.sin(angle) * 85 };
                            if (!window.aiPet.isPointOnWater(destination.x, destination.y) && route(person, destination)) { found = true; break; }
                        }
                        if (!found) { activity.phase = 'return'; route(person, entrance(hut)); }
                    }
                }
            } else if (activity.phase === 'enter') {
                if (activity.elapsed >= 800) { activity.phase = 'work'; activity.elapsed = 0; }
            } else if (activity.phase === 'work') {
                if (activity.elapsed >= 15000) finishResidentWork(person);
            } else if (activity.phase === 'exit') {
                if (activity.elapsed >= 800) { activity.elapsed = 0; activity.phase = route(person, entrance(hut)) ? 'return' : 'blocked'; }
            } else {
                if (activity.path.length) {
                    const point = activity.path[0], dx = point.x - person.location.x, dy = point.y - person.location.y;
                    const distance = Math.hypot(dx, dy), step = ms * .035;
                    person.location.flip = dx < 0;
                    if (distance <= step) { Object.assign(person.location, point); activity.path.shift(); }
                    else { person.location.x += dx / distance * step; person.location.y += dy / distance * step; }
                } else if (activity.phase === 'return') {
                    person.location = { kind: 'home', x: 5, y: 8 };
                    activity.phase = 'bed'; activity.elapsed = 0;
                    activity.path = window.residentIndoorPath?.(person.location, { x: 2 + person.home.slot * 2, y: 1 }) || [];
                } else if (activity.phase === 'walk' && activity.job) {
                    activity.phase = 'enter'; activity.elapsed = 0;
                } else if (activity.elapsed > 6000) {
                    activity.elapsed = 0;
                    activity.phase = route(person, entrance(hut)) ? 'return' : 'blocked';
                }
            }
            if (person.location.kind === 'home' && activity.phase === 'bed' && activity.elapsed >= 220) {
                activity.elapsed = 0;
                if (activity.path.length) Object.assign(person.location, activity.path.shift());
                else activity.phase = 'rest';
            }
        }
        if (scene === 'resident-home') { window.stepResidentHome?.(ms); window.renderResidentHome?.(); }
    }
    function actors() {
        return Object.values(window.aiPet.residentState?.people || {}).filter(p => p.home && p.location?.kind === 'island' && p.activity?.phase !== 'work')
            .map(p => ({ ...p.profile, ...p.location, personId: p.personId, actionState: p.activity?.path?.length ? 'moving' : 'idle',
                visualAction: p.routine?.enabled && !p.routineState?.failed && !p.routineState?.completed && !p.routineState?.path?.length ? ({ study: 'study', train: 'train', run: 'move', rest: 'sleep', eat: 'eat_raw', mix: 'cook', tailor: 'study' }[p.routineState?.action] || null) : null,
                frameIndex: Math.floor((p.activity?.elapsed || 0) / 180) % 3,
                visualScale: p.activity?.phase === 'enter' ? Math.max(.01, 1 - p.activity.elapsed / 800) : p.activity?.phase === 'exit' ? Math.min(1, Math.max(.01, p.activity.elapsed / 800)) : 1 }));
    }
    function releaseRoutine(person) {
        if (person.activity?.lockId) return;
        if (!person.routineState && person.activity?.owner !== 'routine' && person.activity?.phase !== 'scheduled') return;
        delete person.routineState;
        person.activity = { phase: 'resume', elapsed: 0, path: [], trips: person.activity?.trips || 0 };
    }
    window.ResidentUI = { roster, showPerson, modal, notify, button, element, literal, name, place, tick, actors, safe, groupedItems, portrait, releaseRoutine };
})();
