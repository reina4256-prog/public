'use strict';
// Run only checked-in map definitions; never evaluate player input or load a save here.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
function createIsland(){
    const context=vm.createContext({window:{WordIslandMode:true},console,setTimeout:()=>0});
    for(const name of ['data.js','island_shared.js'])vm.runInContext(fs.readFileSync(path.resolve(__dirname,'../..',name),'utf8'),context,{filename:name,timeout:10000});
    const assets=JSON.parse(vm.runInContext('var catalog=defaultCatalog; JSON.stringify(generateNatureMap())',context,{timeout:10000}));
    return require('../../experimental_word_island_navigation').create(assets);
}
module.exports={createIsland};
