'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const core=require('../experimental_word_llm_native'),{createStore,createSession}=require('../scripts/experimental/native_store');
const character={name:'A',self:'I',player:'you'};
const voiceRules=require('../experimental_word_llm_native_voice');
const nativeVoice=require('../scripts/experimental/native_voice');
function voiceWav(){const pcm=Buffer.alloc(4800),b=Buffer.alloc(44+pcm.length);b.write('RIFF');b.writeUInt32LE(b.length-8,4);b.write('WAVEfmt ',8);b.writeUInt32LE(16,16);b.writeUInt16LE(1,20);b.writeUInt16LE(1,22);b.writeUInt32LE(24000,24);b.writeUInt32LE(48000,28);b.writeUInt16LE(2,32);b.writeUInt16LE(16,34);b.write('data',36);b.writeUInt32LE(pcm.length,40);return b;}
const voiceResponse=()=>new Response(JSON.stringify({steps:[{type:'model_output',content:[{type:'audio',data:voiceWav().toString('base64')}]}]}));
const designResponse=(id='voice_fixture')=>new Response(JSON.stringify({type:'prompted',id,sample_audio:{mime_type:'audio/wav',data:voiceWav().toString('base64')}}));

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
    const window=fixture.exports.openWindow({cancel(){},dispose(){}},{show:false,voice}),event={sender:window.webContents,senderFrame:window.webContents.mainFrame};
    for(const channel of ['native-voice-load','native-voice-save','native-voice-generate']){
        const fn=handlers.get(channel);assert.equal(fn({...event,sender:{}}).ok,false);assert.equal(fn({...event,senderFrame:{url:event.senderFrame.url}}).ok,false);
        const url=event.senderFrame.url;event.senderFrame.url='https://example.com/';assert.equal(fn(event).ok,false);event.senderFrame.url=url;assert.equal(fn(event).ok,true);
    }
    assert.deepEqual(calls,['load','save','generate']);ipcMain.emit('native-voice-cancel',{...event,sender:{}});assert.equal(calls.length,3);
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
