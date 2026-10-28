'use strict';
// Actual perception, arrival, receiver and responder in disposable memory only.
const base = require('./diary_mixed_reference_material_fixtures');
const words = require('./diary_word_reference_clause_material_fixtures');
const refs = require('./diary_individual_reference_material_fixtures');
const dynamic = require('./diary_dynamic_multiple_complete_naming_fixtures');
const extras = require('./diary_additional_clause_material_fixtures');
const {core, worldApi, catalog, copy, life, focus} = base;
const raw = 'ころ\nもも\nぴ・ぴ\nぽぽ';
const allowed=new Set(['after_eat_walk','berry_observation','conditional_rest','do_not_eat','name_question','not_dislike','not_now','preference','reason_question','rest_comfort','rest_invitation','rest_request','rest_result','rest_value','situation_question','sour_question','taste_now','walk_invitation','greeting_morning','work_past','work_again','taste_question','rest_explanation','name','name_description','name_answer','retract_explanation','yes_reply_priority','no_reply_priority','yes_reply','no_reply']);
const arrivals=[];
function prepare(options={},variant='normal',speaker='player',arrival=true){
 const v=base.setup(options);base.focus(v,['berry:2']);base.hear(v,'これをぴ・ぴって呼ぼう',{speaker});base.focus(v);base.hear(v,'ぽぽは休むことだよ',{speaker});
 if(variant==='two-targets'){base.focus(v,['berry:3'],'elsewhere');base.hear(v,'これをぴ・ぴって呼ぼう',{speaker});base.focus(v,['berry:2']);}
 if(variant==='multiple-evidence'){base.focus(v,['berry:2'],'elsewhere');base.hear(v,'これをぴ・ぴって呼ぼう',{speaker});base.focus(v,['berry:2']);}
 if(variant==='meaning-conflict')base.hear(v,'ぽぽは木の実のことだよ',{speaker});
 if(variant==='same-meaning'){base.focus(v,['berry:2'],'elsewhere');base.hear(v,'ぽぽは休むことだよ',{speaker});base.focus(v,['berry:2']);}
 if(variant==='chain'){base.hear(v,'さっき間違えた。ぽぽは眠ることだよ',{speaker});base.hear(v,'さっき間違えた。ぽぽは休むことだよ',{speaker});}
 if(variant==='individual-conflict')base.hear(v,'これをぽぽって呼ぼう',{speaker});
 if(variant==='rest-antecedent')base.hear(v,'休むことは大事',{speaker});
 if(variant==='missing-relation')v.state.knowledge.relations=v.state.knowledge.relations.filter(r=>r.id!=='naming');
 base.focus(v);
 if(arrival){const beforeState=copy(v.state),beforeWorld=copy(v.world);dynamic.arrive(v);arrivals.push({beforeState,beforeWorld,afterState:copy(v.state),afterWorld:copy(v.world)});}
 return v;
}
function hear(v,text,options={}) { return base.hear(v,text,options); }
function expected(value) {
 const r=value.result,frames=r.interpretations,us=r.understandings,q=value.receipt;
 return r.input.locale==='ja' && frames.some(f=>f.kind==='reference')
  && frames.some(f=>f.kind==='naming'&&!Object.hasOwn(f,'catalogRule'))
  && frames.every(f=>['reference','word_reference','unknown'].includes(f.kind)||allowed.has(f.catalogRule)||f.kind==='naming'&&!Object.hasOwn(f,'catalogRule'))
  && frames.filter((f,i)=>f.kind==='naming'&&us[i].complete).length!==1
  && !r.relationLearning&&!r.conditionJudgment&&!r.sequenceJudgment
  && !(us.at(-1).kind==='question'&&us.at(-1).complete&&q.reply.message==='answer_unknown');
}
function fixtures() {
 const rows=[];
 function add(group,v,text,options={}) { const value=hear(v,text,options);rows.push({group,value,expected:expected(value)}); }
for(const foundation of [false,true])for(const life of [false,true])for(const speech of ['short','gesture'])for(const speaker of ['player','visitor'])
 for(const text of ['ころ\nぴ・ぴ','ころ\nもも\nぴ・ぴ','ぴ・ぴ\nころ\nもも','ころ\nもも\nぴ・ぴ\nぽぽ','ぽぽ\nぴ・ぴ\nころ\nもも'])add('settings',prepare({foundation,life,speech},'normal',speaker),text,{speaker});
for(const variant of ['two-targets','multiple-evidence','meaning-conflict','same-meaning','chain','individual-conflict','missing-relation','rest-antecedent'])
 for(const text of ['ころ\nもも\nぴ・ぴ','ころ\nもも\nぴ・ぴ\nぽぽ','ぴ・ぴ\nぽぽ\nころ\nもも'])add('source:'+variant,prepare({},variant),text);
for(const text of [...extras.anchors,'おはよう',...Object.values(extras.forms),'さっきの説明は間違えた','うん','違う','未知!','これをののって呼ぼう','これはののだよ','ののっていうんだ'])for(const reverse of [false,true])
 add('companions',prepare({},'rest-antecedent'),reverse?text+'\nころ\nもも\nぴ・ぴ':'ころ\nもも\nぴ・ぴ\n'+text);
for(const mode of ['rest','eat']){const v=prepare({},'normal','player',false);base.life.start(v,mode);base.life.finish(v);base.focus(v);dynamic.arrive(v);add('experience:'+mode,v,'ころ\nもも\nぴ・ぴ\nぽぽ');}
for(const locale of Object.keys(catalog.patterns))add('locale',prepare(),'ころ\nもも\nぴ・ぴ\nぽぽ',{locale});
for(const text of ['ころ\nもも\nぴ・ぴ','ころ\nもも\nぴ・ぴ\nぽぽ','ぴ・ぴ','ぴ・ぴ\nおはよう','ぴ・ぴ\nぽぽ','ころ\nもも','ころ\nもも\nおはよう'])add('controls',prepare({},'normal','player',false),text);
for(const text of ['ころ\nもも','ころ\nもも\nおはよう','ころ\nもも\nぽぽ','ころ\nもも\nぴ・ぴ\n私は悲しい'])add('prior-owner-and-other-rule',prepare(),text);
for(const variant of ['expired','consumed','changed-attention']){const v=prepare();if(variant==='expired'){base.hear(v,'未解析!');base.hear(v,'未解析!');}if(variant==='consumed')base.hear(v,'ころ');if(variant==='changed-attention')base.focus(v,['berry:2']);add('pending:'+variant,v,'ころ\nもも\nぴ・ぴ');}
for(const ids of [[],['berry:1','berry:2'],['berry:2']]){const v=prepare();focus(v,ids);add('attention-boundary',v,raw);}
 for(const text of [Array(5).fill(raw).join('\n'),'ぴ・ぴ\nころ\nころ\nぴ・ぴ','これをののって呼ぼう\nころ\nもも\nぴ・ぴ','ころ\nこれはののだよ\nもも\nぴ・ぴ','ころ\nもも\nののっていうんだ\nぴ・ぴ'])add('repetition-and-existing-forms',prepare(),text);
 for(const speech of ['short','gesture'])for(const text of ['ぴぴ','ころ\nもも\nぴぴ']){const v=base.setup({speech});focus(v,['berry:2']);hear(v,'これをぴぴって呼ぼう');focus(v);dynamic.arrive(v);add('letter-name-original-frame',v,text);}
 return rows;
}
module.exports={fixtures,expected,prepare,setup:base.setup,hear,focus,arrive:dynamic.arrive,core,worldApi,catalog,copy,life,raw};
