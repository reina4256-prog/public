'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const api = require('../experimental_word_diary_incomplete_repeat_questions');
const candidates = require('../experimental_word_diary_candidates');
const base = require('../scripts/experimental/diary_incomplete_repeat_question_fixtures');
const { fixtures, prepared, setup, hear, learn, worldApi } = base;
const copy = v => JSON.parse(JSON.stringify(v));
const values = fixtures(), accepted = values.filter(f => f.expected);
const capture = (buffer, v) => api.capture(buffer, v.result, v.receipt);
for (const group of new Set(values.map(f => f.group))) test(`incomplete repeat: ${group}`, () => {
    for (const f of values.filter(f => f.group === group)) {
        const v = copy(f.value), source = JSON.stringify(v), buffer = api.create();
        assert.equal(capture(buffer, v), f.expected, JSON.stringify([group, v.result.input, v.result.understandings]));
        assert.equal(JSON.stringify(v), source); assert.equal(capture(buffer, v), false);
        assert.equal(buffer.read().length, Number(f.expected));
        if (!f.expected) continue;
        const record = buffer.read()[0], c = record.captured, r = v.receipt;
        assert.equal(record.kind, 'incomplete_repeat_question');
        assert.deepEqual(c.sources.input, v.result.input); assert.deepEqual(c.sources.frame, v.result.interpretations[0]);
        assert.deepEqual(c.sources.previousTurn, r.beforeState.context.turns.at(-1));
        assert.deepEqual(c.sources.originalAnswer, r.beforeState.context.turns.at(-1).answer);
        assert.deepEqual(c.sources.originalOutput, r.beforeState.context.lastOutput || null);
        assert.deepEqual(c.understanding, v.result.understandings[0]); assert.equal(c.understanding.complete, false);
        assert.equal(c.understanding.subject, null); assert.equal(c.understanding.questionSlot, null);
        assert.deepEqual(c.inputKnowledge, r.inputKnowledge); assert.deepEqual(c.inputContext, r.inputContext);
        assert.deepEqual(c.response, r.reply); assert.deepEqual(c.expression, v.result.expression);
        assert.deepEqual(c.sources.state, { before:r.beforeState, after:r.afterState });
        assert.deepEqual(c.sources.activity, { before:r.beforeWorld, after:r.afterWorld });
        assert.equal(c.response.message, 'attend'); assert.equal(c.actualAnswer, false); assert.equal(c.turnAnswer, null);
        assert.equal(c.actualSpeech, c.expression.channel === 'speech'); assert.equal(c.speechSetting, r.beforeState.settings.speech);
        assert.deepEqual(c.missingRelationsBefore, ['question']); assert.deepEqual(c.missingMeaningsBefore, []);
        assert.equal(Object.hasOwn(r.afterState.context.turns.at(-1), 'answer'), false);
        for (const key of ['newTeaching','newLearning','newExperience']) assert.equal(c[key], false);
        for (const key of ['knowledge','experiences','selectionSources']) assert.deepEqual(r.beforeState[key],r.afterState[key]);
        for (const key of ['mode','destination','attention','history','reasons','activityStart','experiences'])
            assert.deepEqual(r.beforeWorld[key],r.afterWorld[key]);
        assert.equal(require('../experimental_word_diary_questions').capture(candidates.create(), v.result, r.reply),false);
        assert.throws(() => candidates.create().retain(record));
        const original = JSON.stringify(buffer.read()); c.sources.originalAnswer.source.answeredAt++;
        r.beforeState.context.turns.at(-1).answer.response.message = 'invented';
        assert.equal(JSON.stringify(buffer.read()), original);
    }
});
const edits = [
    v=>{v.result.input.id='input:999';},v=>{v.result.input.at++;},v=>{v.result.input.raw+='changed';},
    v=>{v.result.input.locale='invalid';},v=>{v.result.input.speaker='other';},v=>{v.result.input.scene+='changed';},
    v=>{v.receipt.input.at++;},v=>{v.receipt.inputKnowledge.relations.push({id:'invented'});},
    v=>{v.receipt.inputContext.scene+='changed';},v=>{v.receipt.beforeState.serial++;},
    v=>{v.receipt.afterState.serial++;},v=>{v.receipt.reply.message='invented';},v=>{v.receipt.afterWorld.elapsed++;},
    v=>{delete v.receipt.beforeWorld;},v=>{delete v.receipt.afterState;},v=>{delete v.receipt.inputContext;},
    v=>{delete v.receipt.inputKnowledge;},v=>{v.result.interpretations.push(copy(v.result.interpretations[0]));},
    v=>{v.result.understandings.push(copy(v.result.understandings[0]));},v=>{v.result.understandings[0].complete=true;},
    v=>{v.result.understandings[0].subject='self';},v=>{v.result.understandings[0].questionSlot='repeat_answer';},
    v=>{v.result.understandings[0].unresolved=[];},v=>{v.result.understandings[0].known.meaning='rest';},
    v=>{v.result.interpretations[0].slot='context_detail';},v=>{v.result.interpretations[0].replyTo='input:999';},
    v=>{v.result.understandings[0].answerReference.source.answeredAt++;},
    v=>{v.result.understandings[0].answerReference.turnId='input:999';},
    v=>{delete v.receipt.beforeState.context.turns.at(-1).answer;},
    v=>{v.receipt.beforeState.context.turns.at(-1).answer.response.message='invented';},
    v=>{v.receipt.afterState.context.turns.at(-1).answer={subject:'self'};},
    v=>{v.result.understandings[0].reportSource={kind:'speaker_report'};},
    v=>{v.result.expression.message='invented';},v=>{v.receipt.beforeWorld.elapsed++;},
    v=>{v.receipt.afterWorld.experiences.push({id:'invented'});}
];
test('all independent original and response fields reject edits', () => {
    let rejected=0;
    for(const f of accepted) for(const edit of edits) {
        const v=copy(f.value);edit(v);assert.notEqual(JSON.stringify(v),JSON.stringify(f.value));
        assert.equal(capture(api.create(),v),false,`${f.group}: ${edit}`);rejected++;
    }
    console.log(JSON.stringify({cm:{original:values.length,accepted:accepted.length,editKinds:edits.length,rejected,
        groups:Object.fromEntries([...new Set(values.map(f=>f.group))].map(group=>[group,[values.filter(f=>f.group===group).length,accepted.filter(f=>f.group===group).length]]))}}));
});
test('all 49 prior supplemental owners remain separate', () => {
    const owners=require('../scripts/experimental/diary_audit').supplementalInventory().slice(0,49); assert.equal(owners.length,49);
    for(const f of accepted) for(const owner of owners) {
        const v=copy(f.value), source=JSON.stringify(v), old=require('../'+owner.file);
        assert.equal(old.capture(old.create?old.create():candidates.create(),v.result,v.receipt),false,owner.id);
        assert.equal(JSON.stringify(v),source);
    }
    console.log(JSON.stringify({cmPriorOwnerRejections:owners.length*accepted.length}));
});
test('original referenced experiences must be unique and unchanged', () => {
    const f=accepted.find(f=>f.value.receipt.beforeState.context.lastOutput?.evidence.experienceId!=null);assert.ok(f);
    const id=f.value.receipt.beforeState.context.lastOutput.evidence.experienceId;
    for(const edit of [v=>{v.receipt.beforeWorld.experiences=v.receipt.beforeWorld.experiences.filter(e=>e.id!==id);},
        v=>{v.receipt.beforeWorld.experiences.push(copy(v.receipt.beforeWorld.experiences.find(e=>e.id===id)));},
        v=>{v.receipt.beforeWorld.experiences.find(e=>e.id===id).target='invented';}]) {
        const v=copy(f.value);edit(v);assert.equal(capture(api.create(),v),false);
    }
    const output=accepted.find(f=>f.value.receipt.beforeState.context.lastOutput).value;
    for(const field of ['listener','serial','deliveryKind','source']) {
        const v=copy(output); v.receipt.beforeState.context.lastOutput[field]=field==='serial'?999:'invented';
        assert.equal(capture(api.create(),v),false);
    }
});
test('delayed evidence, real later learning, new inputs and original journals remain independent', () => {
    const v=prepared(), early=hear(v,'もう一度教えて'), source=JSON.stringify(early), b=api.create();
    assert.equal(capture(b,early),true); const retained=JSON.stringify(b.read());
    const oldBuffer=candidates.create(); const before=JSON.stringify(oldBuffer.read());
    learn(v); worldApi.approach(v.world,'path');
    assert.equal(capture(b,early),false);const delayed=api.create();assert.equal(capture(delayed,early),true);
    assert.equal(JSON.stringify(delayed.read()),retained);assert.equal(JSON.stringify(early),source);
    assert.equal(JSON.stringify(oldBuffer.read()),before);
    const active=prepared(); const oldApi=require('../experimental_word_diary_followups'), old=oldApi.create();
    for(let i=0;i<13;i++) {
        hear(active,'何してる？'); const item=hear(active,'もう一度教えて');
        assert.equal(capture(b,item),true);assert.equal(oldApi.capture(old,item.result,item.receipt),false);
    }
    assert.equal(b.read().length,14);assert.equal(old.read().length,0);assert.equal(old.readRepetitions().length,0);
});
test('non-JSON materials cannot partially retain', () => {
    for(const value of [null,{}, {kind:'report'},{kind:'incomplete_repeat_question',sourceId:'input:0'}])
        assert.throws(()=>api.create().retain(value));
    for(const bad of [Infinity,undefined,()=>{},new Date(),Symbol('bad')]) {
        const v=copy(accepted[0].value);v.receipt.bad=bad;assert.equal(capture(api.create(),v),false);
    }
    const v=copy(accepted[0].value);v.result.bad=v.result;assert.equal(capture(api.create(),v),false);
});
