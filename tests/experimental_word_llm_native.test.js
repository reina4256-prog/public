'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const core=require('../experimental_word_llm_native'),{createStore,createSession}=require('../scripts/experimental/native_store');
const character={name:'A',self:'I',player:'you'};

test('practice audio uses only a current saved main-owned line and preserves the two selected speaker voices',async t=>{
    const calls=[],state={locale:'en',game:{origin:{appearance:'robot'}}};let active=true,speaker='mentor';
    const session={load:()=>({ok:true,state}),practiceLine:(id,slot)=>active&&id==='event-11'&&slot==='offer'?{speaker,text:'A real short survey.',locale:'en'}:null};
    const service=nativeVoice.createVoice({directory:directory(t),session,key:()=> 'fixture-only',fetcher:async(_url,o)=>{calls.push(JSON.parse(o.body));return voiceResponse();}});
    assert.equal((await service.generate({kind:'practice',id:'event-11',slot:'offer',text:'Injected'})).ok,false);
    assert.equal((await service.generate({kind:'practice',id:'event-11',slot:'report'})).ok,false);
    assert.ok((await service.generate({kind:'practice',id:'event-11',slot:'offer'})).ok);assert.equal(calls.length,1);assert.equal(calls[0].generation_config.speech_config[0].voice,'Leda');
    assert.ok((await service.generate({kind:'practice',id:'event-11',slot:'offer'})).ok);assert.equal(calls.length,1,'same saved line reuses the reply cache');
    active=false;assert.equal((await service.generate({kind:'practice',id:'event-11',slot:'offer'})).ok,false);assert.equal(calls.length,1);
    active=true;speaker='companion';assert.ok((await service.generate({kind:'practice',id:'event-11',slot:'offer'})).ok);assert.equal(calls.at(-1).generation_config.speech_config[0].voice,voiceRules.defaults.robot);
    state.game.practices=[{npc:'building'}];speaker='mentor';assert.ok((await service.generate({kind:'practice',id:'event-11',slot:'offer'})).ok);assert.equal(calls.at(-1).generation_config.speech_config[0].voice,'Charon');
    assert.ok(service.save({version:1,enabled:true,voices:{'mentor-builder':'Schedar','mentor-adventurer':'Kore'}}).ok);
    assert.ok((await service.generate({kind:'practice',id:'event-11',slot:'offer'})).ok);assert.equal(calls.at(-1).generation_config.speech_config[0].voice,'Schedar');
    speaker='companion';assert.ok((await service.generate({kind:'practice',id:'event-11',slot:'offer'})).ok);assert.equal(calls.at(-1).generation_config.speech_config[0].voice,voiceRules.defaults.robot);service.dispose();
});

test('mentor dialogue is bounded, sends only public persona and this encounter, and rejects forged or stale lines',async()=>{
    const {createTalk,protocol}=require('../scripts/experimental/native_mentor'),packets=[];
    const talk=createTalk({async reply(packet){packets.push(packet);return {ok:true,proposal:{mentor:'Hello.',companion:'Hello back.'}};},cancel(){}});
    const {id}=talk.start(character,'en');assert.ok(id);
    assert.equal((await talk.next('forged',0)).ok,false);
    for(let i=0;i<3;i++){assert.ok((await talk.next(id,i)).ok);assert.equal(packets[i].recent.length,i*2);assert.ok(protocol.valid(packets[i]));
        assert.deepEqual(Object.keys(packets[i]).sort(),['character','id','locale','mentor','recent']);}
    assert.equal((await talk.next(id,3)).ok,false);assert.equal(packets.length,3);
    assert.equal(talk.line(id,2,'mentor'),null);assert.equal(talk.line(id,3,'companion').text,'Hello back.');
    assert.equal(protocol.valid({...packets[0],memories:['private']}),false);
    assert.equal(protocol.decode('{"mentor":"Hello","companion":"Hi","quest":"done"}'),null);
    assert.equal(protocol.decode(JSON.stringify({mentor:'x'.repeat(301),companion:'Hi'})),null);
    talk.stop();assert.equal(talk.line(id,3,'mentor'),null);
    const next=talk.start({...character,name:'B'},'en');await talk.next(next.id,0);assert.deepEqual(packets.at(-1).recent,[]);
});
test('mentor cancellation discards late results; session locks normal conversation and keeps saved knowledge untouched',async t=>{
    const {createTalk}=require('../scripts/experimental/native_mentor');let release;
    const talk=createTalk({reply:()=>new Promise(r=>release=r),cancel(){}}),{id}=talk.start(character,'en'),pending=talk.next(id,0);
    talk.stop();release({ok:true,proposal:{mentor:'Late',companion:'Late'}});assert.equal((await pending).error,'cancelled');assert.equal(talk.line(id,1,'mentor'),null);
    const store=createStore(directory(t)),runtime=require('../experimental_word_llm_native_runtime');let state=runtime.create(character,'en',[0,0,0,0,0,0,0],require('../scripts/experimental/native_island').createIsland());
    const target=runtime.game.supply(state.game).visible.find(v=>/^chip:(mountain_|palms_)/.test(v.id)&&runtime.game.walk.plan(state.game,v.id)).id;
    for(const [input,extra] of [['Which?',{focus:{targetId:target,quote:'Which?'}}],['Yes',{confirmation:{targetId:target,quote:'Yes'}}],['walk there',{action:{kind:'walk',targetId:target,quote:'walk there'}}]]){
        const b=runtime.begin(state,input,'en'),r={reply:'Hello',interpretation:{kind:'request',summary:'Received'},memories:[],references:[],terms:[],action:null,focus:null,...extra};state=runtime.finish(b.state,b.packet.id,b.state.revision,r);}
    for(let i=0;i<1000&&state.game.mode==='move';i++)runtime.game.tick(state.game,.1);
    assert.ok(store.save(state).ok);
    const session=createSession({store,responder:{cancel(){},dispose(){}},mentorResponder:{async reply(p){assert.equal(p.locale,'de');return {ok:true,proposal:{mentor:'Hallo',companion:'Hallo'}};},cancel(){},dispose(){}}});
    assert.equal(session.mentorStart('invalid').ok,false);
    assert.equal(session.mentorStart('de').ok,false);assert.equal(session.mentorIntro('forged').ok,false);assert.ok(session.mentorIntro(state.game.walk.encounter.id).ok);
    const start=session.mentorStart('de');assert.ok(start.ok);assert.equal((await session.submit('secret','en')).ok,false);assert.equal(session.selectCharacter('original').ok,false);
    assert.ok((await session.mentorNext(start.id,0)).ok);assert.deepEqual(session.load().state.turns,state.turns);assert.deepEqual(session.load().state.game.receipts,state.game.receipts);assert.equal(session.load().state.game.x,state.game.x);
    session.mentorStop();assert.equal(session.mentorLine(start.id,1,'mentor'),null);session.dispose();
});

