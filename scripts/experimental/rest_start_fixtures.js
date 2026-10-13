'use strict';
const assert = require('node:assert/strict');
const core = require('../../experimental_word_learning_core');
const worldApi = require('../../experimental_word_learning_world');
const relation = require('../../experimental_word_relation_learning');
const catalog = require('../../experimental_word_learning_catalog.json');
const existing = require('./diary_negation_fixtures');
const reason = require('./diary_reason_question_fixtures');
const { prepareReason } = require('./diary_known_reason_explanation_fixtures');
const storage = require('./storage');
const copy = v => JSON.parse(JSON.stringify(v));
function bases() {
    const result = [];
    for (const locale of Object.keys(catalog.reasonTeaching))
        for (const foundation of [false, true]) for (const life of [false, true])
            for (const speech of ['short', 'gesture']) {
                const value = existing.setup({ foundation, life, speech });
                prepareReason(value, locale);
                reason.select(value, 'request', locale);
                reason.hear(value, reason.demo('request', locale, 'reason'), locale);
                reason.hear(value, catalog.reasonTeaching[locale].utterance, locale);
                const snapshot = { version: 1, appearance: 'robot', ...copy(value) };
                assert.ok(storage.valid(snapshot), `base ${locale}/${foundation}/${life}/${speech}`);
                result.push({ locale, value: snapshot });
            }
    return result;
}
// The exact same operations run against actual modules in Node and Electron.
// No storage, fixture learning or displayed diary is exposed to the renderer.
function exercise(base, locale, choice, api, catalog) {
    const copy = v => JSON.parse(JSON.stringify(v));
    const value = copy(base), { state, world } = value;
    const hear = raw => {
        const result = api.core.receive(state, raw, catalog, { locale, speaker: 'player', at: 100 + state.serial });
        const reply = api.world.respond(world, result, state, catalog);
        return { result, reply };
    };
    const old = copy({ experiences: state.experiences, relations: state.knowledge.relations,
        selections: state.selectionSources, turns: state.context.turns });
    const selected = choice === 'autonomous' ? api.world.approach(world, 'shade')
        : hear(catalog.proposalTeaching[locale][choice].utterance);
    const moving = copy(value);
    const shade = api.world.PLACES.find(p => p.id === 'shade');
    world.x = shade.x; world.y = shade.y; world.pause = 0;
    const arrival = api.world.tick(world, .1);
    api.world.onArrival(world, state, arrival);
    const started = copy(value);
    const start = world.activityStart, serial = state.serial;
    api.world.onArrival(world, state, arrival); // duplicate event must not change order
    const interrupted = api.world.approach(world, 'path');
    const stopped = copy(value);
    const review = hear(`${catalog.reasonTeaching[locale].reason}「${catalog.reasonTeaching[locale].utterance}」→「${catalog.proposalTeaching[locale].request.utterance}」`);
    const answer = hear(catalog.reasonTeaching[locale].utterance);
    return { value, moving, started, stopped, old, selected, interrupted, start, serial, review, answer };
}
module.exports = { bases, exercise, api: { core, world: worldApi, relation }, catalog };
