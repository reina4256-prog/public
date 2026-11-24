'use strict';
const fs=require('node:fs'),path=require('node:path'),{randomUUID}=require('node:crypto'),rules=require('../../experimental_word_llm_native_voice');
const cloudId=id=>typeof id==='string'&&/^voice_[A-Za-z0-9_-]{1,160}$/.test(id);
function createDesigns(directory){
    const file=path.join(directory,'native-voice-designs.json');let blocked=false;
    function validEntry(e){return e&&Object.keys(e).sort().join(',')==='cloudId,createdAt,id,locale,settings,species'&&rules.design.validId(e.id)&&cloudId(e.cloudId)&&rules.subjects.includes(e.species)&&Object.hasOwn(rules.samples,e.locale)&&rules.design.valid(e.settings)&&Number.isSafeInteger(e.createdAt)&&e.createdAt>=0;}
    function load(){try{if(!fs.existsSync(file))return {ok:true,entries:[]};if(fs.statSync(file).size>1024*1024)throw Error('size');
        const data=JSON.parse(fs.readFileSync(file,'utf8'));
        if(!data||Object.keys(data).sort().join(',')!=='entries,version'||data.version!==1||!Array.isArray(data.entries)||data.entries.length>200||!data.entries.every(validEntry)||new Set(data.entries.map(e=>e.id)).size!==data.entries.length)throw Error('invalid');
        return {ok:true,entries:data.entries};
    }catch(_){blocked=true;return {ok:false,error:'save'};}}
    function add({voice,species,locale,settings}){
        const prior=load();if(blocked||!prior.ok)return {ok:false,error:'save'};if(prior.entries.length>=200)return {ok:false,error:'limit'};
        const entry={id:'design:'+randomUUID(),cloudId:voice,species,locale,settings,createdAt:Date.now()};
        if(!validEntry(entry))return {ok:false,error:'output'};
        try{fs.mkdirSync(directory,{recursive:true});fs.writeFileSync(file+'.tmp',JSON.stringify({version:1,entries:[...prior.entries,entry]}),{encoding:'utf8',flush:true});fs.renameSync(file+'.tmp',file);return {ok:true,entry};}
        catch(_){return {ok:false,error:'save'};}
    }
    return {load,add};
}
module.exports={createDesigns,cloudId};
