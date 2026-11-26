'use strict';
const fs=require('node:fs'),path=require('node:path');
if(!process.versions.electron){
    const env={...process.env};delete env.ELECTRON_RUN_AS_NODE;
    const child=require('node:child_process').spawn(require('electron'),[__filename],{env,stdio:'inherit',windowsHide:true});
    child.on('exit',code=>process.exitCode=code??1);child.on('error',error=>{console.error(error.message);process.exitCode=1;});
}else{
    const assert=require('node:assert/strict'),{app}=require('electron'),core=require('../../experimental_word_llm_native_runtime'),practice=core.game.practice;
    const directory=fs.mkdtempSync(path.resolve(__dirname,'../../docs/.local-history/verification-runs/native-gathering-'));
    app.disableHardwareAcceleration();app.setPath('userData',path.join(directory,'profile'));
    const checks=[],errors=[],requests=[],voices=[],sleep=ms=>new Promise(r=>setTimeout(r,ms));let window,session,held,release;
    const sourceHashes=Object.fromEntries(['experimental_word_llm_native_practice.js','experimental_word_llm_native_runtime.js','experimental_word_llm_native_island_ui.js','experimental_word_llm_native_mentor_ui.js','scripts/experimental/native_practice.js','scripts/experimental/native_store.js','scripts/experimental/smoke_native_gathering.js'].map(file=>[file,require('node:crypto').createHash('sha256').update(fs.readFileSync(path.resolve(__dirname,'../..',file))).digest('hex')]));
    const timer=setTimeout(()=>{fs.writeFileSync(path.join(directory,'timeout.json'),JSON.stringify({checks,errors}));app.exit(1);},360000);
    const evaluate=code=>window.webContents.executeJavaScript(code),until=async code=>{for(let i=0;i<1800;i++){if(await evaluate(code))return;await sleep(30);}throw Error('Timed out '+code);};
    const capture=async name=>{await sleep(180);fs.writeFileSync(path.join(directory,name),(await window.webContents.capturePage()).toPNG());};
    function line(s,slot,extra={}){const p=practice.current(s.game);p.attempts[slot]='pending';practice.finish(s.game,slot,{text:'Actual '+slot,choice:slot==='decision'?'accept':null,...extra});}
    function initial(){let s=core.create({name:'Beat',self:'I',player:'you'},'en',[0,0,0,0,0,0,0],require('./native_island').createIsland());
        const target=practice.targets(s.game).find(t=>t.reachable&&t.types.includes('wood'))?.id||practice.targets(s.game).find(t=>t.reachable).id;
        for(const [input,fields]of [['Which?',{focus:{targetId:target,quote:'Which?'}}],['Yes',{confirmation:{targetId:target,quote:'Yes'}}],['walk there',{action:{kind:'walk',targetId:target,quote:'walk there'}}]]){
            const b=core.begin(s,input,'en');s=core.finish(b.state,b.packet.id,b.state.revision,{reply:'Ready.',interpretation:{kind:'request',summary:'Received.'},memories:[],references:[],terms:[],action:null,focus:null,confirmation:null,...fields});}
        for(let i=0;i<2000&&s.game.mode==='move';i++)core.game.tick(s.game,.1);const p=practice.create(s.game,s.game.walk.encounter);delete p.exchange;
        for(let i=0;i<2200&&p.phase!=='done';i++){const slot=practice.due(p);if(slot)line(s,slot);core.game.tick(s.game,.1);}
        assert.equal(p.phase,'done');s.game.walk.met=true;s.game.walk.encounter.phase='done';assert.equal(practice.bottle(s.game),'none');assert.ok(core.validState(s));return s;}
    function wav(){const b=Buffer.alloc(4844);b.write('RIFF');b.writeUInt32LE(b.length-8,4);b.write('WAVEfmt ',8);b.writeUInt32LE(16,16);b.writeUInt16LE(1,20);b.writeUInt16LE(1,22);b.writeUInt32LE(24000,24);b.writeUInt32LE(48000,28);b.writeUInt16LE(2,32);b.writeUInt16LE(16,34);b.write('data',36);b.writeUInt32LE(4800,40);return b;}
    const send=async text=>{await evaluate('document.getElementById("input").value='+JSON.stringify(text)+';document.getElementById("compose").requestSubmit()');await until('!document.getElementById("send").disabled');};
    async function settled(previous=null){for(let i=0;i<2200;i++){const p=practice.current(session.load().state?.game);if(p&&p.id!==previous&&['done','declined'].includes(p.phase)&&await evaluate('!NativePracticeUI.pending')){
            if(await evaluate('document.getElementById("word-master-dialog").open')){await evaluate('document.getElementById("mentor-close").click()');await until('!document.getElementById("word-master-dialog").open');}return p;}await sleep(30);}throw Error('Outing did not finish');}
    app.whenReady().then(async()=>{
        const {createProfiles,createSession}=require('./native_store'),store=createProfiles(path.join(directory,'save'));assert.ok(store.save(initial()).ok);
        // Accelerate only the fixture world clock; utterance/audio waits stay real.
        session=createSession({store,clock:()=>performance.now()*4,responder:{cancel(){},dispose(){},async reply(p){requests.push(p);const type=p.input==='Collect flowers'?'flower':p.input==='Fetch water'?'water':null;
            const target=type&&p.inventory.targets.find(t=>t.types.includes(type)&&t.reachable);return {ok:true,proposal:{reply:type?'I will go and look.':'Here are my belongings.',interpretation:{kind:'request',summary:'Received.'},memories:[],references:[],terms:[],focus:null,confirmation:null,
                action:p.input==='walk there'?{kind:'walk',targetId:p.world.confirmed,quote:p.input}:null,
                gather:target?{targetId:target.id,type,quote:p.input}:null,inventoryView:p.input==='Show inventory'?{kind:'open',quote:p.input}:null}};}},
            practiceResponder:{cancel(){},dispose(){},async reply(p){requests.push(p);const r={text:'I am here.',choice:null};
                if(p.stage==='offer')r.text=p.context.exchange?.award?'Good to see you. Here is your empty canteen.':'Good to see you. Would you help me?';
                if(p.stage==='offer'&&p.context.introduce){r.text='The builder surveys trees in the other forest and moves between forests.';r.introduction={quote:r.text};}
                if(p.stage==='decision'){r.choice='decline';r.text='I will not explore this time.';const available=p.context.exchange.available,memory=p.context.exchange.memory;
                    const type=available.flower?'flower':available.water?'water':null;
                    if(type){r.text='I would like to give you this '+type+'.';r.gift={type,quote:r.text};}
                    if(memory.length)r.reception={source:memory[0].id,quote:memory[0].text,text:'I think that gift was welcome; I will keep watching their reactions.'};}
                if(p.stage.startsWith('observe')){const found=p.context.collection.found.at(-1);r.text='I found '+found.count+' '+p.context.collection.type+' here.';
                    if(p.context.collection.type==='flower'&&p.stage==='observe1'&&!held){held=p;await new Promise(resolve=>release=resolve);}}
                if(p.stage==='feedback'){r.text='Thank you, I am glad you thought of me.';r.giftResponse={accepted:true,quote:r.text};
                    if(p.context.exchange.offered==='flower')r.affinity={delta:1,kind:'gift',quote:p.recent.find(l=>l.slot==='decision').text,reason:'A thoughtful gift.'};}
                assert.ok(require('./native_practice').validResult(r,p.stage,p.context));return {ok:true,proposal:r};}}});
        const voice=require('./native_voice').createVoice({directory:path.join(directory,'save'),session,key:()=> 'fixture',fetcher:async(_url,options)=>{voices.push(JSON.parse(options.body));return new Response(JSON.stringify({steps:[{type:'model_output',content:[{type:'audio',data:wav().toString('base64')}]}]}));}});
        window=require('./native_window').openWindow(session,{show:true,voice});window.webContents.setBackgroundThrottling(false);
        window.webContents.on('console-message',(_event,level,message)=>{if(level===3)errors.push(message);});
        await until('!document.getElementById("entry").hidden');await evaluate('document.getElementById("logo").click()');await until('!document.getElementById("title-menu").hidden');
        await evaluate('document.getElementById("continue-game").click()');await until('!document.getElementById("play").hidden');
        const old=practice.current(session.load().state.game).id;await send('walk there');await settled(old);
        assert.equal(practice.bottle(session.load().state.game),'empty');checks.push('existing achieved save receives one empty canteen in a new voiced encounter, not on load');
        const start=requests.length;await send('Collect flowers');for(let i=0;i<1600&&!held;i++)await sleep(20);assert.ok(held);assert.equal(await evaluate('document.getElementById("word-master-dialog").open'),false);
        const during=session.load().state.game;await sleep(150);assert.equal(session.load().state.game.x,during.x);assert.equal(practice.current(during).phase,'survey');await capture('free-search.png');release();
        const flowers=await settled();assert.equal(flowers.free,true);assert.equal(flowers.lines.length,2);assert.equal(requests.slice(start).filter(p=>p.stage).length,2);assert.equal(requests.slice(start).filter(p=>p.input).length,1);
        assert.ok(flowers.lines.every(l=>voices.some(v=>v.input[0].content[0].text===l.text)));checks.push('one normal decision plus two voiced discoveries, no NPC window, real search waits for its line and returns');
        await send('Show inventory');await until('!document.getElementById("inventory").hidden');
        for(const locale of core.locales)for(const width of [1160,420]){window.setSize(width,850);await evaluate('GameI18n.setLanguage('+JSON.stringify(locale)+');document.getElementById("locale").value='+JSON.stringify(locale)+';document.getElementById("locale").dispatchEvent(new Event("change"))');
            const catalog=JSON.parse(fs.readFileSync(path.resolve(__dirname,'../../locales',locale+'.json'),'utf8')),text=await evaluate('document.getElementById("inventory-items").textContent');
            assert.ok(text.includes(catalog['花']+' × 2'));assert.ok(text.includes(catalog['空の水筒']+' × 1'));
            assert.equal(await evaluate('document.querySelectorAll("#inventory button,#inventory a,#inventory input").length'),0);
            assert.ok(await evaluate('(()=>{const a=document.getElementById("inventory").getBoundingClientRect(),b=document.getElementById("gameCanvas").getBoundingClientRect();return a.left>=b.left&&a.right<=b.right&&a.top>=b.top&&a.bottom<=b.bottom})()'));
            if(locale==='ja')await capture('inventory-flowers-'+width+'.png');}
        checks.push('flower and empty canteen icons/localized counts stay inside the island in seven locales and two widths, with no direct controls');
        window.setSize(1160,850);await evaluate('GameI18n.setLanguage("en");document.getElementById("locale").value="en";document.getElementById("locale").dispatchEvent(new Event("change"))');
        await send('Fetch water');const water=await settled();assert.equal(water.free,true);assert.equal(practice.possessions(session.load().state.game).water,1);assert.equal(practice.bottle(session.load().state.game),'full');
        await capture('inventory-water-1160.png');assert.equal(water.lines.length,2);checks.push('real water collection fills the awarded canteen once and the second stop cannot overfill it');
        await send('walk there');const gift=await settled(water.id);assert.equal(gift.gift.type,'flower');assert.equal(gift.gift.response.accepted,true);assert.equal(practice.possessions(session.load().state.game).flower,1);assert.equal(practice.relationship(session.load().state.game).hearts,2);
        const own=requests.find(p=>p.id==='practice-'+gift.id+'-decision'),npc=requests.find(p=>p.id==='practice-'+gift.id+'-feedback');
        assert.equal(own.context.exchange.taste,undefined);assert.equal(npc.context.exchange.available,undefined);assert.equal(npc.context.exchange.memory,undefined);assert.equal(npc.context.exchange.offered,'flower');
        assert.ok(requests.filter(p=>p.context?.id===gift.id).length<=6);checks.push('companion chooses a surplus flower, adventurer actually receives it, inventory loses one and affinity uses the real reaction');
        await send('walk there');const waterGift=await settled(gift.id);assert.equal(waterGift.gift.type,'flower','second flower remains available and may be offered');
        assert.ok(waterGift.reception);assert.ok(practice.giftMemory(session.load().state.game).some(m=>m.thought));
        await send('walk there');const drinkGift=await settled(waterGift.id);assert.equal(drinkGift.gift.type,'water');assert.equal(practice.bottle(session.load().state.game),'empty');
        assert.ok(core.validState(session.load().state));checks.push('later personal choices use a quoted tentative interpretation of actual earlier reactions; giving water retains an empty canteen');
        for(const p of requests.filter(p=>p.stage)){assert.ok(JSON.stringify(p.context).length<=1200);assert.ok(JSON.stringify({context:p.context,recent:p.recent,previous:p.previous}).length<=4000);}
        assert.deepEqual(errors,[]);await new Promise(resolve=>{window.once('closed',resolve);window.close();});
        const saved=store.load();assert.ok(saved.ok);assert.ok(core.validState(saved.value));assert.equal(practice.bottle(saved.value.game),'empty');assert.equal(practice.giftMemory(saved.value.game).length,3);
        const requestCount=requests.length,reopened=require('./native_store').createSession({store,responder:{cancel(){},dispose(){},async reply(){throw Error('unexpected call');}},practiceResponder:{cancel(){},dispose(){},async reply(){throw Error('unexpected call');}}});
        assert.ok(reopened.load().ok);reopened.pulse(false);assert.equal(requests.length,requestCount);reopened.dispose();checks.push('saved water/gift/experience state reloads without granting or generating again');
        fs.writeFileSync(path.join(directory,'summary.json'),JSON.stringify({ok:true,directory,sourceHashes,checks,errors,requests,voices},null,2));console.log(JSON.stringify({ok:true,directory,checks,errors}));clearTimeout(timer);app.quit();
    }).catch(error=>{errors.push(error.stack||String(error));fs.writeFileSync(path.join(directory,'summary.json'),JSON.stringify({ok:false,directory,checks,errors,requests,state:session?.load()},null,2));console.error(error.stack);clearTimeout(timer);app.exit(1);});
}
