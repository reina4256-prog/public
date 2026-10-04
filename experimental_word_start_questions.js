(function (root, factory) {
    'use strict';
    const api = factory();
    if (typeof module === 'object' && module.exports) module.exports = api;
    else root.ExperimentalWordStartQuestions = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
    'use strict';
    // Prototype response mapping, not agreed scoring or a diagnosis of the player.
    const questions = [
        { id: 'free_time', text: '少し空き時間ができました。何をして過ごしたいですか？', choices: ['気になっていたことを試す', 'いつもの好きなことをする', '誰かと話す'] },
        { id: 'unfamiliar_tool', text: '初めて使うものの操作が分かりません。まずどうしますか？', choices: ['少し触って確かめる', '説明を読んでみる', '分かる人に聞いてみる'] },
        { id: 'new_method', text: 'いつもと違う方法を試したら、うまくいきました。次はどうしたいですか？', choices: ['次もその方法でやってみたい', 'いつもの方法と比べてみたい', 'ほかの方法も試してみたい'] },
        { id: 'recommended_food', text: '誰かに、おすすめの食べ物を教えてもらいました。どんなことが気になりますか？', choices: ['どんな味がするのか', '自分の好きなものに似ているか', 'その人はどんなところが好きなのか'] },
        { id: 'distraction', text: 'やろうと思っていたことの途中で、別の気になることを思いつきました。どうしますか？', choices: ['今やっていることが一区切りついてから考える', '忘れないようにメモして、今のことを続ける', '気になったことを少し確かめてから戻る'] },
        { id: 'lunch', text: 'お昼になって、お腹がすいてきました。どう過ごしたいですか？', choices: ['いつもの食事を用意する', '近くで気になった食べ物を試す', 'なじみのお店でひと息つく'] },
        { id: 'greeting', text: '散歩中、近所の人と目が合いました。まずどうしますか？', choices: ['ひと言、挨拶する', '軽く手を振る', '会釈する'] }
    ];
    function validAnswers(answers) {
        return Array.isArray(answers) && answers.length === questions.length
            && questions.every((_, i) => Number.isInteger(answers[i]) && answers[i] >= 0 && answers[i] < 3);
    }
    function resolve(answers, draw = 0) {
        if (!validAnswers(answers)) throw new Error('Invalid start answers');
        if (!Number.isFinite(draw) || draw < 0 || draw >= 1) throw new Error('Invalid start draw');
        // Appearance uses five everyday preferences. Each knowledge/expression axis
        // has its own input; no axis is inferred from species or another axis.
        const votes = [0, 0, 0];
        const skins = ['robot', 'seed', 'spirit'];
        const routing = [[0, 1, 2], [1, 0, 2], [1, 0, 2], [1, 0, 2], [0, 0, 1]];
        answers.slice(0, 5).forEach((answer, i) => { votes[routing[i][answer]]++; });
        const candidates = skins.filter((_, i) => votes[i] === Math.max(...votes));
        return { appearance: candidates[Math.floor(draw * candidates.length)],
            settings: { foundation: answers[1] !== 0, life: answers[5] !== 1,
                speech: answers[6] === 0 ? 'short' : 'gesture' } };
    }
    function validOrigin(origin, settings, appearance) {
        if (origin === undefined) return true; // Earlier saves stay unchanged.
        if (!origin || ![1, 2].includes(origin.version) || !validAnswers(origin.answers)
            || Object.keys(origin).some(key => !(origin.version === 1 ? ['version', 'answers'] : ['version', 'answers', 'draw']).includes(key))
            || (origin.version === 2 && (!Number.isFinite(origin.draw) || origin.draw < 0 || origin.draw >= 1))) return false;
        const result = resolve(origin.answers, origin.version === 2 ? origin.draw : 0);
        return result.appearance === appearance && Object.keys(result.settings)
            .every(key => result.settings[key] === settings?.[key]);
    }
    return { questions, validAnswers, resolve, validOrigin };
});
