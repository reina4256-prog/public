'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path'),crypto=require('node:crypto');
const {install,verify,release}=require('../scripts/experimental/antigravity_install');
test('CLI setup uses the official pinned artifact and verifies before replacing a local executable',async t=>{
    const directory=fs.mkdtempSync(path.join(os.tmpdir(),'word-agy-install-'));t.after(()=>fs.rmSync(directory,{recursive:true,force:true}));
    const file=path.join(directory,'bin','agy.exe'),bytes=Buffer.from('named harmless installer fixture'),sha512=crypto.createHash('sha512').update(bytes).digest('hex');
    assert.match(release.url,/^https:\/\/storage\.googleapis\.com\/antigravity-public\//);assert.match(release.sha512,/^[0-9a-f]{128}$/);
    let requests=0;const options={file,release:{url:release.url,sha512},platform:'win32',arch:'x64',fetch:async()=>{requests++;return {ok:true,body:[bytes]};}};
    assert.equal(await install(options),file);assert.equal(verify(file,sha512),true);await install(options);assert.equal(requests,1);
    await assert.rejects(install({...options,release:{url:release.url,sha512:'0'.repeat(128)}}),/checksum mismatch/);
    assert.equal(verify(file,sha512),true);assert.deepEqual(fs.readdirSync(path.dirname(file)),['agy.exe']);
    await assert.rejects(install({...options,platform:'linux'}),/Windows x64/);
});
