'use strict';
const fs=require('node:fs'),path=require('node:path');
const rows=[
['みんなとの仲','Relationships','人物关系','Отношения','Relaciones','Relacionamentos','Beziehungen'],
['まだ知り合いはいません。','You have not met anyone yet.','还没有认识的人。','Пока нет знакомых.','Todavía no conoces a nadie.','Você ainda não conhece ninguém.','Du hast noch niemanden kennengelernt.'],
['親しさ：{{0}} / 5','Closeness: {{0}} / 5','亲近程度：{{0}} / 5','Близость: {{0}} / 5','Cercanía: {{0}} / 5','Proximidade: {{0}} / 5','Nähe: {{0}} / 5'],
['まだ距離がある','Still distant','还有些疏远','Пока держится на расстоянии','Aún hay distancia','Ainda há distância','Noch auf Abstand'],
['知り合ったばかり','Recently acquainted','刚刚认识','Недавно познакомились','Recién se conocen','Acabaram de se conhecer','Gerade erst kennengelernt'],
['少し打ち解けている','Beginning to feel at ease','开始熟悉了','Понемногу сближаетесь','Empiezan a tener confianza','Começando a se aproximar','Langsam vertrauter'],
['親しくなってきた','Growing close','渐渐亲近了','Становитесь ближе','Cada vez más cercanos','Ficando próximos','Einander nähergekommen'],
['信頼し合っている','Mutual trust','相互信任','Доверяете друг другу','Confían mutuamente','Confiam um no outro','Gegenseitiges Vertrauen'],
['とても大切な仲','A cherished bond','十分珍贵的关系','Очень дорогая связь','Un vínculo muy especial','Um vínculo muito especial','Eine besonders wertvolle Beziehung'],
['前より親しくなりました。','You have grown closer.','关系比以前更亲近了。','Вы стали ближе.','Se han acercado más.','Vocês ficaram mais próximos.','Ihr seid euch nähergekommen.'],
['少し距離ができました。','Some distance has grown between you.','关系有些疏远了。','Между вами появилась дистанция.','Ha surgido algo de distancia.','Surgiu um pouco de distância entre vocês.','Zwischen euch ist etwas Abstand entstanden.']
];
for(const [i,locale]of ['ja','en','zh-CN','ru','es-ES','pt-BR','de'].entries()){
    const file=path.resolve(__dirname,'../../locales',locale+'.json'),catalog=JSON.parse(fs.readFileSync(file,'utf8'));
    for(const row of rows)catalog[row[0]]=row[i];
    fs.writeFileSync(file,JSON.stringify(catalog,null,2)+'\n','utf8');
}
