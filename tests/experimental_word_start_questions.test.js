'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const questions = require('../experimental_word_start_questions');
const core = require('../experimental_word_learning_core');
const catalog = require('../experimental_word_learning_catalog.json');

test('all everyday answer combinations preserve independent starts without invented experience', () => {
    const combinations = new Set(), appearances = new Set();
    for (let n = 0; n < 3 ** 7; n++) {
        let rest = n;
        const answers = Array.from({ length: 7 }, () => { const a = rest % 3; rest = Math.floor(rest / 3); return a; });
        const result = questions.resolve(answers, 0, 1);
        const state = core.create(result.settings, catalog);
        state.startOrigin = { version: 1, answers: answers.slice() };
        assert.equal(questions.validOrigin(state.startOrigin, state.settings, result.appearance), true);
        assert.deepEqual(state.records, []); assert.deepEqual(state.notes, []);
        assert.equal(state.experiences, undefined);
        assert.ok(state.knowledge.meanings.every(k => k.source === 'initial'));
        assert.ok(state.knowledge.relations.every(k => k.source === 'initial'));
        assert.equal(state.knowledge.meanings.length > 0, result.settings.life);
        assert.equal(state.knowledge.relations.length > 0, result.settings.foundation);
        combinations.add(JSON.stringify(result.settings)); appearances.add(result.appearance);
        for (const axis of [1, 5, 6]) {
            const changed = answers.slice(); changed[axis] = (changed[axis] + 1) % 3;
            const next = questions.resolve(changed).settings;
            for (const key of ['foundation', 'life', 'speech']) {
                if (key !== { 1: 'foundation', 5: 'life', 6: 'speech' }[axis]) assert.equal(next[key], result.settings[key]);
            }
        }
    }
    assert.equal(combinations.size, 8); assert.equal(appearances.size, 3);
});

test('start provenance rejects incomplete or altered answers, while older starts stay valid', () => {
    for (const answers of [[], new Array(7), [0,0,0,0,0,0], [0,0,0,0,0,0,3], [0,0,0,0,0,0,.5]]) {
        assert.equal(questions.validAnswers(answers), false);
        assert.throws(() => questions.resolve(answers));
    }
    const origin = { version: 1, answers: [0,1,1,1,0,0,0] }, result = questions.resolve(origin.answers, 0, 1);
    assert.equal(questions.validOrigin(undefined, result.settings, result.appearance), true);
    assert.equal(questions.validOrigin(JSON.parse(JSON.stringify(origin)), result.settings, result.appearance), true);
    assert.equal(questions.validOrigin(origin, { ...result.settings, life: false }, result.appearance), false);
    assert.equal(questions.validOrigin(origin, result.settings, 'spirit'), false);
    assert.equal(questions.validOrigin({ ...origin, experience: true }, result.settings, result.appearance), false);
});

test('legacy-style tied appearance draws change only the preview species and preserve old provenance', () => {
    const answers = [0, 0, 0, 2, 0, 1, 1]; // robot=2, seed=2, spirit=1
    const first = questions.resolve(answers, 0, 2), second = questions.resolve(answers, .99, 2);
    assert.notEqual(first.appearance, second.appearance);
    assert.deepEqual(first.settings, second.settings);
    assert.equal(questions.validOrigin({ version: 2, answers, draw: .99 }, second.settings, second.appearance), true);
    assert.equal(questions.validOrigin({ version: 1, answers }, first.settings, first.appearance), true);
    assert.equal(questions.validOrigin({ version: 2, answers, draw: 1 }, second.settings, second.appearance), false);
    assert.equal(questions.validOrigin({ version: 2, answers }, second.settings, second.appearance), false);
});

test('eleven appearances remain reachable with every answer set; dragon is rarer without a knowledge advantage', () => {
    const skins = new Set(), settings = new Set();
    for (let n = 0; n < 3 ** 7; n++) {
        let rest = n;
        const answers = Array.from({length:7}, () => { const a=rest%3; rest=Math.floor(rest/3); return a; });
        const pool = questions.appearanceWeights(answers), total = pool.reduce((sum,item)=>sum+item.weight,0);
        const dragon = pool.find(item=>item.id==='dragon');
        assert.ok(pool.every(item=>item.weight>0));
        assert.ok(pool.filter(item=>item.id!=='dragon').every(item=>item.weight>dragon.weight));
        assert.ok(dragon.weight / total < .01);
        let offset = 0, expectedSettings;
        for (const item of pool) {
            const draw = (offset+item.weight/2)/total, result = questions.resolve(answers,draw);
            assert.equal(result.appearance,item.id);
            assert.equal(questions.validOrigin({version:3,answers,draw},result.settings,item.id),true);
            if (expectedSettings) assert.deepEqual(result.settings,expectedSettings);
            expectedSettings=result.settings; settings.add(JSON.stringify(result.settings)); skins.add(item.id);
            const state=core.create(result.settings,catalog);
            assert.deepEqual(state.records,[]); assert.deepEqual(state.notes,[]);
            offset+=item.weight;
        }
    }
    assert.equal(skins.size,11); assert.equal(settings.size,8);
    assert.equal(questions.resolve([0,0,0,0,0,0,0],1-Number.EPSILON).appearance,'dragon');
    assert.throws(()=>questions.resolve([0,0,0,0,0,0,0],0,4));
});

test('eleven base appearances have valid existing frames and sound assets without legacy ability import', () => {
    const fs=require('node:fs'),path=require('node:path');
    const visuals=require('../experimental_word_learning_visuals.json');
    assert.deepEqual(Object.keys(visuals),questions.appearances);
    for(const id of questions.appearances) {
        const png=fs.readFileSync(path.join(__dirname,'..',visuals[id].image));
        const width=png.readUInt32BE(16),height=png.readUInt32BE(20);
        assert.deepEqual(Object.keys(visuals[id]).sort(),['actions','image']);
        for(const action of ['idle','move','sleep']) {
            assert.ok(visuals[id].actions[action].length>0);
            for(const f of visuals[id].actions[action]) {
                assert.ok(f.sx>=0 && f.sy>=0 && f.sw>0 && f.sh>0 && f.sx+f.sw<=width && f.sy+f.sh<=height,id+': '+action);
            }
        }
        assert.ok(fs.statSync(path.join(__dirname,'..','bgm_'+id+'.mp3')).size>0);
    }
});
