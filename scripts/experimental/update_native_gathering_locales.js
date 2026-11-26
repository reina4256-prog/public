'use strict';
const fs=require('node:fs'),path=require('node:path');
const rows=[
['花','Flower','花','Цветок','Flor','Flor','Blume'],
['空の水筒','Empty canteen','空水壶','Пустая фляга','Cantimplora vacía','Cantil vazio','Leere Feldflasche'],
['水の入った水筒','Water-filled canteen','装满水的水壶','Фляга с водой','Cantimplora con agua','Cantil com água','Mit Wasser gefüllte Feldflasche']
];
for(const [i,locale]of ['ja','en','zh-CN','ru','es-ES','pt-BR','de'].entries()){
    const file=path.resolve(__dirname,'../../locales',locale+'.json'),catalog=JSON.parse(fs.readFileSync(file,'utf8'));
    for(const row of rows)catalog[row[0]]=row[i];
    fs.writeFileSync(file,JSON.stringify(catalog,null,2)+'\n','utf8');
}
