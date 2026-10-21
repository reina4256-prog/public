'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const api=require('../experimental_word_diary_gesture_repeat_questions');
const candidates=require('../experimental_word_diary_candidates');
const base=require('../scripts/experimental/diary_gesture_repeat_question_fixtures');
const follow=require('../scripts/experimental/diary_followup_fixtures');
const copy=v=>JSON.parse(JSON.stringify(v));
const values=base.fixtures(),accepted=values.filter(f=>f.expected);
const capture=(b,v)=>api.capture(b,v.result,v.receipt);
for(const group of new Set(values.map(f=>f.group))) test(`gesture repeat: ${group}`,()=>{
    for(const f of values.filter(f=>f.group===group)) {
        const v=copy(f.value),source=JSON.stringify(v),b=api.create();
        assert.equal(capture(b,v),f.expected,JSON.stringify([group,v.result.input,v.result.understandings]));
        assert.equal(JSON.stringify(v),source);assert.equal(capture(b,v),false);
        assert.equal(b.read().length,Number(f.expected));if(!f.expected)continue;
        const record=b.read()[0],c=record.captured,r=v.receipt,answer=r.beforeState.context.turns.at(-1).answer;
        assert.equal(record.kind,'gesture_repeat_question');assert.equal(record.sourceId,v.result.input.id);
        assert.equal(record.occurrenceId,`gesture_repeat_question:${v.result.input.id}`);
        assert.deepEqual(c.sources.input,v.result.input);assert.deepEqual(c.sources.frame,v.result.interpretations[0]);
        assert.deepEqual(c.sources.previousTurn,r.beforeState.context.turns.at(-1));
        assert.deepEqual(c.sources.originalAnswer,answer);assert.deepEqual(c.sources.originalOutput,r.beforeState.context.lastOutput||null);
        assert.deepEqual(c.sources.state,{before:r.beforeState,after:r.afterState});
        assert.deepEqual(c.sources.activity,{before:r.beforeWorld,after:r.afterWorld});
        assert.deepEqual(c.inputKnowledge,r.inputKnowledge);assert.deepEqual(c.inputContext,r.inputContext);
        assert.deepEqual(c.understanding,v.result.understandings[0]);assert.equal(c.understanding.complete,true);
        assert.deepEqual(c.response,r.reply);assert.deepEqual(c.response,answer.response);
        assert.deepEqual(c.expression,v.result.expression);assert.equal(c.expression.channel,'gesture');
        assert.equal(c.expression.message,'attend');assert.equal(c.actualSpeech,false);
        assert.equal(c.answerRecorded,true);assert.deepEqual(c.turnAnswer,answer);
        assert.deepEqual(c.turnAnswer,r.afterState.context.turns.at(-1).answer);
        assert.notEqual(c.sources.input.id,c.turnAnswer.source.inputId);
        assert.equal(c.turnAnswer.source.answeredAt,answer.source.answeredAt);
        assert.deepEqual(c.missingRelationsBefore,[]);assert.deepEqual(c.missingMeaningsBefore,[]);
        for(const key of ['newTeaching','newLearning','newExperience'])assert.equal(c[key],false);
        for(const key of ['knowledge','experiences','selectionSources'])assert.deepEqual(r.beforeState[key],r.afterState[key]);
        for(const key of ['mode','destination','attention','history','reasons','activityStart','experiences'])
            assert.deepEqual(r.beforeWorld[key],r.afterWorld[key]);
        assert.equal(require('../experimental_word_diary_questions').capture(candidates.create(),v.result,r.reply),false);
        assert.throws(()=>candidates.create().retain(record));
        const original=JSON.stringify(b.read());c.turnAnswer.source.answeredAt++;
        r.beforeState.context.turns.at(-1).answer.response.message='invented';
        assert.equal(JSON.stringify(b.read()),original);
    }
});
const edits=[
 v=>{v.result.input.id='input:999';},v=>{v.result.input.at++;},v=>{v.result.input.raw+='changed';},
 v=>{v.result.input.locale='invalid';},v=>{v.result.input.speaker='other';},v=>{v.result.input.scene+='changed';},
 v=>{v.receipt.input.at++;},v=>{v.receipt.inputKnowledge.relations.push({id:'invented'});},
 v=>{v.receipt.inputContext.scene+='changed';},v=>{v.receipt.beforeState.serial++;},
 v=>{v.receipt.afterState.serial++;},v=>{v.receipt.reply.message='invented';},v=>{v.receipt.afterWorld.elapsed++;},
 v=>{delete v.receipt.beforeWorld;},v=>{delete v.receipt.afterState;},v=>{delete v.receipt.inputContext;},
 v=>{delete v.receipt.inputKnowledge;},v=>{v.result.interpretations.push(copy(v.result.interpretations[0]));},
 v=>{v.result.understandings.push(copy(v.result.understandings[0]));},v=>{v.result.understandings[0].complete=false;},
 v=>{v.result.understandings[0].subject='player';},v=>{v.result.understandings[0].questionSlot='context_detail';},
 v=>{v.result.understandings[0].unresolved=[{type:'relation',id:'question'}];},
 v=>{v.result.interpretations[0].slot='context_detail';},v=>{v.result.interpretations[0].replyTo='input:999';},
 v=>{v.result.understandings[0].answerReference.source.answeredAt++;},
 v=>{v.result.understandings[0].answerReference.turnId='input:999';},
 v=>{delete v.receipt.beforeState.context.turns.at(-1).answer;},
 v=>{v.receipt.beforeState.context.turns.at(-1).answer.response.message='invented';},
 v=>{delete v.receipt.afterState.context.turns.at(-1).answer;},
 v=>{v.receipt.afterState.context.turns.at(-1).answer.source.inputId=v.result.input.id;},
 v=>{v.receipt.afterState.context.turns.at(-1).answer.source.answeredAt=v.result.input.at+10;},
 v=>{v.result.understandings[0].reportSource={kind:'speaker_report'};},
 v=>{v.result.expression.message='invented';},v=>{v.result.expression.channel='speech';},
 v=>{v.receipt.beforeState.settings.speech='short';},v=>{v.receipt.beforeWorld.elapsed++;},
 v=>{v.receipt.afterWorld.experiences.push({id:'invented'});}
];
test('independent original expression, reply and answer copies reject edits',()=>{
    for(const f of accepted)for(const edit of edits){const v=copy(f.value);edit(v);
        assert.notEqual(JSON.stringify(v),JSON.stringify(f.value));assert.equal(capture(api.create(),v),false,`${f.group}: ${edit}`);}
    console.log(JSON.stringify({cn:{original:values.length,accepted:accepted.length,editKinds:edits.length,
        rejected:edits.length*accepted.length,groups:Object.fromEntries([...new Set(values.map(f=>f.group))]
            .map(g=>[g,[values.filter(f=>f.group===g).length,accepted.filter(f=>f.group===g).length]]))}}));
});
test('50 prior supplemental owners remain separate',()=>{
    const owners=require('../scripts/experimental/diary_audit').supplementalInventory().slice(0,50);assert.equal(owners.length,50);
    for(const f of accepted)for(const owner of owners){const v=copy(f.value),source=JSON.stringify(v),old=require('../'+owner.file);
        assert.equal(old.capture(old.create?old.create():candidates.create(),v.result,v.receipt),false,owner.id);assert.equal(JSON.stringify(v),source);}
    console.log(JSON.stringify({cnPriorOwnerRejections:owners.length*accepted.length}));
});
test('original experience references reject missing duplicate and changed snapshots including legacy output',()=>{
    for(const legacy of [false,true]){
        const f=accepted.find(f=>!!f.value.receipt.beforeState.context.lastOutput!==legacy
            &&f.value.receipt.beforeState.context.turns.at(-1).answer.source.experienceId!=null);assert.ok(f);
        const id=f.value.receipt.beforeState.context.turns.at(-1).answer.source.experienceId;
        for(const change of ['missing','duplicate','snapshot']){
            const v=copy(f.value),r=v.receipt;
            if(change==='missing')r.beforeWorld.experiences=r.beforeWorld.experiences.filter(e=>e.id!==id);
            if(change==='duplicate')r.beforeWorld.experiences.push(copy(r.beforeWorld.experiences.find(e=>e.id===id)));
            if(change==='snapshot')r.beforeWorld.experiences.find(e=>e.id===id).target='invented';
            assert.equal(capture(api.create(),v),false,`${legacy}:${change}`);
        }
    }
    const f=accepted.find(f=>f.value.receipt.beforeState.context.lastOutput);
    for(const field of ['listener','serial','deliveryKind','source']){
        const v=copy(f.value);v.receipt.beforeState.context.lastOutput[field]=field==='serial'?999:'invented';
        assert.equal(capture(api.create(),v),false);
    }
});
test('new inputs, delayed copies, original journals and later learning stay independent',()=>{
    const v=base.prepared(),early=base.hear(v,'もう一度教えて'),source=JSON.stringify(early),b=api.create();
    assert.equal(capture(b,early),true);const retained=JSON.stringify(b.read());
    require('../scripts/experimental/diary_incomplete_repeat_question_fixtures').learn(v);
    base.worldApi.approach(v.world,'path');assert.equal(capture(b,early),false);
    const delayed=api.create();assert.equal(capture(delayed,early),true);assert.equal(JSON.stringify(delayed.read()),retained);
    assert.equal(JSON.stringify(early),source);
    const active=base.prepared(),oldApi=require('../experimental_word_diary_followups'),old=oldApi.create();
    const original=candidates.create();const before=JSON.stringify(original.read());
    const fresh=api.create();
    for(let i=0;i<13;i++){
        active.state.settings.speech='short';base.hear(active,'何してる？');active.state.settings.speech='gesture';
        const item=base.hear(active,'もう一度教えて');assert.equal(capture(fresh,item),true);
        assert.equal(oldApi.capture(old,item.result,item.receipt),false);
    }
    assert.equal(fresh.read().length,13);assert.equal(old.read().length,0);assert.equal(old.readRepetitions().length,0);
    assert.equal(JSON.stringify(original.read()),before);
    const pending=require('../scripts/experimental/diary_incomplete_repeat_question_fixtures').prepared('ja','gesture');
    const rejected=base.hear(pending,'もう一度教えて');assert.equal(capture(api.create(),rejected),false);
    pending.state.knowledge=copy(base.setup().state.knowledge);
    assert.equal(capture(api.create(),rejected),false);
});
test('non-JSON material cannot partially retain',()=>{
    for(const v of [null,{}, {kind:'report'},{kind:'gesture_repeat_question',sourceId:'input:0'}])assert.throws(()=>api.create().retain(v));
    for(const bad of [Infinity,undefined,()=>{},new Date(),Symbol('bad')]){const v=copy(accepted[0].value);v.receipt.bad=bad;assert.equal(capture(api.create(),v),false);}
    const v=copy(accepted[0].value);v.result.bad=v.result;assert.equal(capture(api.create(),v),false);
});
