'use strict';
const fs=require('node:fs'),path=require('node:path'),{createHash}=require('node:crypto');
const rules=require('../../experimental_word_llm_native_voice');
const endpoint='https://generativelanguage.googleapis.com/v1beta/interactions';
const MAX_AUDIO=5760044,MAX_RESPONSE=8*1024*1024;
function classifyExplanation(error,privateTexts=[]){
    // Recognize provider templates, never retain text or arbitrary field names from the body.
    // A generation failure is not evidence of a policy refusal or of a particular forbidden trait.
    const classes=new Set(),fields=new Set(),signals=new Set(),detailTypes=new Set();let messagePresent=false;
    const knownFields=new Set(['voice','store','voice.model','voice.type','voice.gender','voice.language_code','voice.display_name','voice.prompted','voice.prompted.input','voice.prompted.base_voice']);
    const signalRules={
        voice:/\bvoic(?:e|es)\b|音声|声の/u,prompt:/\b(?:prompt|description|input)\b|指示|入力/u,
        generation:/\b(?:generat\w*|synthesi\w*|creat\w*)\b|生成/u,
        failure:/\b(?:fail\w*|unable|cannot|incomplete|can't|couldn't)\b|could not|did not complete|失敗|できません/u,
        safety:/\b(?:safety|unsafe|harmful)\b|安全/u,policy:/\b(?:policy|policies|prohibited|disallowed|blocked|restricted)\b|ポリシー|禁止|制限/u,
        age:/\b(?:age|ages|child|children|minor|minors|underage)\b|年齢|未成年|子供|子ども/u,
        rights:/\b(?:copyright|impersonat\w*|intellectual property|consent)\b|著作権|同意/u,
        permission:/\b(?:permission|access|denied|forbidden|unauthorized)\b|権限/u,
        parameter:/\b(?:parameter|field|argument|payload|schema)\b|パラメータ|引数|項目/u,
        invalid:/\b(?:invalid|incorrect|malformed|bad request)\b|不正|無効/u,
        unsupported:/\bunsupported\b|not supported|not available|非対応|未対応/u,
        missing:/\b(?:missing|required|empty)\b|必須|空欄/u,
        length:/\b(?:length|size|long|short|characters)\b|文字数|長さ/u,
        language:/\b(?:language|locale|english|japanese)\b|言語|英語|日本語/u,
        gender:/\b(?:gender|male|female|neutral)\b|性別/u,model:/\bmodel\b|モデル/u,
        format:/\b(?:format|encoding|json|mime)\b|形式/u,
        authentication:/\b(?:authentication|credential\w*|api key|token)\b|認証/u,
        billing:/\b(?:billing|credit\w*|payment|balance|spend)\b|請求|残高|支払/u,
        quota:/\b(?:quota|rate limit|resource exhausted|too many requests)\b|割り当て/u,
        retry:/\b(?:retry|try again|rephras\w*)\b|再試行|言い換/u,
        internal:/\b(?:internal|backend|server|unavailable)\b|内部|サーバー/u
    };
    function classify(message){
        if(typeof message!=='string')return;
        if(message.trim())messagePresent=true;
        // Suppress exact current input/key echoes, then quoted fragments, before looking for hints.
        for(const privateText of privateTexts)if(typeof privateText==='string'&&privateText)message=message.split(privateText).join(' ');
        const match=/^Invalid value at ['"]([^'"]{1,80})['"]/i.exec(message);
        if(match&&knownFields.has(match[1])){fields.add(match[1]);classes.add('parameter_rejected');}
        message=message.replace(/"[^"\n]*"|「[^」]*」|“[^”]*”/gu,' ').replace(/(^|\s)'[^'\n]*'(?=$|[\s.,;:)])/gu,'$1 ').toLowerCase();
        for(const [name,pattern]of Object.entries(signalRules))if(pattern.test(message))signals.add(name);
        if(/^Voice generation did not complete(?:[.,!]|$)/i.test(message))classes.add('generation_incomplete');
        else if(/^(?:The )?(?:request|prompt|voice generation) (?:was |is )?(?:blocked|rejected) (?:due to|because of) (?:safety|policy|prohibited)/i.test(message))classes.add('policy_rejection');
        else if(/^Invalid JSON payload received\. Unknown name /i.test(message))classes.add('unknown_parameter');
        else if(/^(?:Quota exceeded|Resource has been exhausted|Rate limit exceeded|Too many requests)\b/i.test(message))classes.add('usage_limit');
        else if(/^(?:Billing (?:is |has been )?(?:disabled|not enabled|not active)|Insufficient (?:credits|balance))\b/i.test(message))classes.add('billing_unavailable');
        else if(/^(?:API key (?:not valid|is invalid|has expired)|Request had invalid authentication credentials)\b/i.test(message))classes.add('authentication');
        else if(/^Model (?:is not supported|not found|is not available)\b/i.test(message))classes.add('model_unavailable');
        if(/^(?:request contains an invalid argument|invalid request|invalid argument)(?:[.!:]|$)/i.test(message.trim()))classes.add('generic_invalid_request');
    }
    classify(error?.message);
    for(const detail of (Array.isArray(error?.details)?error.details:[])){
        const type={'type.googleapis.com/google.rpc.BadRequest':'bad_request','type.googleapis.com/google.rpc.ErrorInfo':'error_info','type.googleapis.com/google.rpc.QuotaFailure':'quota_failure','type.googleapis.com/google.rpc.PreconditionFailure':'precondition_failure','type.googleapis.com/google.rpc.RetryInfo':'retry_info','type.googleapis.com/google.rpc.LocalizedMessage':'localized_message'}[detail?.['@type']];
        detailTypes.add(typeof type==='string'?type:'other');
        if(type==='localized_message')classify(detail.message);
        if(detail?.['@type']!=='type.googleapis.com/google.rpc.BadRequest')continue;
        for(const violation of (Array.isArray(detail.fieldViolations)?detail.fieldViolations:[])){
            if(knownFields.has(violation?.field)){fields.add(violation.field);classes.add('parameter_rejected');}
            classify(violation?.description);
        }
    }
    return {classifierVersion:2,explanationPresent:messagePresent,explanationClasses:classes.size?[...classes].sort():['unclassified'],explanationSignals:[...signals].sort(),detailTypes:[...detailTypes].sort(),...(fields.size?{rejectedFields:[...fields].sort()}:{})};
}
function validWav(b){
    if(!Buffer.isBuffer(b)||b.length<44||b.length>MAX_AUDIO||b.toString('ascii',0,4)!=='RIFF'||b.toString('ascii',8,12)!=='WAVE'||b.readUInt32LE(4)+8!==b.length)return false;
    let fmt=false,data=false;
    for(let i=12;i+8<=b.length;){const size=b.readUInt32LE(i+4),end=i+8+size;if(end>b.length)return false;
        const tag=b.toString('ascii',i,i+4);
        if(tag==='fmt '){if(size<16||b.readUInt16LE(i+8)!==1||b.readUInt16LE(i+10)!==1||b.readUInt32LE(i+12)!==24000||b.readUInt16LE(i+22)!==16)return false;fmt=true;}
        if(tag==='data'){if(!size||size%2)return false;data=true;}
        i=end+(size%2);
    }return fmt&&data;
}
function createPreferences(directory){
    const file=path.join(directory,'native-voice-preferences.json');let blocked=false;
    return {load(){try{if(!fs.existsSync(file))return {ok:true,value:rules.fresh()};
        if(fs.statSync(file).size>8192)throw Error('size');const value=JSON.parse(fs.readFileSync(file,'utf8'));if(!rules.valid(value))throw Error('invalid');return {ok:true,value};
    }catch(_){blocked=true;return {ok:false,error:'save'};}},
    save(value){try{if(blocked||!rules.valid(value))return {ok:false,error:'save'};fs.mkdirSync(directory,{recursive:true});
        fs.writeFileSync(file+'.tmp',JSON.stringify(value),{encoding:'utf8',flush:true});fs.renameSync(file+'.tmp',file);return {ok:true};
    }catch(_){return {ok:false,error:'save'};}}};
}
function createVoice({directory,session,key=()=>process.env.WORD_GEMINI_TTS_KEY||'',fetcher=globalThis.fetch,timeout=60000}){
    const preferences=createPreferences(directory),cacheDir=path.join(directory,'native-voice-samples-v1');
    const designs=require('./native_voice_designs').createDesigns(directory),cloudId=require('./native_voice_designs').cloudId;
    let current=null,closed=false,replyCache=null,designAudio=null;
    const view=e=>({id:e.id,species:e.species,locale:e.locale,settings:e.settings});
    function load(){const r=preferences.load(),d=designs.load();return r.ok&&d.ok&&Object.entries(r.value.voices).every(([species,id])=>!rules.design.validId(id)||d.entries.some(e=>e.id===id&&e.species===species))?{ok:true,value:r.value,designs:d.entries.map(view)}:{ok:false,error:'save'};}
    function save(value){cancel();replyCache=null;const prior=load();if(!prior.ok)return prior;
        if(!rules.valid(value)||Object.entries(value.voices).some(([species,id])=>rules.design.validId(id)&&!prior.designs.some(e=>e.id===id&&e.species===species)))return {ok:false,error:'input'};
        return preferences.save(value);}
    function resolveVoice(id){if(rules.validVoice(id))return id;const d=designs.load();return d.ok?d.entries.find(e=>e.id===id)?.cloudId:null;}
    function cancel(){current?.abort();}
    function cacheFile(voice,locale){return path.join(cacheDir,createHash('sha256').update(JSON.stringify([rules.model,voice,locale,rules.samples[locale]])).digest('hex')+'.wav');}
    function readSample(file){try{if(fs.statSync(file).size>MAX_AUDIO)return null;const b=fs.readFileSync(file);return validWav(b)?b:null;}catch(_){return null;}}
    function writeSample(file,audio){try{
        fs.mkdirSync(cacheDir,{recursive:true});const files=fs.readdirSync(cacheDir).filter(n=>/^[a-f0-9]{64}\.wav$/.test(n)).map(n=>({file:path.join(cacheDir,n),stat:fs.statSync(path.join(cacheDir,n))})).sort((a,b)=>a.stat.mtimeMs-b.stat.mtimeMs);
        let total=files.reduce((n,f)=>n+f.stat.size,0);while(files.length&&(total+audio.length>32*1024*1024||files.length>=77)){const f=files.shift();fs.unlinkSync(f.file);total-=f.stat.size;}
        fs.writeFileSync(file+'.tmp',audio);fs.renameSync(file+'.tmp',file);
    }catch(_){/* A sample cache failure never changes the child or retries a request. */}}
    async function generate(request){
        // Only fixed classifications enter this local log: never request/response text, IDs or exceptions.
        const started=Date.now(),diagnostic={version:1,at:new Date().toISOString(),kind:['design','preview','reply','mentor','practice'].includes(request?.kind)?request.kind:'invalid',stage:'preflight'};
        let result;
        try{result=await runGenerate(request,diagnostic);return result;}
        finally{
            const entry={...diagnostic,elapsedMs:Math.max(0,Date.now()-started),outcome:result?.ok?'ok':(['busy','input','save','limit','missing','output','cancelled','failed'].includes(result?.error)?result.error:'failed')};
            const line=JSON.stringify(entry);
            try{fs.mkdirSync(directory,{recursive:true});fs.appendFileSync(path.join(directory,'native-voice-diagnostics.jsonl'),line+'\n',{encoding:'utf8',flush:true});}catch(_){console.error('[word-native-voice] diagnostic_write_failed');}
            if(!result?.ok)console.error('[word-native-voice] '+line);
        }
    }
    async function runGenerate(request,diagnostic){
        if(closed||current)return {ok:false,error:'busy'};
        if(!request||typeof request!=='object'||Array.isArray(request))return {ok:false,error:'input'};
        let text,voice,locale,cacheId=null,file=null,creating=false;
        if(request.kind==='design'){
            if(Object.keys(request).sort().join(',')!=='kind,locale,settings,species'||!rules.subjects.includes(request.species)||!Object.hasOwn(rules.samples,request.locale)||!rules.design.valid(request.settings))return {ok:false,error:'input'};
            const p=load(),d=designs.load();if(!p.ok||!d.ok)return {ok:false,error:'save'};
            const existing=d.entries.find(e=>e.species===request.species&&e.locale===request.locale&&rules.design.prompt(e.settings)===rules.design.prompt(request.settings));
            if(existing){
                if(designAudio?.id===existing.id){diagnostic.stage='cache';return {ok:true,audio:new Uint8Array(designAudio.audio),design:view(existing)};}
                diagnostic.stage='reuse';
                return {...await generate({kind:'preview',voice:existing.id,locale:request.locale}),design:view(existing)};
            }
            if(d.entries.length>=200)return {ok:false,error:'limit'};
            creating=true;locale=request.locale;
        }else if(request.kind==='preview'&&Object.keys(request).sort().join(',')==='kind,locale,voice'&&Object.hasOwn(rules.samples,request.locale)){
            locale=request.locale;voice=resolveVoice(request.voice);if(!voice)return {ok:false,error:'input'};
            text=rules.samples[locale];file=cacheFile(voice,locale);const b=readSample(file);if(b){diagnostic.stage='cache';return {ok:true,audio:new Uint8Array(b)};}
        }else if(request.kind==='reply'&&Object.keys(request).sort().join(',')==='kind,turnId'){
            const s=session.load(),p=load(),state=s.state,turn=state?.turns.at(-1);
            if(!s.ok||!p.ok)return {ok:false,error:'save'};
            if(!p.value.enabled||!state?.game||turn?.status!=='complete'||turn.id!==request.turnId||!turn.world)return {ok:false,error:'input'};
            const species=state.game.origin.appearance;
            text=turn.result.reply;locale=state.locale;voice=resolveVoice(p.value.voices[species]||rules.defaults[species]);
            cacheId=JSON.stringify([turn.id,text,locale,voice]);if(replyCache?.id===cacheId){diagnostic.stage='cache';return {ok:true,audio:new Uint8Array(replyCache.audio)};}
        }else if(request.kind==='resume'&&Object.keys(request).sort().join(',')==='id,kind'){
            const p=load();if(!p.ok||!p.value.enabled)return {ok:false,error:'input'};
            const line=session.resumeLine?.(request.id),s=session.load();if(!line||!s.ok||!s.state?.game)return {ok:false,error:'input'};
            const species=s.state.game.origin.appearance;text=line.text;locale=line.locale;voice=resolveVoice(p.value.voices[species]||rules.defaults[species]);
            cacheId=JSON.stringify(['resume',request.id,text,locale,voice]);
        }else if(request.kind==='practice'&&Object.keys(request).sort().join(',')==='id,kind,slot'){
            const line=session.practiceLine?.(request.id,request.slot),s=session.load(),p=load();
            if(!line||!s.ok||!p.ok||!p.value.enabled||!s.state?.game)return {ok:false,error:'input'};
            const current=s.state.game.practices?.at(-1),subject=line.speaker==='mentor'?(current?.npc==='building'||current?.remote?.npc==='building'?'mentor-builder':'mentor-adventurer'):s.state.game.origin.appearance;
            voice=resolveVoice(p.value.voices[subject]||rules.defaults[subject]);text=line.text;locale=line.locale;
            cacheId=JSON.stringify(['practice',request.id,request.slot,voice,text]);if(replyCache?.id===cacheId)return {ok:true,audio:new Uint8Array(replyCache.audio)};
        }else if(request.kind==='mentor'&&Object.keys(request).sort().join(',')==='id,kind,round,speaker'){
            const line=session.mentorLine?.(request.id,request.round,request.speaker),s=session.load(),p=load();
            if(!line||!s.ok||!p.ok||!p.value.enabled||!s.state?.game)return {ok:false,error:'input'};
            const subject=request.speaker==='mentor'?'mentor-adventurer':s.state.game.origin.appearance;
            voice=resolveVoice(p.value.voices[subject]||rules.defaults[subject]);text=line.text;locale=line.locale;
            cacheId=JSON.stringify(['mentor',request.id,request.round,request.speaker,voice,text]);if(replyCache?.id===cacheId)return {ok:true,audio:new Uint8Array(replyCache.audio)};
        }else return {ok:false,error:'input'};
        if(!creating&&(typeof text!=='string'||!text.trim()||text.length>1200||!(rules.validVoice(voice)||cloudId(voice))))return {ok:false,error:'input'};
        const secret=key();if(typeof secret!=='string'||!secret.trim()||secret.length>512)return {ok:false,error:'missing'};
        const controller=new AbortController();current=controller;let timedOut=false;
        const timer=setTimeout(()=>{timedOut=true;controller.abort();},timeout);
        try{
            const language={ja:'ja-JP',en:'en-US','zh-CN':'zh-CN',ru:'ru-RU','es-ES':'es-ES','pt-BR':'pt-BR',de:'de-DE'};
            const body=creating?{store:true,voice:{model:rules.model,type:'prompted',display_name:'Companion voice',language_code:language[locale],gender:'neutral',prompted:{input:rules.design.prompt(request.settings,request.species)}}}
                :{model:rules.model,input:[{type:'user_input',content:[{type:'text',text}]}],response_format:{type:'audio'},generation_config:{speech_config:[{voice}]},store:false};
            diagnostic.stage='network';
            const response=await fetcher(creating?'https://generativelanguage.googleapis.com/v1beta/voices':endpoint,{method:'POST',redirect:'error',signal:controller.signal,headers:{'Content-Type':'application/json','x-goog-api-key':secret},body:JSON.stringify(body)});
            diagnostic.httpStatus=response.status;
            if(!response.ok){
                diagnostic.stage='http';
                // Error messages may echo the player's prompt or key. Extract enums only, within 16 KiB.
                diagnostic.errorBodyState='reading';
                try{const reader=response.body.getReader(),chunks=[];let size=0;
                    try{while(true){const {done,value}=await reader.read();if(done)break;size+=value.length;if(size>16384){diagnostic.errorBodyState='too_large';await reader.cancel();break;}chunks.push(Buffer.from(value));}
                        if(size<=16384){const error=JSON.parse(Buffer.concat(chunks).toString('utf8')).error;
                            diagnostic.errorBodyState='parsed';
                            Object.assign(diagnostic,classifyExplanation(error,[secret,creating?rules.design.prompt(request.settings,request.species):text,creating?request.settings.extra:'']));
                            if(['INVALID_ARGUMENT','UNAUTHENTICATED','PERMISSION_DENIED','RESOURCE_EXHAUSTED','FAILED_PRECONDITION','NOT_FOUND','INTERNAL','UNAVAILABLE','DEADLINE_EXCEEDED'].includes(error?.status))diagnostic.providerStatus=error.status;
                            const reasons=(Array.isArray(error?.details)?error.details:[]).map(d=>d?.reason).filter(r=>['RATE_LIMIT_EXCEEDED','QUOTA_EXCEEDED','BILLING_DISABLED','BILLING_NOT_ACTIVE','API_KEY_INVALID','API_KEY_EXPIRED','API_KEY_SERVICE_BLOCKED','ACCESS_DENIED','SERVICE_DISABLED','CONSUMER_INVALID','SAFETY','PROHIBITED_CONTENT'].includes(r));
                            if(reasons.length)diagnostic.providerReasons=[...new Set(reasons)];
                        }
                    }finally{reader.releaseLock();}
                }catch(error){if(diagnostic.errorBodyState!=='too_large')diagnostic.errorBodyState=error instanceof SyntaxError?'invalid_json':'unreadable';}
                return {ok:false,error:[402,403,429].includes(response.status)?'limit':'failed'};
            }
            diagnostic.stage='response_size';
            if(Number(response.headers.get('content-length'))>MAX_RESPONSE)return {ok:false,error:'output'};
            diagnostic.stage='response_body';const reader=response.body.getReader(),chunks=[];let size=0;
            try{while(true){const {done,value}=await reader.read();if(done)break;size+=value.length;if(size>MAX_RESPONSE){await reader.cancel();return {ok:false,error:'output'};}chunks.push(Buffer.from(value));}}finally{reader.releaseLock();}
            diagnostic.stage='response_json';const result=JSON.parse(Buffer.concat(chunks).toString('utf8'));
            if(creating){
                diagnostic.stage='voice_response';
                if(!result||result.type!=='prompted'||!cloudId(result.id))return {ok:false,error:'output'};
                diagnostic.stage='registry';const saved=designs.add({voice:result.id,species:request.species,locale,settings:request.settings});if(!saved.ok)return saved;
                // A request may already have created a remote voice when stopped. Preserve its ID, never apply it automatically.
                if(controller.signal.aborted||closed)return {ok:false,error:'cancelled'};
                diagnostic.stage='sample_format';const part=result.sample_audio;
                diagnostic.audioFormat=['audio/wav','audio/l16','audio/pcm'].includes(part?.mime_type)?part.mime_type:(part?.mime_type?'other':'missing');
                if(!part||part.mime_type!=='audio/wav'||typeof part.data!=='string'||part.data.length>MAX_RESPONSE||!/^[A-Za-z0-9+/]+={0,2}$/.test(part.data))return {ok:false,error:'output',design:view(saved.entry)};
                diagnostic.stage='sample_wav';const audio=Buffer.from(part.data,'base64');if(!validWav(audio))return {ok:false,error:'output',design:view(saved.entry)};
                diagnostic.stage='complete';designAudio={id:saved.entry.id,audio};return {ok:true,audio:new Uint8Array(audio),design:view(saved.entry)};
            }
            diagnostic.stage='speech_format';
            const parts=(result.outputs||[]).filter(p=>p.type==='audio');
            // REST interactions return audio blocks in output steps; never accept URLs or text as audio.
            const stepParts=(result.steps||[]).filter(s=>s.type==='model_output').flatMap(s=>s.content||[]).filter(p=>p.type==='audio');
            const part=stepParts.at(-1)||parts.at(-1)||result.output_audio;
            if(!part||typeof part.data!=='string'||part.data.length>MAX_RESPONSE||!/^[A-Za-z0-9+/]+={0,2}$/.test(part.data))return {ok:false,error:'output'};
            diagnostic.stage='speech_wav';const audio=Buffer.from(part.data,'base64');if(!validWav(audio))return {ok:false,error:'output'};
            if(controller.signal.aborted||closed)return {ok:false,error:'cancelled'};
            if(file)writeSample(file,audio);else replyCache={id:cacheId,audio};
            diagnostic.stage='complete';return {ok:true,audio:new Uint8Array(audio)};
        }catch(_){return {ok:false,error:controller.signal.aborted?'cancelled':'failed'};}
        finally{if(controller.signal.aborted)diagnostic.stage=timedOut?'timeout':'cancelled';clearTimeout(timer);if(current===controller)current=null;}
    }
    return {load,save,generate,cancel,dispose(){closed=true;cancel();replyCache=null;designAudio=null;}};
}
module.exports={createVoice,createPreferences,validWav,MAX_AUDIO};
