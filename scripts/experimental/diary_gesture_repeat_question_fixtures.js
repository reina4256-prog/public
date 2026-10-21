'use strict';
// Actual owner executions in disposable memory; no player saves or new forms.
const base = require('./diary_incomplete_repeat_question_fixtures');
const follow = require('./diary_followup_fixtures');
const copy = v => JSON.parse(JSON.stringify(v));
const { setup, hear, core, worldApi, catalog } = base;
function prepared(locale = 'ja') {
    const v = setup(); hear(v, base.forms[locale][0], { locale });
    v.state.settings.speech = 'gesture'; return v;
}
function fixtures() {
    const all = [], add = (group, value, expected) => all.push({ group, value, expected });
    for (const [locale, texts] of Object.entries(follow.forms)) {
        add('seven-language-complete-repeat', hear(prepared(locale), texts[0], { locale }), true);
        const short = setup(); hear(short, base.forms[locale][0], { locale });
        add('short-repeat-owned-by-aq', hear(short, texts[0], { locale }), false);
        add('actual-scoped-incomplete-owned-by-cm', hear(base.prepared(locale, 'gesture'), texts[0], { locale }), false);
    }
    for (const foundation of [false,true]) for (const life of [false,true]) for (const speech of ['short','gesture']) {
        const v=setup({foundation,life,speech:'short'});hear(v,'何してる？');v.state.settings.speech=speech;
        add('eight-settings',hear(v,follow.forms.ja[0]),foundation&&life&&speech==='gesture');
    }
    for (const f of follow.fixtures().filter(f=>f.expected&&f.type==='repeat')) {
        const r=f.value.receipt,v={state:copy(r.beforeState),world:copy(r.beforeWorld)};
        v.state.settings.speech='gesture';const input=f.value.result.input;
        add('original-answer:'+f.group,hear(v,input.raw,{locale:input.locale,speaker:input.speaker,at:input.at}),true);
    }
    for (const raw of ['もう一度教えて','もういちど言って','もう一回聞かせてください',
        'さっきの答えをもう一度教えてくれる？','  もう一度教えて  '])
        add('existing-japanese-forms',hear(prepared(),raw),true);
    const legacy=prepared();delete legacy.state.context.lastOutput;
    add('legacy-output-is-null',hear(legacy,follow.forms.ja[0]),true);
    const moved=prepared();worldApi.approach(moved.world,'path');
    add('activity-changed-original-answer-retained',hear(moved,follow.forms.ja[0]),true);
    const interrupted=prepared();hear(interrupted,'おはよう');
    add('intervening-input',hear(interrupted,follow.forms.ja[0]),false);
    add('other-speaker',hear(prepared(),follow.forms.ja[0],{speaker:'visitor'}),false);
    const noAnswer=setup({speech:'gesture'});hear(noAnswer,'何してる？');
    add('no-original-answer',hear(noAnswer,follow.forms.ja[0]),false);
    const observed=setup();follow.start(observed,'eat');follow.finish(observed);observed.state.settings.speech='gesture';
    add('observation-without-answer',hear(observed,follow.forms.ja[0]),false);
    const repeated=prepared();hear(repeated,follow.forms.ja[0]);
    // Existing world output classifies this returned answer as speech even when
    // the input result's expression is gesture. Preserve both without correction.
    add('repeat-chain-keeps-original-answer',hear(repeated,follow.forms.ja[0]),true);
    const original=follow.fixtures().find(f=>f.expected&&f.type==='repeat'
        &&f.value.receipt.beforeState.context.turns.at(-1).answer.source.experienceId!=null);
    const legacyExperience={state:copy(original.value.receipt.beforeState),world:copy(original.value.receipt.beforeWorld)};
    delete legacyExperience.state.context.lastOutput;legacyExperience.state.settings.speech='gesture';
    add('legacy-output-experience-reference',hear(legacyExperience,follow.forms.ja[0]),true);
    for (const raw of ['一息って？','それってどういうこと？','何してる？','おはよう',
        '私はもう一度教えて','もう一度教えて\n休もう']) add('other-inputs',hear(prepared(),raw),false);
    for (const name of ['incomplete_repeat_question','gesture_context_question','incomplete_context_question'])
        for (const f of require('./diary_'+name+'_fixtures').fixtures().filter(f=>f.expected))
            add('other-owner:'+name,copy(f.value),false);
    return all;
}
module.exports={fixtures,prepared,setup,hear,core,worldApi,catalog};