test('mentor TTS accepts only the latest main-owned line and keeps companion and mentor designs separate',async t=>{
    const dir=directory(t),calls=[],state={locale:'en',game:{origin:{appearance:'robot'}}};let active=true;
    const session={load:()=>({ok:true,state}),mentorLine:(id,round,speaker)=>active&&id==='encounter'&&round===1&&speaker==='mentor'?{text:'Welcome.',locale:'en'}:null};
    const service=nativeVoice.createVoice({directory:dir,session,key:()=> 'fixture-only',fetcher:async(_url,o)=>{calls.push(JSON.parse(o.body));return voiceResponse();}});
    assert.equal((await service.generate({kind:'mentor',id:'encounter',round:1,speaker:'mentor',text:'forged'})).ok,false);
    assert.equal((await service.generate({kind:'mentor',id:'encounter',round:0,speaker:'mentor'})).ok,false);
    assert.ok((await service.generate({kind:'mentor',id:'encounter',round:1,speaker:'mentor'})).ok);assert.equal(calls.length,1);
    assert.deepEqual(calls[0].input,[{type:'user_input',content:[{type:'text',text:'Welcome.'}]}]);assert.equal(calls[0].generation_config.speech_config[0].voice,'Leda');
    active=false;assert.equal((await service.generate({kind:'mentor',id:'encounter',round:1,speaker:'mentor'})).ok,false);assert.equal(calls.length,1);
    const designs=require('../scripts/experimental/native_voice_designs').createDesigns(dir),settings=voiceRules.design.fresh();
    assert.ok(designs.add({voice:'voice_mentor',species:'mentor-adventurer',locale:'en',settings}).ok);
    const id=designs.load().entries[0].id;
    assert.equal(service.save({version:1,enabled:true,voices:{robot:id}}).ok,false);
    assert.ok(service.save({version:1,enabled:true,voices:{'mentor-adventurer':id}}).ok);
    assert.match(voiceRules.design.prompt(settings,'mentor-adventurer'),/adult woman adventurer/);
});

test('native profiles preserve the original save and shared voice data across new characters and restart',t=>{
    const {createProfiles}=require('../scripts/experimental/native_store'),dir=directory(t),first=core.create(character,'en'),second=core.create({...character,name:'B'},'ja');
    const original=createStore(dir);assert.ok(original.save(first).ok);const oldBytes=fs.readFileSync(original.file);
    const voiceFile=path.join(dir,'native-voice-designs.json');fs.writeFileSync(voiceFile,'shared-voice-fixture');
    const profiles=createProfiles(dir);assert.deepEqual(profiles.load().value,first);assert.deepEqual(profiles.list().characters,[{id:'original',name:'A'}]);
    assert.ok(profiles.create(second).ok);const secondId=profiles.list().selected;assert.notEqual(secondId,'original');
    assert.equal(profiles.list().characters.length,2);assert.deepEqual(fs.readFileSync(original.file),oldBytes);
    const reopened=createProfiles(dir);assert.deepEqual(reopened.load().value,second);assert.ok(reopened.select('original').ok);assert.deepEqual(reopened.load().value,first);
    assert.ok(reopened.select(secondId).ok);assert.deepEqual(reopened.load().value,second);assert.equal(fs.readFileSync(voiceFile,'utf8'),'shared-voice-fixture');
    assert.equal(reopened.select('../outside').ok,false);assert.equal(reopened.select('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa').ok,false);assert.deepEqual(reopened.load().value,second);
});

test('native profile corruption and failed pointer writes never reset or discard saved characters',t=>{
    const {createProfiles}=require('../scripts/experimental/native_store'),dir=directory(t),value=core.create(character,'en');
    createStore(dir).save(value);fs.writeFileSync(path.join(dir,'native-active-character.json'),'{bad');
    const broken=createProfiles(dir);assert.equal(broken.load().ok,false);assert.equal(broken.create(value).ok,false);assert.equal(broken.select('original').ok,false);
    assert.deepEqual(createStore(dir).load().value,value);
    const clean=directory(t);createStore(clean).save(value);const profiles=createProfiles(clean);fs.mkdirSync(path.join(clean,'native-active-character.json.tmp'));
    assert.equal(profiles.create(core.create({...character,name:'B'},'en')).ok,false);assert.equal(profiles.list().characters.length,2);assert.deepEqual(profiles.load().value,value);
    assert.deepEqual(createStore(clean).load().value,value);
    const missing=directory(t);fs.writeFileSync(path.join(missing,'native-active-character.json'),JSON.stringify({version:1,id:'original'}));assert.equal(createProfiles(missing).load().ok,false);
});

test('native session creates and selects separate characters without mixing original memories',t=>{
    const {createProfiles}=require('../scripts/experimental/native_store'),store=createProfiles(directory(t));
    let cancelFails=false;const session=createSession({store,responder:{cancel(){if(cancelFails)throw Error('cancel');},dispose(){}}});session.create(character,'en');const original=session.load().state;
    assert.equal(session.createCharacter({...character,name:'B'},'en',[0,0,0,0,0,0,0]).ok,true);
    assert.equal(session.load().state.character.name,'B');assert.equal(session.characters().characters.length,2);
    assert.ok(session.selectCharacter('original').ok);assert.deepEqual(session.load().state,original);
    assert.equal(session.create(character,'en').ok,false);cancelFails=true;
    assert.equal(session.createCharacter({...character,name:'C'},'en',[0,0,0,0,0,0,0]).ok,false);
    assert.deepEqual(session.load().state,original);assert.equal(store.list().selected,'original');assert.equal(store.list().characters.length,2);session.dispose();
});
const voiceRules=require('../experimental_word_llm_native_voice');
const nativeVoice=require('../scripts/experimental/native_voice');
function voiceWav(){const pcm=Buffer.alloc(4800),b=Buffer.alloc(44+pcm.length);b.write('RIFF');b.writeUInt32LE(b.length-8,4);b.write('WAVEfmt ',8);b.writeUInt32LE(16,16);b.writeUInt16LE(1,20);b.writeUInt16LE(1,22);b.writeUInt32LE(24000,24);b.writeUInt32LE(48000,28);b.writeUInt16LE(2,32);b.writeUInt16LE(16,34);b.write('data',36);b.writeUInt32LE(pcm.length,40);return b;}
const voiceResponse=()=>new Response(JSON.stringify({steps:[{type:'model_output',content:[{type:'audio',data:voiceWav().toString('base64')}]}]}));
const designResponse=(id='voice_fixture')=>new Response(JSON.stringify({type:'prompted',id,sample_audio:{mime_type:'audio/wav',data:voiceWav().toString('base64')}}));

