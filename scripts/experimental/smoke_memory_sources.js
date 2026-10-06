'use strict';
// Disposable renderer profile only. Complete real activities rather than inject experience.
module.exports = async function ({ js, window, url, paintClock, sleep, read, load }) {
    const assert = require('node:assert/strict');
    const { valid } = require('./storage');
    const chat = text => js(`document.querySelector('.chat-form textarea').value=${JSON.stringify(text)}; document.querySelector('.chat-form').requestSubmit(); void 0`);
    const sync = () => js('window.dispatchEvent(new Event("beforeunload")); void 0');
    const resume = async value => {
        if (value) load(value);
        await window.loadURL(url); await paintClock(); await sleep(600);
        await js('window.smokeBeginSession()'); await sleep(150); await sync();
        assert.ok(valid(read()));
    };
    for (const [kind, phrase] of [['eat', 'おいしかった？'], ['rest', '休めた？']]) {
        const fixture = structuredClone(read());
        fixture.state.settings.speech = 'short';
        const at = fixture.world.elapsed;
        Object.assign(fixture.world, { mode: kind, dwell: .1, pause: 0,
            attention: kind === 'eat' ? 'berry:1' : 'shade', destination: null,
            activityStart: at, activityBefore: { hunger: .8, fatigue: .8 }, hunger: .8, fatigue: .8 });
        if (kind === 'eat') fixture.world.mealTaste = { quality: 'sweet', pleasant: true };
        await resume(fixture);
        let original;
        for (let i = 0; i < 100; i++) {
            await sleep(200); await sync();
            original = read().world.experiences.find(e => e.kind === kind && e.start === at);
            if (original) break;
        }
        assert.ok(original, `${kind} completed in the real renderer loop`);
        await chat(phrase);
        const answer = structuredClone(read().state.context.turns.at(-1).answer);
        assert.equal(answer.source.experienceId, original.id);
        assert.equal(answer.response.experienceId, original.id);
        assert.equal(answer.eventTime, 'past');
        await js('document.querySelector("button[aria-controls=notebook]").click(); void 0');
        assert.ok(await js(`ExperimentalWordNotebook.entries(JSON.parse(${JSON.stringify(JSON.stringify(read().state))})).some(e => e.group === 'experiences' && e.experienceId === ${original.id})`));
        await resume();
        assert.deepEqual(read().state.context.turns.at(-1).answer, answer);
        assert.ok(read().state.experiences.some(e => e.id === original.id));
    }
    assert.ok(await js('Array.from({length:localStorage.length},(_,i)=>localStorage.key(i)).every(k=>!["ai_pet_data_v1","map_data_v6"].includes(k))'));
    assert.equal(await js('typeof aiPet.update'), 'undefined');
};
