'use strict';
const fs=require('node:fs'),path=require('node:path'),{createHash}=require('node:crypto');
const rules=require('../../experimental_word_llm_native_voice');
const endpoint='https://generativelanguage.googleapis.com/v1beta/interactions';
const MAX_AUDIO=5760044,MAX_RESPONSE=8*1024*1024;
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
        if(closed||current)return {ok:false,error:'busy'};
        if(!request||typeof request!=='object'||Array.isArray(request))return {ok:false,error:'input'};
        let text,voice,locale,cacheId=null,file=null,creating=false;
        if(request.kind==='design'){
            if(Object.keys(request).sort().join(',')!=='kind,locale,settings,species'||!rules.species.includes(request.species)||!Object.hasOwn(rules.samples,request.locale)||!rules.design.valid(request.settings))return {ok:false,error:'input'};
            const p=load(),d=designs.load();if(!p.ok||!d.ok)return {ok:false,error:'save'};
            const existing=d.entries.find(e=>e.species===request.species&&e.locale===request.locale&&rules.design.prompt(e.settings)===rules.design.prompt(request.settings));
            if(existing){
                if(designAudio?.id===existing.id)return {ok:true,audio:new Uint8Array(designAudio.audio),design:view(existing)};
                return {...await generate({kind:'preview',voice:existing.id,locale:request.locale}),design:view(existing)};
            }
            if(d.entries.length>=200)return {ok:false,error:'limit'};
            creating=true;locale=request.locale;
        }else if(request.kind==='preview'&&Object.keys(request).sort().join(',')==='kind,locale,voice'&&Object.hasOwn(rules.samples,request.locale)){
            locale=request.locale;voice=resolveVoice(request.voice);if(!voice)return {ok:false,error:'input'};
            text=rules.samples[locale];file=cacheFile(voice,locale);const b=readSample(file);if(b)return {ok:true,audio:new Uint8Array(b)};
        }else if(request.kind==='reply'&&Object.keys(request).sort().join(',')==='kind,turnId'){
            const s=session.load(),p=load(),state=s.state,turn=state?.turns.at(-1);
            if(!s.ok||!p.ok)return {ok:false,error:'save'};
            if(!p.value.enabled||!state?.game||turn?.status!=='complete'||turn.id!==request.turnId||!turn.world)return {ok:false,error:'input'};
            const species=state.game.origin.appearance;
            text=turn.result.reply;locale=state.locale;voice=resolveVoice(p.value.voices[species]||rules.defaults[species]);
            cacheId=JSON.stringify([turn.id,text,locale,voice]);if(replyCache?.id===cacheId)return {ok:true,audio:new Uint8Array(replyCache.audio)};
        }else return {ok:false,error:'input'};
        if(!creating&&(typeof text!=='string'||!text.trim()||text.length>1200||!(rules.validVoice(voice)||cloudId(voice))))return {ok:false,error:'input'};
        const secret=key();if(typeof secret!=='string'||!secret.trim()||secret.length>512)return {ok:false,error:'missing'};
        const controller=new AbortController();current=controller;const timer=setTimeout(()=>controller.abort(),timeout);
        try{
            const language={ja:'ja-JP',en:'en-US','zh-CN':'zh-CN',ru:'ru-RU','es-ES':'es-ES','pt-BR':'pt-BR',de:'de-DE'};
            const body=creating?{store:true,voice:{model:rules.model,type:'prompted',display_name:'Companion voice',language_code:language[locale],gender:'neutral',prompted:{input:rules.design.prompt(request.settings)}}}
                :{model:rules.model,input:[{type:'user_input',content:[{type:'text',text}]}],response_format:{type:'audio'},generation_config:{speech_config:[{voice}]},store:false};
            const response=await fetcher(creating?'https://generativelanguage.googleapis.com/v1beta/voices':endpoint,{method:'POST',redirect:'error',signal:controller.signal,headers:{'Content-Type':'application/json','x-goog-api-key':secret},body:JSON.stringify(body)});
            if(!response.ok)return {ok:false,error:[402,403,429].includes(response.status)?'limit':'failed'};
            if(Number(response.headers.get('content-length'))>MAX_RESPONSE)return {ok:false,error:'output'};
            const reader=response.body.getReader(),chunks=[];let size=0;
            try{while(true){const {done,value}=await reader.read();if(done)break;size+=value.length;if(size>MAX_RESPONSE){await reader.cancel();return {ok:false,error:'output'};}chunks.push(Buffer.from(value));}}finally{reader.releaseLock();}
            const result=JSON.parse(Buffer.concat(chunks).toString('utf8'));
            if(creating){
                if(!result||result.type!=='prompted'||!cloudId(result.id))return {ok:false,error:'output'};
                const saved=designs.add({voice:result.id,species:request.species,locale,settings:request.settings});if(!saved.ok)return saved;
                // A request may already have created a remote voice when stopped. Preserve its ID, never apply it automatically.
                if(controller.signal.aborted||closed)return {ok:false,error:'cancelled'};
                const part=result.sample_audio;
                if(!part||part.mime_type!=='audio/wav'||typeof part.data!=='string'||part.data.length>MAX_RESPONSE||!/^[A-Za-z0-9+/]+={0,2}$/.test(part.data))return {ok:false,error:'output',design:view(saved.entry)};
                const audio=Buffer.from(part.data,'base64');if(!validWav(audio))return {ok:false,error:'output',design:view(saved.entry)};
                designAudio={id:saved.entry.id,audio};return {ok:true,audio:new Uint8Array(audio),design:view(saved.entry)};
            }
            const parts=(result.outputs||[]).filter(p=>p.type==='audio');
            // REST interactions return audio blocks in output steps; never accept URLs or text as audio.
            const stepParts=(result.steps||[]).filter(s=>s.type==='model_output').flatMap(s=>s.content||[]).filter(p=>p.type==='audio');
            const part=stepParts.at(-1)||parts.at(-1)||result.output_audio;
            if(!part||typeof part.data!=='string'||part.data.length>MAX_RESPONSE||!/^[A-Za-z0-9+/]+={0,2}$/.test(part.data))return {ok:false,error:'output'};
            const audio=Buffer.from(part.data,'base64');if(!validWav(audio))return {ok:false,error:'output'};
            if(controller.signal.aborted||closed)return {ok:false,error:'cancelled'};
            if(file)writeSample(file,audio);else replyCache={id:cacheId,audio};
            return {ok:true,audio:new Uint8Array(audio)};
        }catch(_){return {ok:false,error:controller.signal.aborted?'cancelled':'failed'};}
        finally{clearTimeout(timer);if(current===controller)current=null;}
    }
    return {load,save,generate,cancel,dispose(){closed=true;cancel();replyCache=null;designAudio=null;}};
}
module.exports={createVoice,createPreferences,validWav,MAX_AUDIO};