test('voice diagnostics retain fixed hints for unfamiliar and localized explanations without leaking echoes',async t=>{
    const settings={...voiceRules.design.fresh(),extra:'age copyright child unsupported language'},secret='safety policy billing token';
    const body={error:{status:'INVALID_ARGUMENT',message:'Synthesis could not proceed: this voice description uses an unsupported language. Echo: "'+settings.extra+'". '+secret,details:[{'@type':'type.googleapis.com/google.rpc.LocalizedMessage',locale:'ja',message:'入力の音声生成に失敗しました。言語は未対応です。'},{'@type':'private-unknown-type',message:'private-message'}]}};
    const dir=directory(t);let calls=0;const service=nativeVoice.createVoice({directory:dir,session:{},key:()=>secret,fetcher:async()=>{calls++;return new Response(JSON.stringify(body),{status:400});}});
    assert.equal((await service.generate({kind:'design',species:'dragon',locale:'ja',settings})).ok,false);assert.equal(calls,1);
    const raw=fs.readFileSync(path.join(dir,'native-voice-diagnostics.jsonl'),'utf8'),entry=JSON.parse(raw);
    assert.equal(entry.classifierVersion,2);assert.equal(entry.errorBodyState,'parsed');assert.equal(entry.explanationPresent,true);
    assert.deepEqual(entry.explanationClasses,['unclassified']);
    for(const signal of ['generation','failure','voice','prompt','unsupported','language'])assert.ok(entry.explanationSignals.includes(signal));
    for(const signal of ['age','rights','safety','policy','billing','authentication'])assert.equal(entry.explanationSignals.includes(signal),false);
    assert.deepEqual(entry.detailTypes,['localized_message','other']);
    for(const forbidden of [secret,settings.extra,'Synthesis could not proceed','入力の音声生成','private-message','private-unknown-type'])assert.equal(raw.includes(forbidden),false);
});

test('voice diagnostics distinguish generic or missing explanations and body-reading failures',async t=>{
    const cases=[
        {body:JSON.stringify({error:{message:'Request contains an invalid argument.'}}),state:'parsed',classes:['generic_invalid_request'],present:true},
        {body:JSON.stringify({error:{status:'INVALID_ARGUMENT'}}),state:'parsed',classes:['unclassified'],present:false},
        {body:'broken private JSON',state:'invalid_json'},
        {body:'x'.repeat(17000),state:'too_large'}
    ];
    for(const item of cases){const dir=directory(t);const service=nativeVoice.createVoice({directory:dir,session:{},key:()=> 'secret',fetcher:async()=>new Response(item.body,{status:400})});
        await service.generate({kind:'preview',voice:'Kore',locale:'ja'});const entry=JSON.parse(fs.readFileSync(path.join(dir,'native-voice-diagnostics.jsonl'),'utf8'));
        assert.equal(entry.errorBodyState,item.state);if(item.classes){assert.deepEqual(entry.explanationClasses,item.classes);assert.equal(entry.explanationPresent,item.present);}
    }
    const dir=directory(t),service=nativeVoice.createVoice({directory:dir,session:{},key:()=> 'secret',fetcher:async()=>({ok:false,status:400,body:new ReadableStream({start(controller){controller.error(Error('private error'));}})})});
    assert.equal((await service.generate({kind:'preview',voice:'Kore',locale:'ja'})).error,'failed');
    const raw=fs.readFileSync(path.join(dir,'native-voice-diagnostics.jsonl'),'utf8');assert.equal(JSON.parse(raw).errorBodyState,'unreadable');assert.equal(raw.includes('private error'),false);
});

test('voice HTTP explanations classify provider templates without treating echoed prompt words as a cause',async t=>{
    const secret='private-api-key',extra='private-input-text',request={kind:'design',species:'dragon',locale:'ja',settings:{...voiceRules.design.fresh(),extra}};
    const cases=[
        ['Voice generation did not complete, so no voice was created. Try rephrasing the prompt.','generation_incomplete'],
        ['The request was blocked due to safety restrictions.','policy_rejection'],
        ['Invalid JSON payload received. Unknown name "private-input-text" at voice.','unknown_parameter'],
        ['Invalid value at \'voice.gender\': '+secret,'parameter_rejected'],
        ['Quota exceeded for '+secret,'usage_limit'],
        ['Billing is not enabled for '+secret,'billing_unavailable'],
        ['API key not valid. '+secret,'authentication'],
        ['Model is not supported. '+secret,'model_unavailable'],
        ['Input was "The request was blocked due to safety restrictions. '+extra+'"','unclassified'],
        [extra+' policy safety quota gender invalid','unclassified']
    ];
    for(const [message,expected]of cases){const dir=directory(t);let calls=0;
        const service=nativeVoice.createVoice({directory:dir,session:{},key:()=>secret,fetcher:async()=>{calls++;return new Response(JSON.stringify({error:{status:'INVALID_ARGUMENT',message}}),{status:400});}});
        assert.equal((await service.generate(request)).ok,false);assert.equal(calls,1);
        const raw=fs.readFileSync(path.join(dir,'native-voice-diagnostics.jsonl'),'utf8'),entry=JSON.parse(raw);
        assert.deepEqual(entry.explanationClasses,[expected]);assert.equal(entry.httpStatus,400);
        if(expected==='generation_incomplete')assert.equal(entry.explanationClasses.includes('policy_rejection'),false);
        if(expected==='parameter_rejected')assert.deepEqual(entry.rejectedFields,['voice.gender']);
        for(const forbidden of [secret,extra,'Try rephrasing','message','description'])assert.equal(raw.includes(forbidden),false);
    }
});

test('voice explanation diagnostics bound and allowlist structured fields, ignore oversized or malformed error bodies',async t=>{
    const bodies=[
        JSON.stringify({error:{message:'private-original-text',details:[{'@type':'type.googleapis.com/google.rpc.BadRequest',fieldViolations:[{field:'voice.prompted.input',description:'private-original-text'},{field:'private-original-text',description:'private-api-key'}]},{fieldViolations:[{field:'store'}]}]}}),
        JSON.stringify({error:{message:'Voice generation did not complete. '+ 'x'.repeat(17000)}}),
        'private-original-text invalid JSON'
    ];
    for(const [i,body]of bodies.entries()){const dir=directory(t),service=nativeVoice.createVoice({directory:dir,session:{},key:()=> 'private-api-key',fetcher:async()=>new Response(body,{status:400})});
        assert.equal((await service.generate({kind:'preview',voice:'Kore',locale:'ja'})).error,'failed');
        const raw=fs.readFileSync(path.join(dir,'native-voice-diagnostics.jsonl'),'utf8'),entry=JSON.parse(raw);
        assert.equal(entry.stage,'http');assert.equal(entry.httpStatus,400);
        if(i===0){assert.deepEqual(entry.explanationClasses,['parameter_rejected']);assert.deepEqual(entry.rejectedFields,['voice.prompted.input']);}
        else assert.equal(entry.explanationClasses,undefined);
        assert.equal(raw.includes('private-original-text'),false);assert.equal(raw.includes('private-api-key'),false);
    }
});

