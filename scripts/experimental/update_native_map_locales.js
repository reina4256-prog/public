'use strict';
const fs=require('node:fs'),path=require('node:path');
const rows=[
 ['実際のマップを見ながら話します。場所を確かめるときだけ、そのチップを丸で示します。','Talk while looking at the actual map. A chip is circled only when checking which place you mean.','一边看实际地图一边交谈。只有确认所指地点时，才会圈出对应地图块。','Разговор о настоящей карте. Клетка обводится только при уточнении места.','Conversen mirando el mapa real. Solo se rodea una pieza al confirmar a qué lugar te refieres.','Conversem olhando o mapa real. Uma peça só é circulada ao confirmar a qual lugar você se refere.','Sprecht über die tatsächliche Karte. Ein Kartenteil wird nur beim Nachfragen zum gemeinten Ort eingekreist.'],
 ['過去の試作の記録','Earlier prototype records','早期试作记录','Записи прежнего прототипа','Registros del prototipo anterior','Registros do protótipo anterior','Aufzeichnungen des früheren Prototyps'],
 ['現在地・画面内のマップチップの種類と位置・確認中の対象・状態・直近の観察を、上限を決めてGoogleへ送ります。旧版とは別保存で、追加クレジットは使いません。','Location, visible map chip types and positions, the place being checked, status and recent observations are sent to Google within fixed limits. Separate saves; no extra credits.','当前位置、画面内地图块的类型与位置、确认中的对象、状态及近期观察会在规定限额内发送给Google。与旧版分开保存，不使用额外额度。','Местоположение, типы и позиции видимых элементов карты, уточняемый объект, состояние и недавние наблюдения передаются Google в заданных пределах. Отдельные сохранения, без дополнительных кредитов.','Se envían a Google la ubicación, tipos y posiciones de las piezas visibles, el objeto que se confirma, el estado y observaciones recientes, con límites fijos. Guardado separado; sin créditos extra.','Local, tipos e posições das peças visíveis, objeto em confirmação, estado e observações recentes são enviados ao Google com limites fixos. Salvamento separado; sem créditos extras.','Ort, Typ und Position sichtbarer Kartenteile, das nachgefragte Objekt, Zustand und jüngste Beobachtungen werden begrenzt an Google gesendet. Getrennter Spielstand; keine zusätzlichen Credits.']
];
for(const [index,locale]of ['ja','en','zh-CN','ru','es-ES','pt-BR','de'].entries()){
 const file=path.resolve(__dirname,'../../locales',locale+'.json'),catalog=JSON.parse(fs.readFileSync(file,'utf8'));
 for(const row of rows)catalog[row[0]]=row[index];
 fs.writeFileSync(file,JSON.stringify(catalog,null,2)+'\n','utf8');
}
