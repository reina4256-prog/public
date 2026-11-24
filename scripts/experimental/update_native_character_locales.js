'use strict';
const fs=require('node:fs'),path=require('node:path');
const rows=[
['タイトルにもどる','Return to title','返回标题画面','На титульный экран','Volver al título','Voltar ao título','Zurück zum Titel'],
['だれと過ごす？','Who will you spend time with?','想和谁一起度过时光？','С кем проведём время?','¿Con quién pasarás el rato?','Com quem você vai passar um tempo?','Mit wem möchtest du Zeit verbringen?']
];
for(const [i,locale]of ['ja','en','zh-CN','ru','es-ES','pt-BR','de'].entries()){
    const file=path.resolve(__dirname,'../../locales',locale+'.json'),catalog=JSON.parse(fs.readFileSync(file,'utf8'));
    for(const row of rows)if(!Object.hasOwn(catalog,row[0]))catalog[row[0]]=row[i];
    fs.writeFileSync(file,JSON.stringify(catalog,null,2)+'\n','utf8');
}
