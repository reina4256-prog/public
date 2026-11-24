'use strict';
const fs=require('node:fs'),path=require('node:path');
const rows=[
['冒険家と話す','Talk to the adventurer','与冒险家交谈','Поговорить с путешественницей','Hablar con la aventurera','Conversar com a aventureira','Mit der Abenteurerin sprechen'],
['冒険家の声','Adventurer’s voice','冒险家的声音','Голос путешественницы','Voz de la aventurera','Voz da aventureira','Stimme der Abenteurerin'],
['冒険家の声の特徴をえらぼう。','Choose the qualities of the adventurer’s voice.','选择冒险家声音的特点。','Выбери особенности голоса путешественницы.','Elige las características de la voz de la aventurera.','Escolha as características da voz da aventureira.','Wähle die Eigenschaften der Stimme der Abenteurerin.'],
['またお話ししよう。','Let’s talk again sometime.','下次再聊吧。','Поговорим ещё как-нибудь.','Hablemos de nuevo otro día.','Vamos conversar de novo outro dia.','Lass uns bald wieder sprechen.'],
['今はお話を続けられないみたい。また今度にしよう。','We can’t carry on talking right now. Let’s try another time.','现在好像没法继续聊了。下次再聊吧。','Сейчас не получается продолжить разговор. Попробуем в другой раз.','Ahora no podemos seguir hablando. Lo intentaremos otro día.','Não dá para continuar a conversa agora. Vamos tentar outra hora.','Gerade können wir nicht weiterreden. Versuchen wir es ein anderes Mal.'],
['話を終える','End conversation','结束交谈','Завершить разговор','Terminar la conversación','Encerrar a conversa','Gespräch beenden'],
['つづける','Continue','继续','Продолжить','Continuar','Continuar','Weiter'],
['冒険家','Adventurer','冒险家','Путешественница','Aventurera','Aventureira','Abenteurerin']
];
for(const [i,locale]of ['ja','en','zh-CN','ru','es-ES','pt-BR','de'].entries()){
    const file=path.resolve(__dirname,'../../locales',locale+'.json'),catalog=JSON.parse(fs.readFileSync(file,'utf8'));
    for(const row of rows)if(!Object.hasOwn(catalog,row[0]))catalog[row[0]]=row[i];
    fs.writeFileSync(file,JSON.stringify(catalog,null,2)+'\n','utf8');
}
