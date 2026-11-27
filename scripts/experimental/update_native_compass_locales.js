'use strict';
const fs=require('node:fs'),path=require('node:path');
const values=['旅人の通信コンパス','Traveler’s communication compass','旅人通信指南针','Компас связи путешественника','Brújula de comunicación del viajero','Bússola de comunicação do viajante','Reisekompass zur Verständigung'];
const rows=[values,
    ['コンパス通信：{{0}}','Compass call: {{0}}','指南针通信：{{0}}','Связь по компасу: {{0}}','Llamada por brújula: {{0}}','Chamada pela bússola: {{0}}','Kompassanruf: {{0}}'],
    ['受信した場所：{{0}}','Received location: {{0}}','收到的地点：{{0}}','Полученное место: {{0}}','Ubicación recibida: {{0}}','Local recebido: {{0}}','Empfangener Ort: {{0}}'],
    ['受信：{{0}}','Received: {{0}}','接收时间：{{0}}','Получено: {{0}}','Recibido: {{0}}','Recebido: {{0}}','Empfangen: {{0}}'],
    ['待ち合わせ期限：{{0}}','Meeting deadline: {{0}}','会面截止时间：{{0}}','Срок ожидания встречи: {{0}}','Límite de la cita: {{0}}','Prazo do encontro: {{0}}','Treffpunktfrist: {{0}}']];
for(const [i,locale] of ['ja','en','zh-CN','ru','es-ES','pt-BR','de'].entries()){
    const file=path.resolve(__dirname,'../../locales',locale+'.json'),catalog=JSON.parse(fs.readFileSync(file,'utf8'));
    for(const row of rows)catalog[row[0]]=row[i];fs.writeFileSync(file,JSON.stringify(catalog,null,2)+'\n','utf8');
}
