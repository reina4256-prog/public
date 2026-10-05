'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const storage = require('./storage');
module.exports = async ({ js, window, url, paintClock, sleep, read, load }) => {
    const clickButton = async (selector = '#word-master-close', touch = false) => {
        const at = await js(`(() => { const b=document.querySelector(${JSON.stringify(selector)}); b.scrollIntoView({block:'nearest'});
            const r=b.getBoundingClientRect(), x=r.left+r.width/2, y=r.top+r.height/2;
            return {x,y,hit:document.elementFromPoint(x,y)?.id, disabled:b.disabled}; })()`);
        assert.equal(at.hit, selector.slice(1), 'button receives real pointer hit'); assert.equal(at.disabled,false);
        window.webContents.debugger.attach('1.3');
        if (touch) {
            await window.webContents.debugger.sendCommand('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:at.x,y:at.y}]});
            await window.webContents.debugger.sendCommand('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
        } else for (const type of ['mousePressed','mouseReleased']) await window.webContents.debugger.sendCommand('Input.dispatchMouseEvent', {type,x:at.x,y:at.y,button:'left',clickCount:1});
        window.webContents.debugger.detach();
    };
    for (let i = 0; i < 100; i++) {
        if (await js('!!document.querySelector("#word-new-game:not(:disabled)")')) break;
        await sleep(100);
    }
    await js('window.smokeBeginSession()');
    const base = structuredClone(read());
    assert.ok(base.world.island);
    // All fixture writes stay inside smoke_island's disposable profile.
    // Place the actor one arrival away; the production tick owns the encounter.
    let savedMeeting;
    const resumeOnly = process.argv.includes('--resume-only');
    const visualOnly = process.argv.includes('--visual-only');
    for (const locale of visualOnly ? ['ja'] : resumeOnly ? ['de'] : ['ja','en','zh-CN','ru','es-ES','pt-BR','de']) {
        for (const id of visualOnly ? ['explore'] : resumeOnly ? ['building'] : ['explore','farming','fishing','cooking','smithing','building']) {
            for (const returning of [false, true]) {
                const fixture = structuredClone(base), w = fixture.world;
                const target = `master:${id}`, place = w.island.places.find(p => p.id === target);
                w.x = place.x; w.y = place.y; w.mode = 'move'; w.destination = target;
                w.attention = null; w.route = [{ x: place.x, y: place.y }]; w.pause = 0;
                w.hunger = .1; w.fatigue = .1;
                w.careers = { version:1, people:{}, current:null };
                if (returning) w.careers.people[id] = { metAt:0, visits:1, observed:0, completed:0, interest:0, learning:false, outcomes:[] };
                assert.ok(storage.valid(fixture), `${locale}/${id} fixture`);
                await window.loadURL('about:blank'); load(fixture);
                await window.loadURL(url); await paintClock();
                if (!returning && locale === 'ja' && id === 'farming') await js(`window.masterFetch = window.fetch;
                    window.fetch = (url,options) => url === 'experimental_word_encounter_videos.json' ? Promise.resolve(new Response('[]')) : window.masterFetch(url,options); void 0`);
                if (!returning && locale === 'ja' && id === 'smithing') await js(`window.masterPlay = HTMLMediaElement.prototype.play;
                    HTMLMediaElement.prototype.play = function() { return this.tagName === 'VIDEO' ? Promise.reject(new Error('Test unavailable decoder')) : window.masterPlay.call(this); }; void 0`);
                await js(`GameI18n.setLanguage(${JSON.stringify(locale)}); window.smokeBeginSession()`);
                for (let i = 0; i < 100; i++) {
                    if (await js('document.querySelector("#word-master-dialog").open')) break;
                    await sleep(50);
                }
                assert.ok(await js('document.querySelector("#word-master-dialog").open'), `${locale}/${id} opens`);
                if (!returning) {
                    for (let i=0;i<100;i++) {
                        if (await js(`document.querySelector('#word-master-dialog').dataset.phase !== 'loading'`)) break;
                        await sleep(50);
                    }
                    const phase = await js(`document.querySelector('#word-master-dialog').dataset.phase`);
                    await js("dispatchEvent(new Event('beforeunload'))");
                    const intro = structuredClone(read().world);
                    await sleep(180); await js("dispatchEvent(new Event('beforeunload'))");
                    assert.deepEqual(read().world, intro, 'introduction freezes life');
                    if (locale === 'ja' && ['farming','smithing'].includes(id)) {
                        assert.equal(phase,'silhouette', 'missing video and rejected play fall back');
                        if (id==='farming') {
                            await window.webContents.capturePage(undefined,{stayHidden:true,stayAwake:true});
                            fs.writeFileSync(path.resolve(__dirname,'../../tests/word-master-silhouette-smoke.png'),(await window.webContents.capturePage()).toPNG());
                        }
                        await clickButton();
                    } else if (phase === 'video') {
                        if (locale==='ja' && id==='explore') {
                            for(let i=0;i<300;i++) {
                                if(await js(`document.querySelector('#word-master-dialog').dataset.phase === 'conversation'`)) break;
                                await sleep(100);
                            }
                        } else await clickButton('#word-master-skip');
                    } else if (phase==='silhouette') await clickButton();
                }
                await sleep(100);
                assert.equal(await js(`document.querySelector('#word-master-dialog').dataset.phase`),'conversation');
                const before = await js(`(() => { dispatchEvent(new Event('beforeunload')); return {
                    focused:document.activeElement.id, paused:document.querySelector('#word-pause').getAttribute('aria-pressed'),
                    text:document.querySelector('#word-master-text').textContent,
                    overflow:document.querySelector('#word-master-dialog').scrollWidth > document.querySelector('#word-master-dialog').clientWidth
                }; })()`);
                const frozen = structuredClone(read());
                savedMeeting = frozen;
                assert.equal(before.focused, 'word-master-close'); assert.equal(before.overflow, false);
                assert.ok(frozen.world.careers.people[id].visits === (returning ? 2 : 1));
                assert.deepEqual(frozen.state.knowledge, fixture.state.knowledge, 'encounter grants no knowledge');
                await sleep(160);
                await js("dispatchEvent(new Event('beforeunload'))");
                assert.deepEqual(read().world, frozen.world, 'all life timers remain frozen');
                assert.deepEqual(read().state, frozen.state, 'no experience or notebook mutation while speaking');
                const frames = new Set();
                for(let i=0;i<8;i++) { frames.add(await js(`document.querySelector('.word-master-left canvas').dataset.frame`)); await sleep(70); }
                assert.ok(frames.size>1,'idle animation continues while life is frozen');
                if (locale !== 'ja') {
                    const source = fs.readFileSync(path.resolve(__dirname, '../../experimental_word_learning_ui.js'), 'utf8')
                        .match(new RegExp(`master_intro_${id}: '([^']+)'`))[1];
                    const translations = JSON.parse(fs.readFileSync(path.resolve(__dirname, `../../locales/${locale}.json`), 'utf8'));
                    assert.equal(before.text, translations[source], `${locale} translated`);
                }
                if (locale === 'ja' && id === 'explore' && !returning) {
                    await window.webContents.capturePage(undefined, { stayHidden:true, stayAwake:true });
                    fs.writeFileSync(path.resolve(__dirname, '../../tests/word-master-smoke.png'), (await window.webContents.capturePage()).toPNG());
                }
                if (locale === 'de' && id === 'building' && returning) {
                    window.setSize(600, 640); await sleep(100);
                    await window.webContents.capturePage(undefined, { stayHidden:true, stayAwake:true });
                    assert.equal(await js("document.querySelector('#word-master-dialog').scrollWidth > document.querySelector('#word-master-dialog').clientWidth"), false);
                    fs.writeFileSync(path.resolve(__dirname, '../../tests/word-master-narrow-smoke.png'), (await window.webContents.capturePage()).toPNG());
                    window.setSize(1280, 800);
                    await window.webContents.capturePage(undefined, { stayHidden:true, stayAwake:true });
                }
                // Native Escape exercises dialog cancel and the same close restoration.
                if (returning) {
                    await window.webContents.debugger.attach('1.3');
                    await window.webContents.debugger.sendCommand('Input.dispatchKeyEvent', {type:'keyDown', key:'Escape', code:'Escape', windowsVirtualKeyCode:27});
                    await window.webContents.debugger.sendCommand('Input.dispatchKeyEvent', {type:'keyUp', key:'Escape', code:'Escape', windowsVirtualKeyCode:27});
                    window.webContents.debugger.detach();
                } else await clickButton('#word-master-close', locale==='ja' && id==='fishing');
                await sleep(100);
                assert.equal(await js("document.querySelector('#word-master-dialog').open"), false);
                for(let i=0;i<40;i++) {
                    await js("dispatchEvent(new Event('beforeunload'))");
                    if(read().world.elapsed > frozen.world.elapsed) break;
                    await sleep(50);
                }
                assert.ok(read().world.elapsed > frozen.world.elapsed, 'running life resumes '+JSON.stringify({locale,id,returning,
                    renderer:await js(`({hidden:document.hidden,paused:document.querySelector('#word-pause').getAttribute('aria-pressed'),input:document.querySelector('.chat-form textarea').value})`)}));
                // Manual pause is independent of the modal hold and remains in effect.
                await js("document.querySelector('#word-pause').click(); dispatchEvent(new Event('beforeunload'))");
                const stopped = structuredClone(read().world);
                await sleep(100); await js("dispatchEvent(new Event('beforeunload'))");
                assert.deepEqual(read().world, stopped);
                // Reopen the existing demonstration from the real work_start path after unpause.
                if (locale === 'ja' && id === 'farming' && !returning) {
                    await js("document.querySelector('#word-pause').click()");
                    for (let i = 0; i < 120; i++) {
                        if (await js("document.querySelector('#word-master-dialog').open")) break;
                        await sleep(100);
                    }
                    assert.ok(await js("document.querySelector('#word-master-dialog').open"), 'demonstration opens');
                    await js("document.querySelector('#word-pause').click(); document.querySelector('#word-master-close').click(); dispatchEvent(new Event('beforeunload'))");
                    const paused = structuredClone(read().world);
                    await sleep(160); await js("dispatchEvent(new Event('beforeunload'))");
                    assert.deepEqual(read().world, paused, 'close does not clear an independent pause');
                }
            }
        }
        console.log(`Master dialog language passed: ${locale}`);
    }
    await window.loadURL('about:blank'); load(savedMeeting);
    await window.loadURL(url); await paintClock();
    for (let i = 0; i < 100; i++) {
        if (await js('!!document.querySelector("#word-continue:not(:disabled)")')) break;
        await sleep(50);
    }
    await js('window.smokeBeginSession()'); await sleep(100);
    await js("dispatchEvent(new Event('beforeunload'))");
    assert.equal(await js("document.querySelector('#word-master-dialog').open"), false, 'continuing does not replay consumed arrival');
    assert.deepEqual(read().state, savedMeeting.state, 'continue preserves notebook and knowledge');
    assert.deepEqual(read().world.island, savedMeeting.world.island, 'continue preserves island');
    assert.ok(read().world.elapsed > savedMeeting.world.elapsed);
    console.log(resumeOnly || visualOnly ? 'Master focused dialog and save/continue rerun passed.' : 'Master dialogs: six places, seven languages, first/repeat arrivals, no knowledge grants, frozen life, close/Escape and pause restoration passed.');
};
