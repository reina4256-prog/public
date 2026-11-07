'use strict';
// Disposable current-code evidence, never historical supply or player storage.
const { fixtures, setup, prepared, prior, hearExplanation, core, catalog, raw, topic } = require('./diary_rest_explanation_report_fixtures');
function examples() {
    const values = fixtures().filter(({ group, value }) => group === 'eight-settings'
        && value.receipt.beforeState.settings.foundation && value.receipt.beforeState.settings.life
        || group === 'existing-japanese-forms' || group === 'changed-scene-and-no-target'
        || group === 'single-trim-and-terminal-punctuation'
        || group === 'activity-does-not-prove-recovery-or-cause' || group === 'fatigue-does-not-resolve-explanation'
        || group === 'different-known-rest-antecedents')
        .map(({ value }) => value);
    return [...new Map(values.map(value => [JSON.stringify(value), value])).values()];
}
function excludedExamples() {
    const incomplete = require('./diary_incomplete_rest_explanation_report_fixtures');
    const all = [...fixtures(), ...incomplete.fixtures()].map(({ value }) => value);
    for (const speech of ['short', 'gesture']) for (const mask of [1, 2]) {
        for (const edit of [v => { v.world.hunger = .4; }, v => { v.world.attention = 'berry:1'; },
            v => { core.perceive(v.state, { scene: 'clearing', attention: [] }); }]) {
            const v = incomplete.make(mask, speech); edit(v); all.push(hearExplanation(v));
        }
        for (const text of [` ${topic} `, topic + '\u3002', topic + '\n'])
            all.push(hearExplanation(incomplete.make(mask, speech, text)));
    }
    for (const speech of ['short', 'gesture']) {
        for (const text of ['\u4f11\u3082\u3046', catalog.reportTeaching.ja.self.utterance]) {
            const prepare = () => { const v = setup({ speech }); prior(v, text); return v; };
            for (const current of [raw + '\u306d', '\u3046\u3093' + raw, ` ${raw} `, `${raw}\u3002`, `${raw}\uff01`])
                all.push(hearExplanation(prepare(), current));
            for (const edit of [
                ...['idle', 'observe', 'eat', 'rest', 'work', 'walk'].map(mode => v => { v.world.mode = mode; }),
                ...[0, .2, .4, .8, 1].map(fatigue => v => { v.world.fatigue = fatigue; }),
                v => { v.world.attention = 'berry:1'; },
                v => { v.world.hunger = .4; }, v => { v.state.settings.foundation = false; },
                v => { v.state.settings.life = false; },
                ...(text === catalog.reportTeaching.ja.self.utterance ? [] : [
                    v => { v.world.destination = 'path'; },
                    v => { v.state.selectionSources = []; v.world.reasons = []; }]),
                v => { core.perceive(v.state, { scene: 'shore', attention: [] }); },
                v => { core.perceive(v.state, { scene: 'clearing', attention: [] }); }]) {
                const v = prepare(); edit(v); all.push(hearExplanation(v));
            }
            for (const options of [{ speaker: 'visitor' }, { locale: 'en' }]) {
                const v = setup({ speech }); prior(v, text, options); all.push(hearExplanation(v));
                all.push(hearExplanation(prepare(), raw, options));
            }
            for (const decorated of [` ${text} `, text + '\u3002']) {
                const v = setup({ speech }); prior(v, decorated); all.push(hearExplanation(v));
            }
        }
        for (const mode of ['idle', 'observe', 'eat', 'rest', 'work', 'walk'])
            for (const fatigue of [0, .2, .4, .8, 1]) {
                const v = prepared({ speech }); Object.assign(v.world, { mode, fatigue });
                all.push(hearExplanation(v));
            }
        for (const mode of ['observe', 'eat', 'rest', 'work', 'walk']) {
            for (const text of [raw + '\u306d', '\u3046\u3093' + raw, ` ${raw} `, `${raw}\u3002`, `${raw}\uff01`]) {
                const v = prepared({ speech }); v.world.mode = mode; all.push(hearExplanation(v, text));
            }
            for (const edit of [v => { v.world.attention = 'berry:1'; }, v => { v.world.hunger = .4; },
                v => { core.perceive(v.state, { scene: 'shore', attention: [] }); },
                v => { core.perceive(v.state, { scene: 'clearing', attention: [] }); },
                v => { v.state.settings.foundation = false; }, v => { v.state.settings.life = false; }]) {
                const v = prepared({ speech }); v.world.mode = mode; edit(v);
                all.push(hearExplanation(v, raw, { at: 987654321 }));
            }
        }
        for (const fatigue of [0, .2, .4, .8, 1]) {
            for (const text of [raw + '\u306d', '\u3046\u3093' + raw, ` ${raw} `, `${raw}\u3002`, `${raw}\uff01`]) {
                const v = prepared({ speech }); v.world.fatigue = fatigue; all.push(hearExplanation(v, text));
            }
        }
        for (const fatigue of [-.1, .1, .3, .6, 1.1]) {
            const v = prepared({ speech }); v.world.fatigue = fatigue; all.push(hearExplanation(v));
        }
        for (const text of [` ${raw} `, `${raw}\u3002`, `${raw}\uff01`]) {
            // The existing owner fixture group has short only; gesture stays outside DO/DP.
            all.push(hearExplanation(prepared({ speech }), text));
            for (const edit of [v => { v.world.mode = 'rest'; }, v => { v.world.fatigue = .4; },
                v => { v.world.attention = 'berry:1'; }, v => { v.world.hunger = .4; },
                v => { v.state.settings.foundation = false; }, v => { v.state.settings.life = false; },
                v => { core.perceive(v.state, { scene: 'clearing', attention: [] }); },
                v => { core.perceive(v.state, { scene: 'shore', attention: [] }); }]) {
                const v = prepared({ speech }); edit(v); all.push(hearExplanation(v, text, { at: 987654321 }));
            }
            for (const options of [{ speaker: 'visitor' }, { locale: 'en' }]) {
                const v = setup({ speech }); prior(v, topic, options); all.push(hearExplanation(v, text));
                all.push(hearExplanation(prepared({ speech }), text, options));
            }
            const v = setup({ speech }); prior(v, ` ${topic} `); all.push(hearExplanation(v, text));
        }
        for (const text of [` ${raw}`, `${raw} `, `\u3000${raw}\u3000`, `  ${raw}  `,
            `\t${raw}\t`, ` ${raw}\u3002 `, `${raw}\u3002\uff01`, `${raw}\u3002\u3002`,
            `${raw}\uff01\uff01`, ` ${raw} \n`, `${raw}\u3002\n`])
            all.push(hearExplanation(prepared({ speech }), text));
        for (const prefix of ['', '\u3046\u3093', '\u3046\u3093\u3001', '\u3046\u3093,', '\u3046\u3093 '])
            for (const suffix of ['', '\u306d']) {
                const text = prefix + raw + suffix;
                const shore = prepared({ speech }); core.perceive(shore.state, { scene: 'shore', attention: [] });
                if (text !== raw) all.push(hearExplanation(shore, text, { at: 987654321 }));
                for (const decorated of [` ${text} `, `${text}\u3002`, `${text}\uff01`, `${text}\n`])
                    all.push(hearExplanation(prepared({ speech }), decorated));
                for (const edit of [v => { v.world.mode = 'rest'; }, v => { v.world.fatigue = .4; },
                    v => { v.world.attention = 'berry:1'; }, v => { v.world.hunger = .4; },
                    v => { v.state.settings.foundation = false; }, v => { v.state.settings.life = false; }]) {
                    const v = prepared({ speech }); edit(v); all.push(hearExplanation(v, text));
                }
            }
        for (const at of [101, 987654320, 987654322]) {
            const v = prepared({ speech }); core.perceive(v.state, { scene: 'shore', attention: [] });
            all.push(hearExplanation(v, raw, { at }));
        }
        for (const edit of [v => { v.world.mode = 'rest'; }, v => { v.world.fatigue = .4; },
            v => { v.world.attention = 'berry:1'; }, v => { v.world.hunger = .4; },
            v => { v.state.settings.foundation = false; }, v => { v.state.settings.life = false; },
            v => { core.perceive(v.state, { scene: 'shore', attention: [{ id: 'berry:1', meaning: 'berry' }] }); },
            v => { v.state.settings.speech = speech === 'short' ? 'gesture' : 'short'; }]) {
            const v = prepared({ speech }); core.perceive(v.state, { scene: 'shore', attention: [] });
            edit(v); all.push(hearExplanation(v, raw, { at: 987654321 }));
        }
        const edits = [
            ...['observe', 'eat', 'rest', 'work', 'walk'].map(mode => v => { v.world.mode = mode; }),
            ...[0, .2, .4, .8, 1].map(fatigue => v => { v.world.fatigue = fatigue; }),
            v => { v.world.attention = 'berry:1'; }, v => { v.world.hunger = .4; },
            v => { core.perceive(v.state, { scene: 'shore', attention: [] }); },
            v => { core.perceive(v.state, { scene: 'clearing', attention: [] }); },
            v => { v.state.settings.speech = speech === 'short' ? 'gesture' : 'short'; },
            v => { v.state.settings.foundation = false; }, v => { v.state.settings.life = false; }
        ];
        for (const phase of ['prior', 'current']) for (const edit of edits) {
            const v = setup({ speech });
            if (phase === 'current') prior(v);
            edit(v);
            if (phase === 'prior') {
                prior(v);
                Object.assign(v.world, { mode: 'idle', attention: null, hunger: .35, fatigue: .15 });
                core.perceive(v.state, { scene: 'clearing', attention: [{ id: 'berry:1', meaning: 'berry' }] });
                Object.assign(v.state.settings, { speech, foundation: true, life: true });
            }
            all.push(hearExplanation(v));
        }
        for (const text of [` ${topic} `, `${topic}\u3002`, `${topic}\uff01`, `${topic}\n`,
            topic.replace('\u4f11\u3080', '\u3084\u3059\u3080'), topic + '\u3067\u3059']) {
            const v = setup({ speech }); prior(v, text); all.push(hearExplanation(v));
        }
        for (const text of [` ${raw} `, `${raw}\u3002`, `${raw}\uff01`, `${raw}\n`])
            all.push(hearExplanation(prepared({ speech }), text));
        for (const locale of ['en', 'zh-CN', 'ru', 'es-ES', 'pt-BR', 'de']) {
            const v = setup({ speech }); prior(v, topic, { locale }); all.push(hearExplanation(v));
        }
    }
    const accepted = new Set([...examples(), ...incompleteExamples()].map(value => JSON.stringify(value)));
    return all.filter(value => !accepted.has(JSON.stringify(value)));
}
function incompleteExamples() {
    const owner = require('./diary_incomplete_rest_explanation_report_fixtures');
    return [1, 2].flatMap(mask => ['short', 'gesture'].map(speech => owner.hearExplanation(owner.make(mask, speech))));
}
module.exports = { examples, incompleteExamples, excludedExamples };
