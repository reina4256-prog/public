(function (root, factory) {
    'use strict';
    const api = factory();
    if (typeof module === 'object' && module.exports) module.exports = api;
    else root.ExperimentalWordIdentity = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
    'use strict';
    const fields = ['characterName', 'firstPerson', 'playerAddress'];
    const names = {
        robot: ['ピコ', 'コロ', 'ギア'], spirit: ['ルミ', 'フワリ', 'シオン'], seed: ['コノハ', 'メブキ', 'ココ'],
        ghost: ['ユラ', 'モヤ', 'カゲ'], stone: ['イワオ', 'ロック', 'ゴロ'], magician: ['ルーン', 'ミラ', 'ノヴァ'],
        beetle: ['ブン', 'カブ', 'コガネ'], balloon: ['プカ', 'ポポ', 'ソラ'], bird: ['チル', 'ピヨ', 'ハネ'],
        machine: ['ボルト', 'ネジ', 'ゼンマイ'], dragon: ['リュウ', 'ホムラ', 'ラグナ']
    };
    const questions = {
        ja: { name: ['名前は', 'あなたの名前は', '君の名前は'], firstPerson: ['一人称は', '自分を何て呼ぶの'],
            playerAddress: ['私のことを何て呼ぶの', 'わたしのことをなんて呼ぶの', '私の呼び方は'] },
        en: { name: ['What is your name', "What's your name"], firstPerson: ['What do you call yourself', 'What is your first-person pronoun'], playerAddress: ['What do you call me'] },
        'zh-CN': { name: ['你叫什么名字', '你的名字是'], firstPerson: ['你怎么称呼自己', '你的第一人称是什么'], playerAddress: ['你怎么称呼我'] },
        ru: { name: ['Как тебя зовут'], firstPerson: ['Как ты называешь себя'], playerAddress: ['Как ты называешь меня'] },
        'es-ES': { name: ['Cómo te llamas', '¿Cómo te llamas'], firstPerson: ['Cómo te refieres a ti', '¿Cómo te refieres a ti'], playerAddress: ['Cómo me llamas', '¿Cómo me llamas'] },
        'pt-BR': { name: ['Como você se chama'], firstPerson: ['Como você se refere a si'], playerAddress: ['Como você me chama'] },
        de: { name: ['Wie heißt du'], firstPerson: ['Wie nennst du dich selbst'], playerAddress: ['Wie nennst du mich'] }
    };
    const copy = value => JSON.parse(JSON.stringify(value));
    const limit = field => field === 'firstPerson' ? 16 : 32;
    function valid(value) {
        return !!value && value.version === 1 && Object.keys(value).length === 4
            && fields.every(field => typeof value[field] === 'string' && value[field] === value[field].trim()
                && value[field].length > 0 && [...value[field]].length <= limit(field)
                && !/[\u0000-\u001f\u007f-\u009f\u2028\u2029\u202a-\u202e\u2066-\u2069]/u.test(value[field]));
    }
    function draft(value) {
        return { version: 1, ...Object.fromEntries(fields.map(field => [field, typeof value?.[field] === 'string' ? value[field].trim() : ''])) };
    }
    function validState(state) {
        return state.identity === undefined ? state.identityHistory === undefined
            : valid(state.identity) && (state.identityHistory === undefined || Array.isArray(state.identityHistory) && state.identityHistory.every(valid));
    }
    function configure(state, value) {
        const next = draft(value);
        if (!valid(next) || !validState(state)) return false;
        if (state.identity && fields.every(field => state.identity[field] === next[field])) return true;
        // A revised current introduction never rewrites past turns or erases old names.
        if (state.identity) (state.identityHistory ||= []).push(copy(state.identity));
        state.identity = next;
        return true;
    }
    function suggestions(appearance, translate = text => text) {
        return { characterName: (names[appearance] || names.robot).map(translate),
            firstPerson: ['ぼく', 'わたし', 'おれ'].map(translate), playerAddress: ['ご主人様', 'あなた', '相棒'].map(translate) };
    }
    const clean = (text, locale) => text.normalize('NFC').trim().toLocaleLowerCase(locale);
    function identify(state, raw, locale = 'ja', speaker = 'player') {
        if (speaker !== 'player' || !validState(state) || !valid(state.identity) || typeof raw !== 'string') return null;
        const text = clean(raw, locale), unpunctuated = text.replace(/[!！?？。.,、]{1,3}$/u, '').trim();
        const profiles = [state.identity, ...(state.identityHistory || [])];
        const named = profiles.find(profile => [text, unpunctuated].includes(clean(profile.characterName, locale)));
        if (named) return { kind: 'identity', slot: 'call', span: raw, relations: [],
            source: { kind: 'introduction', addressedName: named.characterName } };
        for (const [slot, forms] of Object.entries(questions[locale] || {})) if (forms.some(form => clean(form, locale) === unpunctuated))
            return { kind: 'identity', slot, span: raw, relations: [], source: { kind: 'introduction' } };
        return null;
    }
    function receive(state, input, contextLimit) {
        const frame = identify(state, input.raw, input.locale, input.speaker);
        if (!frame) return null;
        const identity = copy(state.identity), gesture = state.settings.speech !== 'short';
        const message = gesture ? 'identity_called_gesture' : { call: 'identity_called', name: 'identity_named',
            firstPerson: 'identity_first_person', playerAddress: 'identity_player_address' }[frame.slot];
        const understanding = { kind: 'identity', known: { identity: frame.slot }, relations: [],
            unresolved: [], complete: true, subject: frame.slot === 'playerAddress' ? 'player' : 'self',
            target: { candidates: [], adopted: null }, questionSlot: null, aspect: 'introduction',
            identity, identitySource: copy(frame.source) };
        const expression = { channel: gesture ? 'gesture' : 'speech', message };
        state.context.turns.push({ id: input.id, speaker: input.speaker, understandings: [copy(understanding)], expression: copy(expression) });
        state.context.turns = state.context.turns.slice(-contextLimit);
        return { input, interpretations: [frame], understandings: [understanding], learning: [{ proposed: [], updated: [] }],
            transfer: [], recalled: [], reaction: { intent: 'attend' }, expression, lifeLabel: [],
            identityReply: { message, ...(gesture ? { observation: true } : { identity }) } };
    }
    function format(template, value) {
        if (!valid(value)) return '';
        return template.replace(/\{(characterName|firstPerson|playerAddress)\}/g, (_, field) => value[field]);
    }
    return Object.freeze({ fields, limit, valid, draft, validState, configure, suggestions, identify, receive, format });
});