test('voice diagnostics distinguish HTTP rejection, bad response, timeout and network without recording secrets',async t=>{
    const secret='private-key-never-log',settings=voiceRules.design.fresh();settings.extra='private-player-prompt-never-log';
    const request={kind:'design',species:'dragon',locale:'ja',settings};
    const cases=[
        {stage:'http',status:429,fetcher:async()=>new Response(JSON.stringify({error:{status:'RESOURCE_EXHAUSTED',message:secret,details:[{reason:'QUOTA_EXCEEDED',metadata:{prompt:settings.extra}},{reason:secret}]}}),{status:429})},
        {stage:'http',status:400,fetcher:async()=>new Response(JSON.stringify({error:{status:'INVALID_ARGUMENT',message:settings.extra}}),{status:400})},
        {stage:'response_json',fetcher:async()=>new Response(secret)},
        {stage:'sample_format',fetcher:async()=>new Response(JSON.stringify({type:'prompted',id:'voice_private',sample_audio:{mime_type:'audio/l16',data:'AAAA'}}))},
        {stage:'sample_wav',fetcher:async()=>new Response(JSON.stringify({type:'prompted',id:'voice_private',sample_audio:{mime_type:'audio/wav',data:'AAAA'}}))},
        {stage:'network',fetcher:async()=>{throw Error(secret);}},
        {stage:'timeout',fetcher:async(_u,o)=>new Promise((_r,reject)=>o.signal.addEventListener('abort',()=>reject(Error(secret))))}
    ];
    for(const item of cases){const dir=directory(t);let calls=0;
        const service=nativeVoice.createVoice({directory:dir,session:{},key:()=>secret,timeout:25,fetcher:(...args)=>{calls++;return item.fetcher(...args);}});
        assert.equal((await service.generate(request)).ok,false);assert.equal(calls,1);
        const raw=fs.readFileSync(path.join(dir,'native-voice-diagnostics.jsonl'),'utf8'),entry=JSON.parse(raw);
        assert.equal(entry.stage,item.stage);if(item.status)assert.equal(entry.httpStatus,item.status);
        if(item.status===429){assert.equal(entry.providerStatus,'RESOURCE_EXHAUSTED');assert.deepEqual(entry.providerReasons,['QUOTA_EXCEEDED']);}
        for(const forbidden of [secret,settings.extra,'voice_private','sample_audio','metadata','message'])assert.equal(raw.includes(forbidden),false);
        assert.equal(entry.kind,'design');assert.ok(entry.elapsedMs>=0);
    }
});

