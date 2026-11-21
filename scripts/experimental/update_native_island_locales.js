'use strict';
const fs=require('node:fs'),path=require('node:path');
const rows=[
 ['道','path','道路','тропа','camino','caminho','Weg'],
 ['この子と、島で暮らす。','Life together on the island.','和它一起在岛上生活。','Жить вместе на острове.','Vivir juntos en la isla.','Viver juntos na ilha.','Zusammen auf der Insel leben.'],
 ['はじめまして','Nice to meet you','初次见面','Рад знакомству','Mucho gusto','Prazer em conhecer você','Schön, dich kennenzulernen'],
 ['現在地・見える対象・活動・体力／満腹度・直近の実結果も、上限を決めてGoogleへ送ります。旧版とは別保存で、追加クレジットは使いません。','Location, visible objects, activity, energy/fullness and recent actual results are also sent to Google within fixed limits. Saves are separate from the old version. No extra credits are used.','当前位置、可见对象、活动、体力／饱腹度及近期实际结果也会在规定限额内发送给Google。与旧版分开保存，不使用额外额度。','Местоположение, видимые объекты, действия, силы/сытость и последние реальные результаты также передаются Google в заданных пределах. Сохранения отдельные, дополнительные кредиты не используются.','También se envían a Google la ubicación, objetos visibles, actividad, energía/saciedad y resultados reales recientes, con límites fijos. Guardado separado; sin créditos extra.','Local, objetos visíveis, atividade, energia/saciedade e resultados reais recentes também são enviados ao Google dentro de limites fixos. Salvamento separado; sem créditos extras.','Ort, sichtbare Objekte, Tätigkeit, Energie/Sättigung und jüngste echte Ergebnisse werden ebenfalls innerhalb fester Grenzen an Google gesendet. Getrennter Spielstand; keine zusätzlichen Credits.'],
 ['まず、いくつかの質問から。','First, a few questions.','先回答几个问题。','Сначала несколько вопросов.','Primero, unas preguntas.','Primeiro, algumas perguntas.','Zuerst ein paar Fragen.'],
 ['{{0}} / {{1}}','{{0}} / {{1}}','{{0}} / {{1}}','{{0}} / {{1}}','{{0}} / {{1}}','{{0}} / {{1}}','{{0}} / {{1}}'],
 ['前へ','Back','上一页','Назад','Atrás','Voltar','Zurück'],
 ['次へ','Next','下一页','Далее','Siguiente','Avançar','Weiter'],
 ['人影','a person','人影','человек','una persona','uma pessoa','eine Person'],
 ['木の実を食べた。甘い味がした。','I ate a berry. It tasted sweet.','吃了一颗果实，味道很甜。','Я съел ягоду. Она была сладкой.','Comí una baya. Sabía dulce.','Comi uma fruta. Ela era doce.','Ich aß eine Beere. Sie schmeckte süß.'],
 ['木陰で休んだ。','I rested in the shade.','在树荫下休息了。','Я отдохнул в тени.','Descansé a la sombra.','Descansei à sombra.','Ich ruhte mich im Schatten aus.'],
 ['歩いて{{0}}に着いた。','I walked to {{0}}.','走到了{{0}}。','Я дошёл до {{0}}.','Caminé hasta {{0}}.','Caminhei até {{0}}.','Ich ging zu {{0}}.'],
 ['{{0}}が見えた。','I saw {{0}}.','看到了{{0}}。','Я увидел: {{0}}.','Vi {{0}}.','Vi {{0}}.','Ich sah {{0}}.'],
 ['島の{{0}}日目','Island day {{0}}','岛上第{{0}}天','День {{0}} на острове','Día {{0}} en la isla','Dia {{0}} na ilha','Inseltag {{0}}'],
 ['島の{{0}}日目・続き','Island day {{0}} · continued','岛上第{{0}}天·续页','День {{0}} на острове · продолжение','Día {{0}} · continuación','Dia {{0}} · continuação','Inseltag {{0}} · Fortsetzung'],
 ['実際に見たものの絵','Drawing of something actually seen','实际所见之物的画','Рисунок действительно увиденного','Dibujo de algo que vi','Desenho de algo que vi','Zeichnung von etwas tatsächlich Gesehenem'],
 ['記録の根拠','Sources for this record','记录的依据','Основания записи','Fuentes del registro','Fontes do registro','Belege für den Eintrag'],
 ['行動案は実行条件を満たさず、実行していません。','The proposed action did not meet the conditions and was not performed.','行动建议未满足执行条件，未执行。','Предложенное действие не отвечало условиям и не выполнено.','La acción propuesta no cumplía las condiciones y no se realizó.','A ação proposta não atendia às condições e não foi executada.','Die vorgeschlagene Handlung erfüllte die Bedingungen nicht und wurde nicht ausgeführt.'],
 ['立ち止まっている','Standing still','站着','Стоит на месте','Está de pie','Está parado','Steht still'],
 ['歩いている','Walking','正在走路','Идёт','Caminando','Caminhando','Geht'],
 ['食べている','Eating','正在吃东西','Ест','Comiendo','Comendo','Isst'],
 ['休んでいる','Resting','正在休息','Отдыхает','Descansando','Descansando','Ruht sich aus'],
 ['体力','Energy','体力','Силы','Energía','Energia','Energie'],
 ['満腹度','Fullness','饱腹度','Сытость','Saciedad','Saciedade','Sättigung'],
 ['見えたものと、教わった言葉。','Things seen, words taught.','所见之物与学到的词语。','Увиденное и услышанные слова.','Lo que vio y las palabras enseñadas.','O que viu e as palavras ensinadas.','Gesehenes und beigebrachte Wörter.'],
 ['星を選ぶと、原発言や実体験の根拠を読めます。語の候補は習得済みの知識とは分けています。','Select a star to read its original source or actual experience. Word candidates are separate from acquired knowledge.','选择星星可查看原话或实际经历的依据。候选词与已掌握的知识分开。','Выберите звезду, чтобы прочитать исходную фразу или реальный опыт. Кандидаты слов отделены от усвоенных знаний.','Elige una estrella para ver su fuente o experiencia real. Las palabras candidatas se distinguen del conocimiento adquirido.','Selecione uma estrela para ler a fonte ou experiência real. Palavras candidatas são separadas do conhecimento adquirido.','Wähle einen Stern für Originalquelle oder echte Erfahrung. Wortkandidaten sind von erworbenem Wissen getrennt.'],
 ['今回つながっている行動：歩く・木の実を食べる・休む。','Connected actions: walking, eating berries and resting.','本次已连接的行动：走路、吃果实、休息。','Подключены ходьба, еда ягод и отдых.','Acciones conectadas: caminar, comer bayas y descansar.','Ações conectadas: caminhar, comer frutas e descansar.','Verbundene Handlungen: gehen, Beeren essen und ruhen.'],
 ['会話の原文を見る','Read the original conversation','查看对话原文','Читать исходный разговор','Ver conversación original','Ver conversa original','Originalgespräch lesen']
];
for(const [index,locale]of ['ja','en','zh-CN','ru','es-ES','pt-BR','de'].entries()){
    const file=path.resolve(__dirname,'../../locales',locale+'.json'),catalog=JSON.parse(fs.readFileSync(file,'utf8'));
    for(const row of rows)if(!Object.hasOwn(catalog,row[0]))catalog[row[0]]=row[index];
    fs.writeFileSync(file,JSON.stringify(catalog,null,2)+'\n','utf8');
}
