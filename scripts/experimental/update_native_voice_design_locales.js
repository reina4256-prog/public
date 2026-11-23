'use strict';
const fs=require('node:fs'),path=require('node:path');
const rows=[
['気に入った声をえらんだまま、サインへ進もう。','Keep the voice you like selected, then continue to sign.','选中喜欢的声音后，继续签名吧。','Оставь понравившийся голос выбранным и переходи к подписи.','Deja seleccionada la voz que te gusta y continúa para firmar.','Mantenha a voz que gostou selecionada e continue para assinar.','Lass die gewünschte Stimme ausgewählt und fahre mit der Unterschrift fort.'],
['声をつくる','Create a voice','创造声音','Создать голос','Crear una voz','Criar uma voz','Stimme gestalten'],
['小さく丸い、不思議な生き物の声をもとに、好きな特徴をえらぼう。','Start with a small, round, mysterious creature’s voice and choose the traits you like.','以小巧圆润的神奇生物的声音为基础，选择喜欢的特点。','Выбери черты голоса маленького круглого загадочного существа.','Parte de la voz de una criatura pequeña, redonda y misteriosa y elige sus rasgos.','Comece com a voz de uma criaturinha redonda e misteriosa e escolha suas características.','Beginne mit der Stimme eines kleinen, runden, geheimnisvollen Wesens und wähle passende Eigenschaften.'],
['もっと伝えたいこと（任意・300文字まで）','Anything else? (optional, up to 300 characters)','还想补充什么？（选填，最多300字）','Что ещё добавить? (необязательно, до 300 символов)','Algo más que añadir (opcional, hasta 300 caracteres)','Algo mais a acrescentar (opcional, até 300 caracteres)','Weitere Wünsche (optional, bis zu 300 Zeichen)'],
['例：鈴のような響きを少し加えたい','For example: add a hint of a bell-like ring','例如：想稍微加一点铃铛般的音色','Например: добавить лёгкий колокольный оттенок','Por ejemplo: añadir un ligero timbre de campanilla','Exemplo: acrescentar um leve toque de sininho','Zum Beispiel: einen leichten Glockenklang hinzufügen'],
['空欄でも、えらんだ特徴だけでつくれます。','You can leave this blank and use just the traits you chose.','留空也可以，只用所选特点就能创造声音。','Можно оставить поле пустым и использовать только выбранные черты.','Puedes dejarlo en blanco y usar solo los rasgos elegidos.','Você pode deixar em branco e usar apenas as características escolhidas.','Du kannst das Feld leer lassen und nur die gewählten Eigenschaften verwenden.'],
['声をつくってきく','Create and listen','创造并试听','Создать и послушать','Crear y escuchar','Criar e ouvir','Gestalten und anhören'],
['もとの特徴にもどす','Reset traits','恢复初始特点','Сбросить черты','Restablecer rasgos','Restaurar características','Eigenschaften zurücksetzen'],
['聞いて気に入ったら「この声にする」で決めよう。','If you like it, choose “Use this voice” to keep it.','听后满意的话，选“就用这个声音”来确定吧。','Если голос понравится, выбери «Выбрать этот голос».','Si te gusta, pulsa «Usar esta voz» para elegirla.','Se gostar, selecione “Usar esta voz” para escolher.','Wenn sie dir gefällt, wähle „Diese Stimme verwenden“.'],
['つくった声','Created voice','创造的声音','Созданный голос','Voz creada','Voz criada','Gestaltete Stimme'],
['この子の声をつくっています…','Creating your companion’s voice…','正在创造伙伴的声音…','Создаём голос спутника…','Creando la voz de tu compañero…','Criando a voz do seu companheiro…','Die Stimme deines Gefährten entsteht…'],
['声の高さ','Voice pitch','声音高低','Высота голоса','Altura de la voz','Altura da voz','Stimmhöhe'],
['低め','Slightly low','偏低','Пониже','Algo grave','Um pouco grave','Etwas tiefer'],
['ふつう','Normal','普通','Обычно','Normal','Normal','Normal'],
['やや高め','Slightly high','稍高','Чуть повыше','Algo aguda','Um pouco aguda','Etwas höher'],
['話す速さ','Speaking pace','说话速度','Темп речи','Ritmo al hablar','Ritmo da fala','Sprechtempo'],
['ゆっくり','Slow','缓慢','Медленно','Lento','Devagar','Langsam'],
['軽快','Brisk','轻快','Живо','Ágil','Ágil','Flott'],
['声の質感','Voice texture','音色质感','Тембр голоса','Textura de la voz','Textura da voz','Stimmklang'],
['丸くやわらかい','Round and soft','圆润柔和','Округлый и мягкий','Redonda y suave','Redonda e suave','Rund und weich'],
['透きとおる','Translucent','清透','Прозрачный','Cristalina','Cristalina','Durchscheinend'],
['少し電子的','Slightly electronic','略带电子感','Слегка электронный','Algo electrónica','Um pouco eletrônica','Leicht elektronisch'],
['響きの大きさ','Sense of size','共鸣大小','Объём звучания','Tamaño que evoca','Tamanho que transmite','Wirkung der Größe'],
['小さな生き物','Small creature','小小的生物','Маленькое существо','Criatura pequeña','Criaturinha','Kleines Wesen'],
['ふわっと軽い','Light and airy','轻盈飘逸','Лёгкий и воздушный','Ligera y etérea','Leve e etérea','Leicht und luftig'],
['ゆったり豊か','Full and relaxed','舒展饱满','Насыщенный и спокойный','Amplia y relajada','Cheia e relaxada','Voll und entspannt'],
['息づかい','Breathiness','气息感','Дыхание в голосе','Aire en la voz','Sopros na voz','Atemanteil'],
['ひかえめ','Subtle','克制','Сдержанно','Sutil','Sutil','Zurückhaltend'],
['自然','Natural','自然','Естественно','Natural','Natural','Natürlich'],
['声の抑揚','Intonation','语调起伏','Интонация','Entonación','Entonação','Sprechmelodie'],
['おだやか','Gentle','平和','Мягко','Suave','Suave','Sanft'],
['小さくはずむ','Softly bouncy','轻轻跳跃','Легко подпрыгивает','Ligeramente animada','Levemente saltitante','Sanft hüpfend'],
['一定','Steady','平稳','Ровно','Uniforme','Constante','Gleichmäßig'],
['言葉の終わり方','Phrase endings','句尾方式','Окончания фраз','Finales de frase','Finais de frase','Satzenden'],
['ふわっと','Softly fading','轻柔收尾','Мягко затихают','Suaves','Suaves','Sanft ausklingend'],
['少しはねる','A slight lift','稍微上扬','Слегка приподняты','Con un ligero salto','Com uma leve subida','Leicht anhebend'],
['すっきり','Crisp','利落','Чёткие','Nítidos','Nítidos','Klar'],
['声の雰囲気','Voice character','声音氛围','Настроение голоса','Carácter de la voz','Jeito da voz','Stimmcharakter'],
['好奇心いっぱい','Curious','充满好奇','Любопытный','Curiosa','Curiosa','Neugierig'],
['落ち着いている','Composed','沉静','Спокойный','Serena','Serena','Gelassen'],
['元気いっぱい','Energetic','活力满满','Энергичный','Enérgica','Cheia de energia','Energiegeladen']
];
for(const [i,locale]of ['ja','en','zh-CN','ru','es-ES','pt-BR','de'].entries()){
    const file=path.resolve(__dirname,'../../locales',locale+'.json'),catalog=JSON.parse(fs.readFileSync(file,'utf8'));
    for(const row of rows)if(!Object.hasOwn(catalog,row[0]))catalog[row[0]]=row[i];
    fs.writeFileSync(file,JSON.stringify(catalog,null,2)+'\n','utf8');
}
