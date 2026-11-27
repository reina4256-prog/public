'use strict';
const fs=require('node:fs'),path=require('node:path');
const rows=[
['未清算の期間（UTC）：{{0}} ～ {{1}}','Unsettled period (UTC): {{0}} to {{1}}','未结算时段（UTC）：{{0}} 至 {{1}}','Необработанный период (UTC): {{0}} — {{1}}','Periodo sin liquidar (UTC): {{0}} a {{1}}','Período não calculado (UTC): {{0}} a {{1}}','Noch nicht abgerechneter Zeitraum (UTC): {{0}} bis {{1}}'],
['留守番採集','Away gathering','离线采集','Сбор в отсутствие игрока','Recolección en tu ausencia','Coleta na sua ausência','Sammeln während deiner Abwesenheit'],
['集めた数：{{0}} {{1}}','Collected: {{0}} {{1}}','已采集：{{0}} {{1}}','Собрано: {{0}} {{1}}','Recolectado: {{0}} {{1}}','Coletado: {{0}} {{1}}','Gesammelt: {{0}} {{1}}'],
['予約中（本編を離れてから開始）','Reserved (starts after leaving play)','已预约（离开游戏主界面后开始）','Запланировано (начнётся после выхода из игры)','En reserva (empieza al salir de la partida)','Reservada (começa ao sair da partida)','Vorgemerkt (beginnt nach Verlassen des Spiels)'],
['再開のため停止中','Stopped on resuming play','已因恢复游戏而停止','Остановлено при возвращении в игру','Detenida al reanudar la partida','Interrompida ao retomar a partida','Bei der Rückkehr ins Spiel angehalten'],
['資源の回復を待っています。','Waiting for resources to recover.','正在等待资源恢复。','Ожидание восстановления ресурсов.','Esperando a que se recuperen los recursos.','Esperando os recursos se recuperarem.','Wartet auf die Erholung der Ressourcen.'],
['記録できる量に達したため、途中で止めています。','Stopped partway because the record is at capacity.','记录容量已满，工作已中途停止。','Работа остановлена: достигнут предел объёма записи.','Se detuvo a mitad del trabajo porque el registro está lleno.','Parou durante o trabalho porque o registro atingiu a capacidade.','Unterwegs angehalten, weil der Datensatz seine Kapazität erreicht hat.'],
['採集途中：{{0}} / 600 秒','Gathering progress: {{0}} / 600 seconds','采集中：{{0}} / 600 秒','Сбор: {{0}} / 600 секунд','Progreso de recolección: {{0}} / 600 segundos','Progresso da coleta: {{0}} / 600 segundos','Sammelfortschritt: {{0}} / 600 Sekunden']
];
for(const [i,locale]of ['ja','en','zh-CN','ru','es-ES','pt-BR','de'].entries()){
    const file=path.resolve(__dirname,'../../locales',locale+'.json'),catalog=JSON.parse(fs.readFileSync(file,'utf8'));for(const row of rows)catalog[row[0]]=row[i];fs.writeFileSync(file,JSON.stringify(catalog,null,2)+'\n','utf8');
}
