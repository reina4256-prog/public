(function () {
    'use strict';
    const C = window.ScheduleCore, R = window.ScheduleRuntime;
    const t = text => window.translateGameText ? window.translateGameText(text) : text;
    const locale = () => window.GameI18n?.language || 'ja';
    const dateText = value => new Date(value).toLocaleString(locale());
    const labels = { blank: '空白', free: '自由時間', study: '勉強', train: '筋トレ', run: 'ランニング', rest: '睡眠', eat: '食事', walk: '移動', freshness: '鮮度', gather: '採集', fish: '釣り', mix: '調合', tailor: '裁縫' };
    const reasons = { resources: '体力・満腹度不足', sick: '病気', food_missing: '食料不足', facility_missing: '施設がありません', route_missing: '到達できません', travel_short: '移動時間不足', work_short: '作業時間不足', completed: '完了', spoiled: '腐敗', unavailable: '利用条件を満たしていません。', invalid: '時刻・重複・行動の設定を確認してください。' };
    const clock = n => String(Math.floor(n / 60)).padStart(2, '0') + ':' + String(n % 60).padStart(2, '0');
    function open(personId) {
        if (window.DemoRules?.enabled) return;
        const U = window.ResidentUI, hero = window.aiPet;
        const person = hero.residentState?.people[personId];
        const owner = person || hero;
        let plan = C.clone(owner.routine || C.empty()), day = new Date().getDay();
        const view = U.modal('日課'); view.card.classList.add('schedule-editor');
        U.literal('h3', person ? U.name(person) : hero.name || hero.petName || t('主人公'), view.card);
        U.element('p', '日課は端末の曜日・時刻で繰り返します。空白は待機、自由時間は許可した行動だけを行います。', view.card);
        U.element('p', '不在中も年齢・寿命と鮮度は進みます。日課の行動は直近７日分まで精算します。', view.card);
        const enabledLabel = U.element('label', undefined, view.card);
        const enabled = U.element('input', undefined, enabledLabel); enabled.type = 'checkbox'; enabled.checked = plan.enabled;
        U.element('span', '日課を有効にする', enabledLabel);
        const nav = U.element('div', undefined, view.card); nav.className = 'schedule-toolbar';
        const weekdays = U.element('select', undefined, nav); weekdays.setAttribute('aria-label', t('曜日'));
        for (let i = 0; i < 7; i++) {
            const opt = U.literal('option', new Date(2026, 0, 4 + i).toLocaleDateString(locale(), { weekday: 'long' }), weekdays);
            opt.value = i; opt.selected = day === i;
        }
        const copyTo = U.element('select', undefined, nav); copyTo.setAttribute('aria-label', t('複製先'));
        for (let i = 0; i < 7; i++) { const opt = U.literal('option', new Date(2026, 0, 4 + i).toLocaleDateString(locale(), { weekday: 'long' }), copyTo); opt.value = i; }
        U.button(nav, '曜日へ複製', () => { plan.days[Number(copyTo.value)] = C.clone(plan.days[day]); });
        U.button(nav, '提案を作る', () => {
            const profile = person?.profile || hero;
            const strongest = Object.entries(profile.stats || {}).filter(([key]) => ['intel', 'power', 'speed'].includes(key)).sort((a, b) => b[1] - a[1])[0]?.[0];
            const action = { power: 'train', speed: 'run' }[strongest] || 'study';
            plan.days[day] = [
                { start: 0, end: 420, action: 'rest', destination: 'home' },
                { start: 420, end: 450, action: 'eat', destination: 'home', meal: { sources: ['inventory', 'freezer'], itemId: '' } },
                { start: 540, end: 600, action, destination: 'current' },
                { start: 720, end: 750, action: 'eat', destination: 'home', meal: { sources: ['inventory', 'freezer'], itemId: '' } },
                { start: 900, end: 960, action: 'free', allowed: ['study', 'train', 'run'], destination: 'current' },
                { start: 1080, end: 1110, action: 'eat', destination: 'home', meal: { sources: ['inventory', 'freezer'], itemId: '' } },
                { start: 1320, end: 1440, action: 'rest', destination: 'home' }
            ]; render();
        });
        const editor = U.element('div', undefined, view.card);
        weekdays.onchange = () => { day = Number(weekdays.value); render(); };
        function select(parent, label, values, value, change) {
            const wrap = U.element('label', undefined, parent); U.element('span', label, wrap);
            const node = U.element('select', undefined, wrap);
            for (const [id, text] of values) { const option = U.element('option', text, node); option.value = id; option.selected = value === id; }
            node.onchange = () => change(node.value); return node;
        }
        function render() {
            editor.replaceChildren();
            for (const slot of plan.days[day]) {
                const row = U.element('section', undefined, editor); row.className = 'schedule-slot';
                for (const key of ['start', 'end']) {
                    const wrap = U.element('label', undefined, row); U.element('span', key === 'start' ? '開始' : '終了', wrap);
                    const input = U.element('input', undefined, wrap); input.type = 'text'; input.inputMode = 'numeric'; input.value = clock(slot[key]);
                    input.onchange = () => { const match = /^(\d{1,2}):(\d{2})$/.exec(input.value); slot[key] = match && Number(match[2]) < 60 ? Number(match[1]) * 60 + Number(match[2]) : -1; };
                }
                select(row, '行動', C.actions.filter(id => person || !['gather', 'fish', 'mix', 'tailor'].includes(id)).map(id => [id, labels[id]]), slot.action, value => {
                    slot.action = value;
                    if (value === 'eat') slot.meal ||= { sources: ['inventory'], itemId: '' };
                    if (value === 'free') slot.allowed ||= ['study'];
                    render();
                });
                const destinations = [['current', '現在地'], ['home', '自宅']];
                for (const asset of Object.values(assets)) {
                    if (asset.instanceId && !['ai', 'pet'].includes(asset.type)) destinations.push([asset.instanceId, asset.name || asset.type]);
                }
                select(row, '行き先', destinations, slot.destination || 'current', value => { slot.destination = value; });
                if (['mix', 'tailor'].includes(slot.action)) {
                    const recipes = [['', 'おまかせ'], ...window.CraftCore.recipes[slot.action].map(recipe => [recipe.id, itemCatalog[recipe.id]?.name || recipe.id])];
                    select(row, 'レシピ', recipes, slot.craftTarget || '', value => { slot.craftTarget = value; });
                }
                if (slot.action === 'free') {
                    const allowed = U.element('div', undefined, row);
                    for (const id of ['study', 'train', 'run', 'walk']) {
                        const wrap = U.element('label', undefined, allowed); const check = U.element('input', undefined, wrap); check.type = 'checkbox'; check.checked = slot.allowed?.includes(id);
                        U.element('span', labels[id], wrap);
                        check.onchange = () => { slot.allowed = check.checked ? [...(slot.allowed || []), id] : slot.allowed.filter(a => a !== id); };
                    }
                }
                if (slot.action === 'eat') {
                    const sources = [['inventory', '持ち物'], ['freezer', '冷凍庫'], ['inventory,freezer', '持ち物 → 冷凍庫'], ['freezer,inventory', '冷凍庫 → 持ち物']];
                    select(row, '入手元', sources, slot.meal.sources.join(','), value => { slot.meal.sources = value.split(','); });
                    const foods = [['', 'おまかせ']];
                    const owned = person ? R.residentActor(person) : R.heroActor(hero, assets);
                    const known = new Set([...(owned.inventory || []), ...(owned.freezer || [])].map(item => typeof item === 'string' ? item : item.id));
                    for (const [id, data] of Object.entries(typeof itemCatalog === 'undefined' ? {} : itemCatalog)) {
                        if ((known.has(id) || slot.meal.itemId === id) && ['food', 'dish', 'ingredient', 'medicine'].includes(data.type)) foods.push([id, data.name || id]);
                    }
                    select(row, '食事', foods, slot.meal.itemId || '', value => { slot.meal.itemId = value; });
                }
                U.button(row, '削除', () => { plan.days[day].splice(plan.days[day].indexOf(slot), 1); render(); });
            }
            U.button(editor, '追加', () => { plan.days[day].push({ start: 0, end: 60, action: 'blank', destination: 'current' }); render(); });
        }
        render();
        U.button(view.card, '保存前に試算', () => {
            try {
                plan.enabled = enabled.checked;
                const validated = C.validate(plan);
                const actor = person ? R.residentActor(person) : R.heroActor(hero, assets);
                const preview = U.modal('保存前に試算');
                for (let i = 0; i < 7; i++) {
                    const line = U.element('div', undefined, preview.card); line.className = 'schedule-timeline';
                    U.literal('strong', new Date(2026, 0, 4 + i).toLocaleDateString(locale(), { weekday: 'short' }), line);
                    for (const slot of C.timeline(validated, i)) {
                        const block = U.literal('span', clock(slot.start) + '–' + clock(slot.end) + ' ' + t(labels[slot.action]), line);
                        block.className = 'schedule-summary-' + slot.action;
                    }
                }
                const previewContext = R.context(), realRoute = previewContext.route, journeys = new Map();
                previewContext.route = (a, slot, position) => {
                    const travel = realRoute(a, slot, position);
                    if (travel?.path?.length) {
                        let from = travel.position, ms = 0;
                        for (const point of travel.path) {
                            if (!point.transition) ms += Math.hypot(point.x - from.x, point.y - from.y) / (point.kind === 'home' ? 1 / 220 : C.config.walkPixelsPerMs);
                            from = point;
                        }
                        const key = slot.start + ':' + slot.end + ':' + slot.destination;
                        journeys.set(key, { slot, ms: Math.max(ms, journeys.get(key)?.ms || 0) });
                    }
                    return travel;
                };
                const result = C.forecast(actor, { ...validated, enabled: true }, previewContext);
                for (const { slot, ms } of journeys.values()) U.literal('p', clock(slot.start) + ' · ' + t(labels[slot.action]) + ' · ' + t('移動') + ': ' + Math.ceil(ms / 1000) + t('秒'), preview.card);
                U.element('p', result.stable ? '繰り返し可能です。' : result.inconclusive ? '試算期間内では安定を確認できませんでした。' : reasons[result.failure.status] || '移動時間不足', preview.card);
                U.literal('p', t('週') + ' ' + result.week + (result.failure ? ' · ' + dateText(result.failure.at) + ' · ' + t(labels[result.failure.action]) : ''), preview.card);
                U.button(preview.card, '予定を修正する', preview.close);
                U.button(preview.card, result.stable ? '保存' : '不足する可能性を承知して保存する', () => U.safe(() => {
                    const draft = C.clone(window.aiPet);
                    const target = person ? draft.residentState.people[personId] : draft;
                    if (!person) R.cancelLiveHero(draft);
                    if (person && !validated.enabled) U.releaseRoutine(target);
                    target.routine = validated; delete target.routineState;
                    window.Residents.saveWorld(draft, assets);
                    if (person) window.aiPet.residentState = draft.residentState;
                    else { R.cancelLiveHero(window.aiPet); window.aiPet.routine = validated; delete window.aiPet.routineState; }
                    preview.close(); view.close();
                }));
            } catch (error) { console.error(error); U.notify('時刻・重複・行動の設定を確認してください。'); }
        });
    }
    let reportView;
    function report() {
        if (window.DemoRules?.enabled) return;
        if (reportView && !reportView.root.isConnected) reportView = null;
        const data = window.aiPet?.timeProgress?.report;
        if (!data || data.acknowledged || reportView) return;
        const U = window.ResidentUI;
        const view = U.modal('不在報告'); reportView = view;
        U.literal('p', dateText(data.from) + ' – ' + dateText(data.through ?? data.to), view.card);
        if (data.capped) U.element('p', '日課の行動は直近７日分まで精算しました。', view.card);
        if (data.deathAt) { U.element('h3', '寿命到達', view.card); U.literal('p', dateText(data.deathAt), view.card); }
        for (const [id, after] of Object.entries(data.after)) {
            const person = window.aiPet.residentState?.people[id];
            U.literal('h3', person ? U.name(person) : window.aiPet.name || window.aiPet.petName || t('主人公'), view.card);
            const before = data.before[id];
            for (const [key, label] of [['age', '年齢'], ['energy', '体力'], ['hunger', '満腹度']]) {
                if (after[key] !== undefined) U.literal('p', t(label) + ': ' + Number(before[key] || 0).toFixed(1) + ' → ' + Number(after[key]).toFixed(1), view.card);
            }
            for (const [key, label] of [['intel', '知力'], ['power', '力'], ['speed', '素早さ'], ['beauty', '美しさ']]) {
                const change = (after.stats[key] || 0) - (before.stats[key] || 0);
                if (change) U.literal('p', t(label) + ': ' + (change > 0 ? '+' : '') + change.toFixed(2), view.card);
            }
            for (const event of data.events.filter(e => e.personId === id)) {
                const item = event.detail && typeof itemCatalog !== 'undefined' ? itemCatalog[event.detail] : null;
                U.literal('p', dateText(event.at) + ' · ' + t(labels[event.action] || event.action) + ' · ' + t(reasons[event.status] || event.status) + (item ? ' · ' + t(item.name) : '') + ' ×' + event.count, view.card);
            }
        }
        const acknowledge = () => U.safe(() => {
            const draft = C.clone(window.aiPet); draft.timeProgress.report.acknowledged = true;
            window.Residents.saveWorld(draft, assets); window.aiPet.timeProgress = draft.timeProgress;
            view.close(); reportView = null;
        });
        // Closing is acknowledgement only; it never applies simulation results again.
        view.root.querySelector('header button').onclick = acknowledge;
        view.root.addEventListener('keydown', e => { if (e.key === 'Escape') { e.stopImmediatePropagation(); e.preventDefault(); acknowledge(); } }, true);
        U.button(view.card, '確認しました', acknowledge);
    }
    window.ScheduleUI = { open, report };
})();
