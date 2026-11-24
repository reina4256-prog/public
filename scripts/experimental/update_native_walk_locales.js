'use strict';
const fs=require('node:fs'),path=require('node:path');
const rows=[
['歩いて{{0}}のそばに着いた。','I walked to a spot near {{0}}.','我走到了{{0}}旁边。','Я дошёл до места рядом с {{0}}.','Caminé hasta un lugar junto a {{0}}.','Caminhei até um lugar perto de {{0}}.','Ich bin zu einer Stelle bei {{0}} gegangen.'],
['到着','Arrival','到达','Прибытие','Llegada','Chegada','Ankunft'],
['会話をふりかえる','Look back at the conversation','回顾对话','Вспомнить разговор','Repasar la conversación','Rever a conversa','Gespräch nachlesen'],
['冒険家と出会った。','I met the adventurer.','我遇到了冒险家。','Я встретил путешественницу.','Conocí a la aventurera.','Encontrei a aventureira.','Ich habe die Abenteurerin getroffen.'],
['こんにちは。','Hello.','你好。','Здравствуйте.','Hola.','Olá.','Hallo.'],
['スキップ','Skip','跳过','Пропустить','Omitir','Pular','Überspringen']
];
for(const [i,locale]of ['ja','en','zh-CN','ru','es-ES','pt-BR','de'].entries()){
    const file=path.resolve(__dirname,'../../locales',locale+'.json'),catalog=JSON.parse(fs.readFileSync(file,'utf8'));
    for(const row of rows)if(!Object.hasOwn(catalog,row[0]))catalog[row[0]]=row[i];
    fs.writeFileSync(file,JSON.stringify(catalog,null,2)+'\n','utf8');
}
