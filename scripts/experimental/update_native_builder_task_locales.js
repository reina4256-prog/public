'use strict';
const fs=require('node:fs'),path=require('node:path');
const rows=[
['小屋の柱用の木材2個','Two wood for shed posts','用于小屋立柱的2份木材','2 единицы древесины для столбов хижины','2 unidades de madera para los postes de la cabaña','2 unidades de madeira para os pilares da cabana','2 Holz für die Hüttenpfosten'],
['基礎用の石2個','Two stone for the foundation','用于地基的2份石料','2 камня для фундамента','2 piedras para los cimientos','2 pedras para a fundação','2 Steine für das Fundament'],
['未開始','Not started','未开始','Не начато','Sin empezar','Não iniciada','Noch nicht begonnen'],
['引受済み','Accepted','已接受','Принято','Aceptada','Aceita','Angenommen'],
['納入途中','Partly delivered','部分已交付','Доставлено частично','Entrega parcial','Entrega parcial','Teilweise abgegeben'],
['建築預かり材：木材 {{0}} / 石 {{1}}','Construction materials held: wood {{0}} / stone {{1}}','建筑代存材料：木材 {{0}} / 石料 {{1}}','Материалы на хранении: древесина {{0}} / камень {{1}}','Materiales en depósito: madera {{0}} / piedra {{1}}','Materiais guardados: madeira {{0}} / pedra {{1}}','Verwahrtes Baumaterial: Holz {{0}} / Stein {{1}}'],
['預かり材は将来の家の材料に全数使います。','All held materials will count toward a future home.','代存材料将全部用于未来的房屋。','Все сохранённые материалы пойдут на будущий дом.','Todos los materiales guardados se usarán para la futura casa.','Todos os materiais guardados serão usados na futura casa.','Alle verwahrten Materialien werden für das künftige Haus angerechnet.']
];
for(const [i,locale]of ['ja','en','zh-CN','ru','es-ES','pt-BR','de'].entries()){
    const file=path.resolve(__dirname,'../../locales',locale+'.json'),catalog=JSON.parse(fs.readFileSync(file,'utf8'));
    for(const row of rows)catalog[row[0]]=row[i];
    fs.writeFileSync(file,JSON.stringify(catalog,null,2)+'\n','utf8');
}