test('voice diagnostics preserve successful audio, explicit cancellation and operation when the diagnostic file is unwritable',async t=>{
    const dir=directory(t),request={kind:'preview',voice:'Kore',locale:'ja'};
    const service=nativeVoice.createVoice({directory:dir,session:{},key:()=> 'private',fetcher:async()=>voiceResponse()});
    assert.ok((await service.generate(request)).ok);const file=path.join(dir,'native-voice-diagnostics.jsonl');
    assert.equal(JSON.parse(fs.readFileSync(file,'utf8')).stage,'complete');
    const blocked=directory(t);fs.mkdirSync(path.join(blocked,'native-voice-diagnostics.jsonl'));
    assert.ok((await nativeVoice.createVoice({directory:blocked,session:{},key:()=> 'private',fetcher:async()=>voiceResponse()}).generate(request)).ok);
    const cancelledDir=directory(t),cancelled=nativeVoice.createVoice({directory:cancelledDir,session:{},key:()=> 'private',fetcher:async(_u,o)=>new Promise((_r,reject)=>o.signal.addEventListener('abort',()=>reject(Error('private'))))});
    const pending=cancelled.generate(request);cancelled.cancel();assert.equal((await pending).error,'cancelled');
    assert.equal(JSON.parse(fs.readFileSync(path.join(cancelledDir,'native-voice-diagnostics.jsonl'),'utf8')).stage,'cancelled');
});
test('voice design uses eight bounded language-neutral choices and optional original text',()=>{
    const d=voiceRules.design,s=d.fresh();assert.ok(d.valid(s));assert.equal(d.fields.length,8);assert.equal(s.extra,'');
    assert.match(d.prompt(s),/small, round creature/);assert.match(d.prompt(s),/Reduce breathiness/);assert.match(d.prompt(s),/never scream/);
    s.extra='鈴のような響き';assert.ok(d.prompt(s).includes(s.extra));assert.equal(d.valid({...s,extra:'x'.repeat(301)}),false);
    assert.equal(d.valid({...s,model:'other'}),false);assert.equal(d.valid({...s,traits:{...s.traits,pitch:'arbitrary'}}),false);
    assert.equal(d.valid({...s,extra:'bad\u0000text'}),false);assert.equal(d.fresh().extra,'');
});
test('voice design sends only an explicit description, persists a candidate, and uses its saved ID after restart',async t=>{
    const dir=directory(t),calls=[],settings=voiceRules.design.fresh();settings.extra='鈴のような響き';
    const fetcher=async(url,o)=>{calls.push({url,body:JSON.parse(o.body),headers:o.headers});return url.endsWith('/voices')?designResponse():voiceResponse();};
    const options={directory:dir,key:()=> 'test-secret',session:{load(){throw Error('must not read character');}},fetcher};
    const service=nativeVoice.createVoice(options);assert.ok(service.load().ok);assert.equal(calls.length,0);
    const request={kind:'design',species:'dragon',locale:'ja',settings},made=await service.generate(request);
    assert.ok(made.ok);assert.equal(calls.length,1);assert.equal(calls[0].url,'https://generativelanguage.googleapis.com/v1beta/voices');
    assert.deepEqual(calls[0].body,{store:true,voice:{model:voiceRules.model,type:'prompted',display_name:'Companion voice',language_code:'ja-JP',gender:'neutral',prompted:{input:voiceRules.design.prompt(settings)}}});
    assert.deepEqual(service.load().value.voices,{},'creation/audition does not select a voice');
    assert.ok(voiceRules.design.validId(made.design.id));assert.equal(JSON.stringify(made).includes('test-secret'),false);assert.equal(made.design.cloudId,undefined);
    assert.ok((await service.generate(request)).ok);assert.equal(calls.length,1,'same explicit design reuses the candidate sample');
    assert.equal(service.save({version:1,enabled:true,voices:{robot:made.design.id}}).ok,false,'cannot assign another species registry entry');
    assert.ok(service.save({version:1,enabled:true,voices:{dragon:made.design.id}}).ok);
    const reopened=nativeVoice.createVoice(options);assert.deepEqual(reopened.load().designs[0].settings,settings);
    assert.equal(reopened.load().value.voices.dragon,made.design.id);assert.equal(calls.length,1,'restart does not generate');
    assert.ok((await reopened.generate(request)).ok);assert.equal(calls.filter(c=>c.url.endsWith('/voices')).length,1,'never create the same design again after restart');
    assert.equal(calls.at(-1).body.input[0].content[0].text,voiceRules.samples.ja);assert.equal(calls.at(-1).body.generation_config.speech_config[0].voice,'voice_fixture');
    const state={locale:'ja',game:{origin:{appearance:'dragon'}},turns:[{id:'latest',status:'complete',world:{},input:'private original',result:{reply:'Saved final reply.'}}]};
    const reply=nativeVoice.createVoice({...options,session:{load:()=>({ok:true,state})}});
    assert.ok((await reply.generate({kind:'reply',turnId:'latest'})).ok);
    assert.equal(calls.at(-1).body.input[0].content[0].text,'Saved final reply.');assert.equal(calls.at(-1).body.generation_config.speech_config[0].voice,'voice_fixture');
    assert.equal(JSON.stringify(calls.at(-1)).includes(settings.extra),false);assert.equal(JSON.stringify(calls.at(-1)).includes('private original'),false);
    assert.equal(fs.existsSync(path.join(dir,'native-memory.json')),false);
});
test('voice design rejects expanded input, unknown voice IDs and corrupt registries before any API call',async t=>{
    const dir=directory(t);let calls=0;const service=nativeVoice.createVoice({directory:dir,key:()=> 'test',session:{},fetcher:async()=>{calls++;return designResponse();}});
    const request={kind:'design',species:'dragon',locale:'ja',settings:voiceRules.design.fresh()};
    for(const bad of [{...request,text:'arbitrary script'},{...request,species:'unknown'},{...request,locale:'unknown'},{...request,settings:{...request.settings,extra:'x'.repeat(301)}}])assert.equal((await service.generate(bad)).error,'input');
    assert.equal((await service.generate({kind:'preview',voice:'voice_arbitrary',locale:'ja'})).ok,false);
    assert.equal(service.save({version:1,enabled:true,voices:{dragon:'design:00000000-0000-4000-8000-000000000000'}}).ok,false);
    assert.equal(calls,0);fs.writeFileSync(path.join(dir,'native-voice-designs.json'),'invalid');
    assert.equal(service.load().ok,false);assert.equal((await service.generate(request)).error,'save');assert.equal(calls,0);
});
test('voice design failure and late cancellation never retry, auto-apply or fall back',async t=>{
    const request={kind:'design',species:'dragon',locale:'ja',settings:voiceRules.design.fresh()};
    for(const status of [400,401,403,429,500]){let calls=0;const service=nativeVoice.createVoice({directory:directory(t),session:{},key:()=> 'test',fetcher:async()=>{calls++;return new Response('',{status});}});
        assert.equal((await service.generate(request)).ok,false);assert.equal(calls,1);assert.deepEqual(service.load().value.voices,{});}
    let release;const service=nativeVoice.createVoice({directory:directory(t),session:{},key:()=> 'test',fetcher:()=>new Promise(r=>release=r)});
    const pending=service.generate(request);service.cancel();release(designResponse('voice_cancelled'));
    assert.equal((await pending).error,'cancelled');assert.deepEqual(service.load().value.voices,{});assert.equal(service.load().designs.length,1,'already-created ID is preserved without selection');
});
test('voice key setup opens visibly without changing the caller environment or starting a game',()=>{
    const {EventEmitter}=require('node:events'),{launch}=require('../scripts/experimental/setup_native_voice');let actual;
    const env={ELECTRON_RUN_AS_NODE:'1',EXAMPLE:'keep'},oldExit=process.exitCode,messages=[];
    try{const child=launch({env,executable:'test-electron',report:m=>messages.push(m),spawn:(exe,args,options)=>{actual={exe,args,options};return new EventEmitter();}});
        assert.equal(actual.options.windowsHide,false);assert.equal(actual.options.env.ELECTRON_RUN_AS_NODE,undefined);assert.equal(env.ELECTRON_RUN_AS_NODE,'1');
        assert.ok(actual.args[0].endsWith('setup_native_voice.js'));assert.equal(actual.args.length,1);assert.equal(actual.options.env.EXAMPLE,'keep');
        child.emit('error',Error('test'));assert.equal(process.exitCode,1);assert.equal(messages.length,1);child.emit('exit',0);assert.equal(process.exitCode,0);
    }finally{process.exitCode=oldExit;}
});
test('voice key reader keeps secrets off arguments, inherited environment and logs, and fails closed',async()=>{
    const {EventEmitter}=require('node:events'),{loadKey}=require('../scripts/experimental/native_voice_key'),key='AQ.'+'x'.repeat(280);
    for(const mode of ['ok','exit','oversize','error','timeout']){
        let actual,killed=false;
        const result=await loadKey('C:/fixture',{executable:'fixture-electron',timeout:mode==='timeout'?5:1000,spawn:(exe,args,options)=>{
            actual={exe,args,options};const child=new EventEmitter();child.stdout=new EventEmitter();child.kill=()=>{killed=true;};
            if(mode!=='timeout')queueMicrotask(()=>{if(mode==='error')child.emit('error',Error(key));else{child.stdout.emit('data',Buffer.from(mode==='oversize'?'x'.repeat(1025):'\r\n'+key));child.emit('close',mode==='exit'?1:0);}});
            return child;
        }});
        assert.equal(result,mode==='ok'?key:'');assert.equal(JSON.stringify(actual.args).includes(key),false);
        assert.equal(actual.options.env.WORD_GEMINI_TTS_KEY,undefined);assert.equal(actual.options.env.ELECTRON_RUN_AS_NODE,undefined);
        assert.deepEqual(actual.options.stdio,['ignore','pipe','ignore']);assert.equal(actual.options.windowsHide,true);
        if(['timeout','oversize'].includes(mode))assert.ok(killed);
    }
});
test('native voice: eleven species have distinct selectable defaults, seven samples and bounded independent preferences',t=>{
    assert.equal(voiceRules.defaults['mentor-adventurer'],'Leda');
    assert.equal(voiceRules.species.length,11);assert.equal(new Set(Object.values(voiceRules.defaults)).size,11);
    for(const s of voiceRules.species)assert.ok(voiceRules.validVoice(voiceRules.defaults[s]));
    assert.deepEqual(Object.keys(voiceRules.samples).sort(),core.locales.toSorted());
    const dir=directory(t),prefs=nativeVoice.createPreferences(dir),value={version:1,enabled:false,voices:{dragon:'Kore',robot:'Puck'}};
    assert.ok(prefs.save(value).ok);assert.deepEqual(nativeVoice.createPreferences(dir).load().value,value);
    assert.equal(prefs.save({...value,apiKey:'secret'}).ok,false);assert.equal(prefs.save({...value,voices:{dragon:'arbitrary-voice'}}).ok,false);
    fs.writeFileSync(path.join(dir,'native-voice-preferences.json'),'invalid');assert.equal(prefs.load().ok,false);assert.equal(prefs.save(value).ok,false);
});
test('native voice: preview only sends a fixed sample, cached across restarts, with no state or key in the result',async t=>{
    const dir=directory(t),calls=[];let loaded=0;
    const opts={directory:dir,session:{load(){loaded++;throw Error('must not read child for a sample');}},key:()=> 'test-secret',fetcher:async(url,o)=>{calls.push({url,o});return voiceResponse();}};
    const service=nativeVoice.createVoice(opts),req={kind:'preview',voice:'Kore',locale:'ja'};
    const r=await service.generate(req);assert.ok(r.ok);assert.ok(nativeVoice.validWav(Buffer.from(r.audio)));assert.equal(loaded,0);
    const body=JSON.parse(calls[0].o.body);assert.equal(body.input[0].content[0].text,voiceRules.samples.ja);assert.equal(body.store,false);assert.equal(body.model,voiceRules.model);
    assert.deepEqual(Object.keys(body).sort(),['model','input','response_format','generation_config','store'].sort());
    assert.equal(calls[0].o.headers['x-goog-api-key'],'test-secret');assert.equal(calls[0].o.redirect,'error');assert.equal(JSON.stringify(r).includes('test-secret'),false);
    assert.ok((await service.generate(req)).ok);assert.ok((await nativeVoice.createVoice(opts).generate(req)).ok);assert.equal(calls.length,1);
    assert.equal((await service.generate({...req,text:'private original'})).ok,false);assert.equal(calls.length,1);
});
test('native voice: only the latest saved complete reply can be spoken; no history, input, notes or interpretation are sent',async t=>{
    const dir=directory(t),calls=[],state={locale:'en',game:{origin:{appearance:'dragon'}},turns:[{id:'turn-1',world:{},status:'complete',input:'private original',result:{reply:'A short reply.',interpretation:{summary:'private understanding'}}}]};
    const service=nativeVoice.createVoice({directory:dir,session:{load:()=>({ok:true,state})},key:()=> 'test-secret',fetcher:async(_url,o)=>{calls.push(JSON.parse(o.body));return voiceResponse();}});
    assert.ok(service.save({version:1,enabled:true,voices:{dragon:'Puck'}}).ok);
    assert.ok((await service.generate({kind:'reply',turnId:'turn-1'})).ok);assert.equal(calls[0].generation_config.speech_config[0].voice,'Puck');
    assert.equal(calls[0].input[0].content[0].text,'A short reply.');assert.equal(JSON.stringify(calls).includes('private'),false);
    assert.ok((await service.generate({kind:'reply',turnId:'turn-1'})).ok);assert.equal(calls.length,1);
    state.turns.push({id:'turn-2',status:'pending'});assert.equal((await service.generate({kind:'reply',turnId:'turn-1'})).ok,false);
    assert.equal((await service.generate({kind:'reply',turnId:'turn-2'})).ok,false);assert.equal(calls.length,1);
    state.turns.pop();service.save({version:1,enabled:false,voices:{}});assert.equal((await service.generate({kind:'reply',turnId:'turn-1'})).ok,false);
    assert.equal(calls.length,1);assert.equal(fs.existsSync(path.join(dir,'native-memory.json')),false);
    assert.equal(fs.existsSync(path.join(dir,'native-voice-samples-v1')),false,'personal replies are not persisted as audio');
});
test('native voice: missing key, payment/quota failures, malformed audio and redirects never retry or fall back',async t=>{
    for(const code of [402,403,429,500]){let calls=0;const service=nativeVoice.createVoice({directory:directory(t),session:{},key:()=> 'test',fetcher:async()=>{calls++;return new Response('',{status:code});}});
        assert.equal((await service.generate({kind:'preview',voice:'Kore',locale:'en'})).ok,false);assert.equal(calls,1);}
    let calls=0;const service=nativeVoice.createVoice({directory:directory(t),session:{},key:()=>'',fetcher:async()=>{calls++;return voiceResponse();}});
    assert.equal((await service.generate({kind:'preview',voice:'Kore',locale:'en'})).error,'missing');assert.equal(calls,0);
    const bad=nativeVoice.createVoice({directory:directory(t),session:{},key:()=> 'test',fetcher:async()=>new Response(JSON.stringify({steps:[{type:'model_output',content:[{type:'audio',data:Buffer.from('not WAV').toString('base64')}]}]}))});
    assert.equal((await bad.generate({kind:'preview',voice:'Kore',locale:'en'})).error,'output');
    const wrong=voiceWav();wrong.writeUInt32LE(48000,24);assert.equal(nativeVoice.validWav(wrong),false);assert.equal(nativeVoice.validWav(voiceWav().subarray(0,40)),false);
});
test('native voice: concurrent, cancelled and timed-out generations cannot cache or return late audio',async t=>{
    let release;const dir=directory(t),service=nativeVoice.createVoice({directory:dir,session:{},key:()=> 'test',fetcher:()=>new Promise(r=>release=r)}),req={kind:'preview',voice:'Kore',locale:'en'};
    const first=service.generate(req);assert.equal((await service.generate(req)).error,'busy');service.cancel();release(voiceResponse());assert.equal((await first).error,'cancelled');
    assert.equal(fs.existsSync(path.join(dir,'native-voice-samples-v1')),false);
    const timed=nativeVoice.createVoice({directory:directory(t),session:{},key:()=> 'test',timeout:10,fetcher:async(_u,o)=>new Promise((_resolve,reject)=>o.signal.addEventListener('abort',()=>reject(Error('aborted'))))});
    assert.equal((await timed.generate(req)).error,'cancelled');service.dispose();assert.equal((await service.generate(req)).error,'busy');
});
test('native voice credentials stay encrypted outside game saves and fail closed without OS encryption',t=>{
    const dir=directory(t),{credentials}=require('../scripts/experimental/native_voice_credentials'),key='AIza'+'x'.repeat(32);
    const safe={isEncryptionAvailable:()=>true,encryptString:s=>Buffer.from(s.split('').reverse().join('')),decryptString:b=>b.toString().split('').reverse().join('')};
    const store=credentials(dir,safe);assert.ok(store.save(key));assert.equal(store.load(),key);assert.equal(fs.readFileSync(path.join(dir,'native-voice-key.bin')).includes(key),false);
    assert.equal(credentials(dir,{isEncryptionAvailable:()=>false}).load(),'');assert.equal(credentials(dir,{isEncryptionAvailable:()=>false}).save(key),false);
});
test('native voice credentials accept auth keys without truncation and report non-secret local failures',t=>{
    const dir=directory(t),{credentials}=require('../scripts/experimental/native_voice_credentials');
    const safe={isEncryptionAvailable:()=>true,encryptString:s=>Buffer.from(s.split('').reverse().join('')),decryptString:b=>b.toString().split('').reverse().join('')};
    const store=credentials(dir,safe),key='AQ.'+'x'.repeat(280);
    assert.deepEqual(store.saveResult(key),{ok:true});assert.equal(store.load(),key);
    for(const invalid of ['key name','https://example.com/key','x'.repeat(513),'AQ.'+'x'.repeat(20)+'\n',null])assert.deepEqual(store.saveResult(invalid),{ok:false,error:'format'});
    assert.equal(store.load(),key,'invalid input preserves the previously saved key');
    assert.deepEqual(credentials(dir,{isEncryptionAvailable:()=>false}).saveResult(key),{ok:false,error:'encryption'});
    assert.deepEqual(credentials(dir,{isEncryptionAvailable:()=>true,encryptString(){throw Error(key);}}).saveResult(key),{ok:false,error:'encryption'});
    const blocked=path.join(dir,'file');fs.writeFileSync(blocked,'occupied');
    assert.deepEqual(credentials(blocked,safe).saveResult(key),{ok:false,error:'storage'});
});
test('voice setup clears secret input and handles structured success and specific failures',async()=>{
    const vm=require('node:vm'),code=fs.readFileSync(path.join(__dirname,'../scripts/experimental/native_voice_setup_ui.js'),'utf8');
    for(const result of [{ok:true},{ok:false,error:'format'},{ok:false,error:'encryption'},{ok:false,error:'storage'},{ok:false,error:'window'},true]){
        const input={value:'  AQ.'+'x'.repeat(280)+'  '},button={},status={},form={};let sent;
        vm.runInNewContext(code,{document:{querySelector:s=>s==='form'?form:button,getElementById:id=>id==='key'?input:status},window:{voiceSetup:{save:async key=>{sent=key;assert.equal(input.value,'');return result;}}}});
        await form.onsubmit({preventDefault(){}});assert.equal(sent.length,283);assert.equal(input.value,'');assert.equal(Boolean(input.disabled),result.ok===true);
        assert.equal(status.textContent.startsWith('Saved.'),result.ok===true);assert.equal(status.textContent.includes(sent),false);
        if(!result.ok)assert.equal(button.disabled,false);
    }
});
test('native voice IPC rejects other senders, subframes and URLs and releases all handlers on close',()=>{
    const vm=require('node:vm'),{EventEmitter}=require('node:events'),handlers=new Map(),ipcMain=new EventEmitter(),calls=[];
    ipcMain.handle=(name,fn)=>handlers.set(name,fn);ipcMain.removeHandler=name=>handlers.delete(name);
    class Window extends EventEmitter{constructor(){super();this.webContents=new EventEmitter();this.webContents.mainFrame={};this.webContents.setWindowOpenHandler=()=>{};}
        isDestroyed(){return false;}loadURL(url){this.webContents.mainFrame.url=url;return Promise.resolve();}}
    const fixture={exports:{}};
    vm.runInNewContext(fs.readFileSync(path.resolve(__dirname,'../scripts/experimental/native_window.js'),'utf8'),{module:fixture,__dirname:path.resolve(__dirname,'../scripts/experimental'),console,require:name=>name==='electron'?{BrowserWindow:Window,ipcMain}:require(name)});
    const voice={load(){calls.push('load');return {ok:true};},save(){calls.push('save');return {ok:true};},generate(){calls.push('generate');return {ok:true};},cancel(){calls.push('cancel');},dispose(){calls.push('dispose');}};
    const window=fixture.exports.openWindow({cancel(){},dispose(){},characters(){calls.push('characters');return {ok:true};},selectCharacter(){calls.push('select-character');return {ok:true};},createCharacter(){calls.push('create-character');return {ok:true};},mentorStart(){calls.push('mentor-start');return {ok:true};},mentorNext(){calls.push('mentor-next');return {ok:true};},mentorIntro(){calls.push('mentor-intro');return {ok:true};},practiceNext(){calls.push('practice-next');return {ok:true};},mentorStop(){calls.push('mentor-stop');}},{show:false,voice}),event={sender:window.webContents,senderFrame:window.webContents.mainFrame};
    for(const channel of ['native-voice-load','native-voice-save','native-voice-generate','native-characters','native-select-character','native-create-character','native-mentor-start','native-mentor-next','native-mentor-intro','native-practice-next']){
        const fn=handlers.get(channel);assert.equal(fn({...event,sender:{}}).ok,false);assert.equal(fn({...event,senderFrame:{url:event.senderFrame.url}}).ok,false);
        const url=event.senderFrame.url;event.senderFrame.url='https://example.com/';assert.equal(fn(event).ok,false);event.senderFrame.url=url;assert.equal(fn(event).ok,true);
    }
    assert.deepEqual(calls,['load','save','generate','characters','select-character','create-character','mentor-start','mentor-next','mentor-intro','practice-next']);ipcMain.emit('native-voice-cancel',{...event,sender:{}});assert.equal(calls.length,10);
    ipcMain.emit('native-mentor-stop',{...event,sender:{}});assert.equal(calls.length,10);ipcMain.emit('native-mentor-stop',event);assert.deepEqual(calls.slice(-2),['mentor-stop','cancel']);
    ipcMain.emit('native-voice-cancel',event);assert.equal(calls.at(-1),'cancel');window.emit('hide');window.emit('closed');assert.equal(calls.at(-1),'dispose');assert.equal(handlers.size,0);assert.equal(ipcMain.listenerCount('native-voice-cancel'),0);
});
test('interactive launcher uses a visible Windows startup and reports spawn and abnormal exit failures',()=>{
    const {EventEmitter}=require('node:events'),{launch}=require('../scripts/experimental/native');
    const oldExit=process.exitCode,env={ELECTRON_RUN_AS_NODE:'1',KEEP:'yes'},messages=[];let actual;
    try{
        const child=launch({executable:'test-electron',env,report:message=>messages.push(message),spawn:(exe,args,settings)=>{
            actual={exe,args,settings};return new EventEmitter();
        }});
        assert.equal(actual.settings.windowsHide,false);assert.equal(actual.settings.stdio,'inherit');
        assert.equal(actual.settings.env.ELECTRON_RUN_AS_NODE,undefined);assert.equal(env.ELECTRON_RUN_AS_NODE,'1');
        child.emit('error',new Error('spawn denied'));assert.equal(process.exitCode,1);assert.match(messages[0],/spawn denied/);
        child.emit('exit',null,'SIGTERM');assert.equal(process.exitCode,1);assert.match(messages.at(-1),/SIGTERM/);
        child.emit('exit',0,null);assert.equal(process.exitCode,0);
    }finally{process.exitCode=oldExit;}
});
const start=()=>core.begin(core.create(character,'en'),'Koro is sweet.','en',1);
test('fast trial sets the low-latency model only in the child environment and honors an explicit choice',()=>{
    const {EventEmitter}=require('node:events'),{launch}=require('../scripts/experimental/native');let actual;
    const spawn=(_exe,_args,settings)=>{actual=settings;return new EventEmitter();};
    const env={EXAMPLE:'preserved'};launch({env,spawn,executable:'test-electron'});assert.equal(actual.env.WORD_GEMINI_MODEL,undefined);
    launch({env,spawn,executable:'test-electron',fastTrial:true});assert.equal(actual.env.WORD_GEMINI_MODEL,'gemini-4-hydrogen-low');assert.equal(env.WORD_GEMINI_MODEL,undefined);
    launch({env:{WORD_GEMINI_MODEL:'explicit-model'},spawn,executable:'test-electron',fastTrial:true});assert.equal(actual.env.WORD_GEMINI_MODEL,'explicit-model');
});
function result(p,kind='teaching') {return {reply:'You told me that.',interpretation:{kind,summary:'The player explained Koro.'},memories:kind==='teaching'?[{sourceId:p.id,quote:p.input,text:'The player says Koro is sweet; unverified.'}]:[],references:[]};}
function directory(t) {const dir=fs.mkdtempSync(path.join(os.tmpdir(),'native-memory-test-'));t.after(()=>fs.rmSync(dir,{recursive:true,force:true}));return dir;}
test('teaching keeps the exact original, a separate interpretation, and quoted unverified claim',()=>{
    const s=start(),before=JSON.stringify(s.state),r=result(s.packet),done=core.finish(s.state,s.packet.id,s.state.revision,r);
    assert.equal(JSON.stringify(s.state),before);assert.ok(core.validState(done));assert.equal(done.turns[0].input,'Koro is sweet.');
    assert.equal(done.turns[0].result.memories[0].sourceId,'turn-1');assert.equal(Object.hasOwn(done,'achievements'),false);
});
test('questions, social chat, requests, and unclear inputs cannot create taught memories',()=>{
    const s=start();for(const kind of ['question','social','request','unclear']){
        const r=result(s.packet);r.interpretation.kind=kind;assert.equal(core.validResult(r,s.packet),false);
        r.memories=[];assert.equal(core.validResult(r,s.packet),true);
    }
});
test('fabricated citations, generated replies as evidence, hidden fields and unsupplied references fail closed',()=>{
    const s=start();for(const edit of [r=>r.memories[0].sourceId='assistant',r=>r.memories[0].quote='invented',r=>r.references=['turn-99'],r=>r.action='rest',r=>r.memories[0].verified=true,r=>r.interpretation.kind='experienced']){
        const r=result(s.packet);edit(r);assert.equal(core.validResult(r,s.packet),false);
    }
});
test('later questions can recall taught originals without using assistant replies as sources',()=>{
    const s=start(),done=core.finish(s.state,s.packet.id,s.state.revision,result(s.packet));
    const next=core.begin(done,'What is Koro like?','en',2),r=result(next.packet,'question');r.references=['turn-1'];
    assert.ok(core.validResult(r,next.packet));assert.equal(next.packet.memories[0].raw,'Koro is sweet.');
    assert.deepEqual(Object.keys(next.packet).sort(),['character','id','input','locale','memories','recent'].sort());
    assert.equal(next.packet.memories[0].sourceId,'turn-1');assert.ok(!JSON.stringify(next.packet.memories).includes('You told me that.'));
});
test('corrections preserve previous claims and then survive save validation',()=>{
    const s=start(),done=core.finish(s.state,s.packet.id,s.state.revision,result(s.packet));
    const next=core.begin(done,'Correction: Koro is sour.','en',2),r=result(next.packet,'correction');
    r.memories=[{sourceId:next.packet.id,quote:next.packet.input,text:'Correction: sour, not sweet; unverified.'}];r.references=['turn-1'];
    const corrected=core.finish(next.state,next.packet.id,next.state.revision,r);assert.ok(core.validState(corrected));
    assert.equal(corrected.turns[0].input,'Koro is sweet.');assert.equal(corrected.turns[1].input,'Correction: Koro is sour.');
});
test('packet budgets use whole original/interpretation pairs, at most 12 and 8000 characters',()=>{
    let state=core.create(character,'en');for(let i=0;i<20;i++){
        const s=core.begin(state,String(i)+' '+ 'x'.repeat(1500),'en',i),r=result(s.packet,'social');state=core.finish(s.state,s.packet.id,s.state.revision,r);
    }
    const p=core.begin(state,'x','en',21).packet;assert.ok(core.validPacket(p));assert.ok(p.memories.length<=12);
    assert.ok(p.memories.reduce((n,m)=>n+m.raw.length+m.interpretation.length,0)<=8000);
    assert.ok(p.memories.every(m=>m.raw.length>1500));assert.equal(p.recent.length,0);
    for(const field of ['world','selfState','actions','species'])assert.equal(core.validPacket({...p,[field]:'secret'}),false);
});
test('stale revision and double results cannot replace an accepted turn',()=>{
    const s=start();assert.throws(()=>core.finish(s.state,s.packet.id,99,result(s.packet)),/stale/);
    const done=core.finish(s.state,s.packet.id,s.state.revision,result(s.packet));assert.throws(()=>core.finish(done,s.packet.id,done.revision,result(s.packet)),/stale/);
});
test('invalid storage blocks overwrite instead of silently resetting the character',t=>{
    const store=createStore(directory(t));fs.writeFileSync(store.file,'corrupt');assert.equal(store.load().ok,false);
    assert.equal(store.save(core.create(character,'en')).ok,false);assert.equal(fs.readFileSync(store.file,'utf8'),'corrupt');
});
test('atomic store keeps a backup and reloads original sources and references',t=>{
    const store=createStore(directory(t)),s=start();assert.ok(store.save(s.state).ok);
    const done=core.finish(s.state,s.packet.id,s.state.revision,result(s.packet));assert.ok(store.save(done).ok);
    assert.deepEqual(store.load().value,done);assert.deepEqual(JSON.parse(fs.readFileSync(store.file+'.backup')),s.state);
});
test('session owns state, validates output before persistence, and records no failed proposal',async t=>{
    const store=createStore(directory(t)),events=[],packets=[];
    const responder={reply:async p=>{packets.push(p);const r=result(p);r.memories[0].quote='forged';return {ok:true,proposal:r};},cancel(){},dispose(){}};
    const session=createSession({store,responder,record:e=>events.push(e)});assert.ok(session.create(character,'en').ok);
    const reply=await session.submit('A statement','en');assert.equal(reply.ok,false);assert.equal(reply.error,'output');
    assert.equal(store.load().value.turns[0].status,'failed');assert.equal(store.load().value.turns[0].result,null);
    assert.equal(events.at(-1).result,null);assert.ok(core.validPacket(packets[0]));
});
test('reopening an interrupted request preserves its original and permits the next request',t=>{
    const store=createStore(directory(t)),s=start();store.save(s.state);
    const session=createSession({store,responder:{cancel(){},dispose(){}}});const loaded=session.load();
    assert.equal(loaded.state.turns[0].status,'failed');assert.equal(loaded.state.turns[0].input,s.packet.input);assert.ok(core.validState(loaded.state));
});
test('quota failure cannot create memories and concurrent inputs do not start a second generation',async t=>{
    let release,calls=0;const store=createStore(directory(t));
    const session=createSession({store,responder:{reply:()=>{calls++;return new Promise(resolve=>release=resolve);},cancel(){release({ok:false,error:'cancelled'});},dispose(){}}});
    session.create(character,'en');const first=session.submit('Original','en');assert.equal((await session.submit('Second','en')).ok,false);
    release({ok:false,error:'quota'});const reply=await first;assert.equal(reply.error,'quota');assert.equal(calls,1);assert.equal(reply.state.turns[0].result,null);
});
test('structured protocol uses the same no-tools no-paid-fallback transport and rejects malformed JSON',async t=>{
    const {EventEmitter}=require('node:events'),{PassThrough}=require('node:stream');let child,call;
    const spawn=(exe,args,settings)=>{call={args,settings};child=new EventEmitter();child.stdout=new PassThrough();child.stderr=new PassThrough();child.stdin=new PassThrough();child.kill=()=>{};return child;};
    const responder=require('../scripts/experimental/gemini_reply').createResponder(directory(t),{spawn,entry:__filename,skipAuthCheck:true,protocol:core.protocol});t.after(()=>responder.dispose());
    const p=start().packet,pending=responder.reply(p);
    const settings=JSON.parse(fs.readFileSync(responder.config.session));assert.equal(settings.useG1Credits,false);assert.equal(settings.permissions.allow.length,0);assert.equal(call.settings.shell,false);
    child.stdout.write(JSON.stringify({event:'result',result:{status:'SUCCESS',response:JSON.stringify(result(p)),stats:{tools:{totalCalls:0}}}})+'\n');child.exitCode=0;child.emit('close',0);
    const output=await pending;assert.ok(output.ok);assert.ok(core.validResult(output.proposal,p));
    assert.equal(core.protocol.decode('not json'),null);assert.equal(core.validPacket({...p,input:'x'.repeat(4001)}),false);
});
