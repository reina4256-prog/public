'use strict';
const fs=require('node:fs'),path=require('node:path');
const rows=[
    ['冒険家を探しています。','Looking for the adventurer.','正在寻找冒险家。','Ищем путешественника.','Buscando al aventurero.','Procurando o aventureiro.','Auf der Suche nach dem Abenteurer.'],
    ['冒険家に会えました。','We met the adventurer.','遇到了冒险家。','Мы встретили путешественника.','Encontramos al aventurero.','Encontramos o aventureiro.','Wir haben den Abenteurer getroffen.'],
    ['今回見て回れた範囲では、冒険家に会えませんでした。','We did not meet the adventurer in the area explored this time.','这次走访的范围内没有遇到冒险家。','В обследованных на этот раз местах путешественник не встретился.','No encontramos al aventurero en la zona recorrida esta vez.','Não encontramos o aventureiro na área explorada desta vez.','In dem diesmal erkundeten Gebiet haben wir den Abenteurer nicht getroffen.'],
    ['冒険家を探すのを中断しました。','The search for the adventurer was stopped.','已中断寻找冒险家。','Поиск путешественника остановлен.','Se detuvo la búsqueda del aventurero.','A busca pelo aventureiro foi interrompida.','Die Suche nach dem Abenteurer wurde unterbrochen.']
];
for(const [i,locale] of ['ja','en','zh-CN','ru','es-ES','pt-BR','de'].entries()){
    const file=path.resolve(__dirname,'../../locales',locale+'.json'),catalog=JSON.parse(fs.readFileSync(file,'utf8'));
    for(const row of rows)catalog[row[0]]=row[i];fs.writeFileSync(file,JSON.stringify(catalog,null,2)+'\n','utf8');
}
