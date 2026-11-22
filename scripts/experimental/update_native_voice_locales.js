'use strict';
const fs=require('node:fs'),path=require('node:path');
const rows=[
['今日は、どんなお話をしよう？','What shall we talk about today?','今天聊些什么呢？','О чём поговорим сегодня?','¿De qué hablamos hoy?','Sobre o que vamos conversar hoje?','Worüber wollen wir heute reden?'],
['今はお話しできないみたい。少し待ってから、もう一度話しかけてね。','I can’t talk right now. Wait a little and try talking to me again.','现在好像聊不了。稍等一下，再来和我说话吧。','Сейчас поговорить не получается. Подожди немного и обратись ко мне снова.','Ahora no puedo hablar. Espera un poco y vuelve a hablarme.','Não consigo conversar agora. Espere um pouquinho e fale comigo de novo.','Gerade kann ich nicht sprechen. Warte kurz und sprich mich dann wieder an.'],
['今日はお話をひと休み。またあとで話そうね。','Let’s take a break from chatting. We can talk again later.','今天先休息一下，晚点再聊吧。','Давай отдохнём от разговоров. Поговорим позже.','Descansemos un rato. Hablaremos más tarde.','Vamos descansar um pouquinho. Conversamos mais tarde.','Machen wir eine Gesprächspause. Wir reden später weiter.'],
['すんだ声','Clear voice','清澈的声音','Ясный голос','Voz clara','Voz clara','Klare Stimme'],
['わかばの声','Youthful voice','朝气的声音','Юный голос','Voz juvenil','Voz jovem','Junge Stimme'],
['きらめく声','Sparkling voice','闪亮的声音','Искристый голос','Voz radiante','Voz radiante','Funkelnde Stimme'],
['ささやく声','Whispering voice','轻柔低语','Шепчущий голос','Voz susurrante','Voz sussurrante','Flüsternde Stimme'],
['おちついた声','Composed voice','沉稳的声音','Сдержанный голос','Voz serena','Voz serena','Gefasste Stimme'],
['りんとした声','Confident voice','坚定的声音','Уверенный голос','Voz firme','Voz firme','Entschlossene Stimme'],
['はずむ声','Bouncy voice','欢快的声音','Задорный голос','Voz animada','Voz animada','Beschwingte Stimme'],
['そよかぜの声','Breezy voice','微风般的声音','Лёгкий голос','Voz ligera','Voz leve','Luftige Stimme'],
['あかるい声','Bright voice','明朗的声音','Светлый голос','Voz alegre','Voz alegre','Helle Stimme'],
['おだやかな声','Calm voice','平和的声音','Спокойный голос','Voz tranquila','Voz tranquila','Ruhige Stimme'],
['ちからづよい声','Strong voice','有力的声音','Сильный голос','Voz potente','Voz forte','Kraftvolle Stimme'],
['（おすすめ）','(recommended)','（推荐）','(рекомендуется)','(recomendada)','(recomendada)','(empfohlen)'],
['この子の声',"Your companion’s voice",'伙伴的声音','Голос спутника','La voz de tu compañero','A voz do seu companheiro','Die Stimme deines Gefährten'],
['声をえらぶ','Choose a voice','选择声音','Выбрать голос','Elige una voz','Escolha uma voz','Stimme wählen'],
['声をきく','Listen','试听','Послушать','Escuchar','Ouvir','Anhören'],
['声をとめる','Stop voice','停止声音','Остановить голос','Detener voz','Parar voz','Stimme anhalten'],
['声でお話しする','Speak aloud','用声音交谈','Говорить вслух','Hablar en voz alta','Falar em voz alta','Laut sprechen'],
['この声にする','Choose this voice','就用这个声音','Выбрать этот голос','Elegir esta voz','Escolher esta voz','Diese Stimme wählen'],
['声の約束を読み出せませんでした。','I couldn’t find our chosen voice.','没能找回约定好的声音。','Не удалось вспомнить выбранный голос.','No pude recuperar la voz elegida.','Não consegui recuperar a voz escolhida.','Die gewählte Stimme konnte nicht geladen werden.'],
['この声に決まり！','This is my voice!','就用这个声音啦！','Вот мой голос!','¡Esta será mi voz!','Esta será minha voz!','Das ist meine Stimme!'],
['声の約束を残せませんでした。もう一度ためしてね。','I couldn’t remember this voice. Please try again.','没能记住这个声音。请再试一次。','Не удалось запомнить голос. Попробуй ещё раз.','No pude guardar esta voz. Inténtalo otra vez.','Não consegui guardar esta voz. Tente de novo.','Die Stimme konnte nicht gespeichert werden. Bitte versuche es erneut.'],
['声を待っています…','Getting my voice ready…','正在准备声音……','Готовлю голос…','Preparando mi voz…','Preparando minha voz…','Meine Stimme wird bereit…'],
['今日は声をおやすみするね。文字でお話ししよう。','My voice is resting today. Let’s chat in writing.','今天让声音休息一下。我们用文字聊吧。','Сегодня мой голос отдыхает. Давай поговорим письменно.','Hoy descansa mi voz. Hablemos por escrito.','Minha voz vai descansar hoje. Vamos conversar por escrito.','Meine Stimme ruht sich heute aus. Lass uns schreiben.'],
['今は声が出せないみたい。文字でお話ししよう。','My voice isn’t working right now. Let’s chat in writing.','现在好像发不出声音。我们用文字聊吧。','Сейчас голос не получается. Давай поговорим письменно.','Ahora no me sale la voz. Hablemos por escrito.','Minha voz não está saindo agora. Vamos conversar por escrito.','Gerade klappt es mit meiner Stimme nicht. Lass uns schreiben.'],
['こんにちは。今日は、どんな一日だった？ よかったら、聞かせてね。','Hello. How was your day? Tell me about it, if you like.','你好。今天过得怎么样？愿意的话，讲给我听吧。','Привет. Как прошёл твой день? Расскажешь мне, если хочешь?','Hola. ¿Cómo te ha ido el día? Si quieres, cuéntamelo.','Olá. Como foi o seu dia? Se quiser, me conte.','Hallo. Wie war dein Tag? Wenn du magst, erzähl mir davon.']
];
for(const [i,locale]of ['ja','en','zh-CN','ru','es-ES','pt-BR','de'].entries()){
 const file=path.resolve(__dirname,'../../locales',locale+'.json'),catalog=JSON.parse(fs.readFileSync(file,'utf8'));
 for(const row of rows)catalog[row[0]]=row[i];
 // The extraction audit treats Han text as a source too; retain the same seven-language sample.
 catalog[rows.at(-1)[2]]=rows.at(-1)[i];
 fs.writeFileSync(file,JSON.stringify(catalog,null,2)+'\n','utf8');
}
