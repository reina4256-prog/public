'use strict';
const fs=require('node:fs'),path=require('node:path');
const rows=[
['日時と季節','Date, time and seasons','日期、时间与季节','Дата, время и сезоны','Fecha, hora y estaciones','Data, hora e estações','Datum, Uhrzeit und Jahreszeiten'],
['時刻の基準','Time zone','时区','Часовой пояс','Zona horaria','Fuso horário','Zeitzone'],
['端末のタイムゾーン','Device time zone','设备时区','Часовой пояс устройства','Zona horaria del dispositivo','Fuso horário do dispositivo','Zeitzone des Geräts'],
['季節の基準','Season setting','季节设置','Настройка сезонов','Configuración de estaciones','Configuração das estações','Jahreszeiteneinstellung'],
['言語に合わせる','Follow language','跟随语言','По языку','Según el idioma','Conforme o idioma','An Sprache anpassen'],
['北半球','Northern hemisphere','北半球','Северное полушарие','Hemisferio norte','Hemisfério norte','Nordhalbkugel'],
['南半球','Southern hemisphere','南半球','Южное полушарие','Hemisferio sur','Hemisfério sul','Südhalbkugel'],
['日時は選んだ地域に、季節は選んだ半球に合わせます。','Date and time follow your chosen region; seasons follow your chosen hemisphere.','日期和时间采用所选地区，季节采用所选半球。','Дата и время соответствуют выбранному региону, сезоны — выбранному полушарию.','La fecha y la hora siguen la región elegida; las estaciones, el hemisferio elegido.','A data e a hora seguem a região escolhida; as estações, o hemisfério escolhido.','Datum und Uhrzeit richten sich nach der gewählten Region, Jahreszeiten nach der gewählten Halbkugel.'],
['日時と季節の設定を保存しました。','Date, time and season settings saved.','日期、时间和季节设置已保存。','Настройки даты, времени и сезонов сохранены.','Configuración de fecha, hora y estaciones guardada.','Configurações de data, hora e estações salvas.','Einstellungen für Datum, Uhrzeit und Jahreszeiten gespeichert.'],
['設定を保存できませんでした。','Could not save settings.','无法保存设置。','Не удалось сохранить настройки.','No se pudo guardar la configuración.','Não foi possível salvar as configurações.','Einstellungen konnten nicht gespeichert werden.']
];
for(const [i,locale]of ['ja','en','zh-CN','ru','es-ES','pt-BR','de'].entries()){
    const file=path.resolve(__dirname,'../../locales',locale+'.json'),catalog=JSON.parse(fs.readFileSync(file,'utf8'));
    for(const row of rows)catalog[row[0]]=row[i];fs.writeFileSync(file,JSON.stringify(catalog,null,2)+'\n','utf8');
}
