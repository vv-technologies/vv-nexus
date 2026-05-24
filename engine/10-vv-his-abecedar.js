/**
 * VV HiS Abecedar Semantic — dicționar universal de tipare
 * Citește tipare, nu cuvinte exacte.
 * Suportă: română · engleză · franceză · spaniolă · germană · italiană
 * Robust la: diacritice lipsă · typo-uri · mix de limbi
 * © VV Technologies · Cosmin Toma
 *
 * Integrare: se auto-injectează în VVHiSTokenize dacă e încărcat după el.
 */
(function (global) {
  'use strict';

  /* ── Normalizare universală (elimină diacritice + lowercase) ── */
  function norm(s) {
    return String(s).toLowerCase()
      .replace(/[ăâ]/g, 'a').replace(/î/g, 'i')
      .replace(/[șşśš]/g, 's').replace(/[țţ]/g, 't')
      .replace(/[éèêëě]/g, 'e').replace(/[àáâãä]/g, 'a')
      .replace(/[ùúûü]/g, 'u').replace(/[ìíîï]/g, 'i')
      .replace(/[òóôõö]/g, 'o').replace(/[ñ]/g, 'n')
      .replace(/[ç]/g, 'c').replace(/[ß]/g, 'ss');
  }

  /* ── Verifică dacă un stem e prezent în text ── */
  function hasStem(lpadded, stem) {
    var ns = norm(stem);
    if (ns.length <= 3) {
      /* cuvinte scurte: necesită spațiu înainte */
      return lpadded.indexOf(' ' + ns) !== -1;
    }
    return lpadded.indexOf(ns) !== -1;
  }

  /* ══════════════════════════════════════════
     ABECEDAR — toate tiparele semantice
     ══════════════════════════════════════════ */
  var ABECEDAR = [

    /* ── STĂRI / MOOD ─────────────────────────── */
    { token: 'STARE:fericit', mood: 'fericit', musicKey: 'fericit', stems: [
      'fericit','vesel','bucur','bucuros','voios','radios','entuziast',
      'happy','joyful','cheerful','glad','elated','joyous','blissful',
      'heureux','content','joyeux','gai','feliz','alegre','contento',
      'froh','frohlich','glucklich','heiter','felice','gioioso','lieto'
    ]},
    { token: 'STARE:trist', mood: 'trist', musicKey: 'trist', stems: [
      'trist','tristete','melanc','deprimat','depres','suparat','abatut','necajit',
      'sad','unhappy','gloomy','melancholy','sorrowful','miserable','heartbroken','down',
      'triste','malheureux','melancolique','deprime','traurig','traurig','unglucklich',
      'triste','malinconico','mesto','melanconico'
    ]},
    { token: 'STARE:furios', mood: 'furios', stems: [
      'furios','furie','nervos','enervat','iritat','manios','suparat foc',
      'angry','anger','furious','mad','rage','annoyed','irate','wrathful',
      'furieux','colere','enervant','wutend','argerlich','furioso','arrabbiato'
    ]},
    { token: 'STARE:speriat', mood: 'speriat', stems: [
      'speriat','frica','teama','anxios','anxiet','ingrijorat','panica','groaza','spaima',
      'scared','afraid','fear','fearful','terrified','anxious','frightened','panic',
      'peur','apeure','angst','angstlich','erschrocken','paura','spaventato','timoroso'
    ]},
    { token: 'STARE:liniste', mood: 'liniste', stems: [
      'linist','calm','pace','relaxat','senin','bland','potolit','meditativ',
      'calm','peaceful','quiet','serene','tranquil','relaxed','still','gentle',
      'calme','paisible','serein','tranquille','ruhig','gelassen','friedlich',
      'calmo','sereno','tranquillo','pacifico','quieto'
    ]},
    { token: 'STARE:tensiune', mood: 'tensiune', musicKey: 'tensiune', stems: [
      'tensiune','pericol','dramatic','intens','incordat','critic','in pericol',
      'tense','tension','danger','dramatic','intense','critical','threatening',
      'tension','danger','dramatique','intensif','gefahrlich','dramatisch','angespannt',
      'tensione','pericoloso','drammatico','intenso'
    ]},
    { token: 'STARE:indragostit', mood: 'indragostit', stems: [
      'indragostit','dragoste','iubire','iubit','romantic','amor','amoros','inima',
      'love','in love','romantic','loving','beloved','affection','adore','cherish',
      'amour','amoureux','romantique','liebevoll','verliebt','liebe','amore','innamorato','romantico'
    ]},
    { token: 'STARE:obosit', mood: 'obosit', stems: [
      'obosit','epuizat','somnoros','sleit','extenuat','fara energie',
      'tired','exhausted','sleepy','weary','fatigued','drained','worn out',
      'fatigue','epuise','endormi','mude','erschopft','schlafrig','stanco','esausto','assonnato'
    ]},
    { token: 'STARE:surprins', mood: 'surprins', stems: [
      'surprins','uimit','uluit','socat','neasteptat','uluitor',
      'surprised','amazed','shocked','astonished','stunned','bewildered',
      'surpris','etonne','stupefait','uberrascht','erstaunt','verblufft',
      'sorpreso','stupito','meravigliato'
    ]},

    /* ── VREME / WEATHER ──────────────────────── */
    { token: 'VREME:ploaie', weather: 'ploaie', stems: [
      'ploaie','plou','burni','aversiune','ploaie torentiala',
      'rain','raining','rainy','shower','drizzle','downpour','storm rain',
      'pluie','pluvieux','pleuvoir','regen','regnerisch','regnet',
      'pioggia','piovoso','piovere','lluvia','llover','lluvioso'
    ]},
    { token: 'VREME:soare', weather: 'soare', stems: [
      'soare','insorit','senin','luminos','radiant','zi frumoasa',
      'sun','sunny','sunshine','bright','clear sky','solar','cloudless',
      'soleil','ensoleille','sonne','sonnig','heiter','sole','soleggiato',
      'sol','soleado','luminoso'
    ]},
    { token: 'VREME:ninge', weather: 'ninge', stems: [
      'ning','zapad','ninsoare','viscol','omata','fulgi',
      'snow','snowing','snowy','blizzard','snowflake','flurry',
      'neige','neiger','enneige','schnee','schneien','neve','nevica','nieve','nevar'
    ]},
    { token: 'VREME:ceata', weather: 'ceata', stems: [
      'ceata','negura','pala','abur',
      'fog','foggy','mist','misty','haze','hazy',
      'brume','brumeux','nebel','nebelig','nebbia','nebbioso','niebla'
    ]},
    { token: 'VREME:vant', weather: 'vant', stems: [
      'vant','vantos','brixa','briza','rafala',
      'wind','windy','breeze','gust','breezy',
      'vent','venteux','wind','windig','vento','ventoso','viento'
    ]},
    { token: 'VREME:furtuna', weather: 'furtuna', stems: [
      'furtun','furtuna','vijelie','trasnet','tunet','fulger',
      'storm','stormy','thunder','lightning','thunderstorm','tempest',
      'tempete','orage','sturm','gewitter','blitz','tempesta','temporale','tormenta'
    ]},

    /* ── TIMP / TIME OF DAY ───────────────────── */
    { token: 'TIMP:dimineata', time: 'dimineata', stems: [
      'dimineat','rasarit','aurora','zori','devreme','dis de dimineat',
      'morning','dawn','sunrise','early','daybreak',
      'matin','aube','lever du soleil','morgen','sonnenaufgang','morgendammerung',
      'mattina','alba','mattino','manana','amanecer','madrugada'
    ]},
    { token: 'TIMP:amiaza', time: 'amiaza', stems: [
      'amiaza','pranz','la masa','miezul zilei',
      'noon','midday','lunchtime',
      'midi','mitag','mittag','mezzogiorno','mediodia'
    ]},
    { token: 'TIMP:apus', time: 'apus', stems: [
      'apus','amurg','inserare','asfinit','soarele apune',
      'sunset','dusk','twilight','sundown','golden hour',
      'coucher','crepuscule','abenddammerung','sonnenuntergang','tramonto','crepuscolo','atardecer','ocaso'
    ]},
    { token: 'TIMP:seara', time: 'seara', stems: [
      'seara','sear','spre noapte','dupa apus',
      'evening','night fall','tonight',
      'soir','soiree','abend','sera','tarde'
    ]},
    { token: 'TIMP:noapte', time: 'noapte', musicKey: 'noapte', stems: [
      'noapte','miezul noptii','nocturn','la miezul','intuneric','stele pe cer',
      'night','midnight','nocturnal','nighttime','dark','after dark',
      'nuit','minuit','noche','medianoche','nacht','mitternacht','notte','mezzanotte'
    ]},

    /* ── ANOTIMPURI / SEASONS ─────────────────── */
    { token: 'ANOTIMP:primavara', season: 'primavara', stems: [
      'primavar','primavara','muguri','inflorit','florile',
      'spring','springtime','bloom','blossom',
      'printemps','fruhling','fruhjahr','primavera','inizio estate'
    ]},
    { token: 'ANOTIMP:vara', season: 'vara', stems: [
      'vara','varat','cald','caldura','arsen','soare de vara',
      'summer','summertime','hot','heat wave',
      'ete','sommer','estate','verano','calor'
    ]},
    { token: 'ANOTIMP:toamna', season: 'toamna', stems: [
      'toamna','frunze rosii','frunze galbene','frunze cad','recolt',
      'autumn','fall','harvest','falling leaves',
      'automne','herbst','autunno','otono'
    ]},
    { token: 'ANOTIMP:iarna', season: 'iarna', stems: [
      'iarna','rece','ger','inghet','frig',
      'winter','cold','freezing','frost','icy',
      'hiver','froid','winter','kalte','inverno','freddo','invierno','frio'
    ]},

    /* ── ACȚIUNI / ACTIONS ────────────────────── */
    { token: 'ACTIUNE:alergare', action: 'alergare', stems: [
      'alearg','fuge','alerg','alerga','in fuga','fuga',
      'run','running','runs','sprint','jog','jogging','chase',
      'courir','court','laufen','lauft','rennen','correre','corre','correr'
    ]},
    { token: 'ACTIUNE:danseaza', action: 'danseaza', stems: [
      'danseaza','danseaz','dans','dansand','la dans',
      'dance','dancing','dances','waltz','ballet',
      'danser','danse','tanzen','tanzt','ballare','balla','bailar','baila'
    ]},
    { token: 'ACTIUNE:sare', action: 'sare', stems: [
      'sare','salt','sarind','saritura','in aer',
      'jump','jumping','jumps','leap','leaping','bounce','hop',
      'sauter','saute','springen','springt','saltare','salta','saltar'
    ]},
    { token: 'ACTIUNE:doarme', action: 'doarme', stems: [
      'doarm','dorm','doarme','dormind','adormit','somn','la somn',
      'sleep','sleeping','sleeps','nap','napping','slumber','asleep',
      'dormir','dort','schlafen','schlaft','dormire','dorme'
    ]},
    { token: 'ACTIUNE:zboara', action: 'zboara', stems: [
      'zboar','zbor','zburand','in zbor','se ridica in aer',
      'fly','flying','flies','soar','soaring','glide','hover',
      'voler','vole','fliegen','fliegt','volare','vola','volar','vuela'
    ]},
    { token: 'ACTIUNE:plange', action: 'plange', stems: [
      'plange','plans','lacrimi','plangand','in lacrimi',
      'cry','crying','cries','weep','weeping','tears','sob',
      'pleurer','pleure','weinen','weint','piangere','piange','llorar'
    ]},
    { token: 'ACTIUNE:rade', action: 'rade', stems: [
      'rade','ras','razand','hohote','amuzat',
      'laugh','laughing','laughs','giggle','chuckle','smile','smiling',
      'rire','rit','lachen','lacht','ridere','ride','reir','rie'
    ]},
    { token: 'ACTIUNE:lupta', action: 'lupta', stems: [
      'lupta','bate','se bate','luptand','duel','batalit',
      'fight','fighting','fights','battle','combat','struggle','clash',
      'combattre','se bat','kampfen','kampft','combattere','lottare','luchar'
    ]},
    { token: 'ACTIUNE:mediteaza', action: 'mediteaza', stems: [
      'mediteaza','meditatie','contempla','gandeste','in contemplatie',
      'meditate','meditating','contemplates','reflect','thinking','ponder',
      'mediter','contempler','meditieren','meditiert','meditare','medita','meditar'
    ]},

    /* ── SUBIECȚI MULTILINGVI / SUBJECTS ─────── */
    { token: 'SUBIECT:om', subject: 'om', stems: [
      'omul','oameni','persoana','barbat','fata','baiat','femeie','tanar','batran','copil','individ',
      'person','man','woman','boy','girl','human','people','child','kid','adult','figure',
      'homme','femme','personne','garcon','fille','enfant',
      'mann','frau','kind','mensch','person',
      'uomo','donna','persona','bambino','ragazzo',
      'hombre','mujer','persona','nino','chico'
    ]},
    { token: 'SUBIECT:pisica', subject: 'pisica', stems: [
      'pisica','pisic','motan','mocirlei','miciurel','felina',
      'cat','kitten','kitty','feline','tabby','tomcat',
      'chat','chatte','chaton','katze','katzchen','gatto','gattino','gato'
    ]},
    { token: 'SUBIECT:caine', subject: 'caine', stems: [
      'caine','cain','catel','cainele','haita','catei',
      'dog','puppy','pup','hound','canine','mutt','pooch',
      'chien','chiot','hund','welpe','cane','cucciolo','perro','cachorro'
    ]},
    { token: 'SUBIECT:copac', subject: 'copac', stems: [
      'copac','copaci','pom','arbore','trunchiul','ramuri','coroana copacului',
      'tree','trees','oak','pine','willow','maple',
      'arbre','arbres','baum','baume','albero','alberi','arbol'
    ]},
    { token: 'SUBIECT:pasare', subject: 'pasare', stems: [
      'pasare','pasari','vultur','cioara','randunica','privighetoare','porumbel','pescar',
      'bird','birds','eagle','crow','sparrow','pigeon','robin','swan','dove',
      'oiseau','vogel','uccello','pajaro','aguila'
    ]},
    { token: 'SUBIECT:munte', subject: 'munte', stems: [
      'munte','munti','pisc','varful','cresta','paduri de munte',
      'mountain','mountains','peak','summit','hill','highland',
      'montagne','mont','berg','gebirge','montagna','monte','montana','cima'
    ]},
    { token: 'SUBIECT:mare', subject: 'mare', stems: [
      'ocean','lacul','valuri','tarmul','litoral','apa marii',
      'sea','ocean','lake','waves','shore','beach','coast',
      'mer','ocean','lac','meer','see','ozean','mare','oceano','lago','spiaggia','mar'
    ]},
    { token: 'SUBIECT:girafa', subject: 'girafa', stems: [
      'girafa','giraf','giraffe','girafe','giraffa'
    ]},
    { token: 'SUBIECT:cal', subject: 'cal', stems: [
      'calul','armsar','iapa','manzul','herghelia',
      'horse','stallion','mare','foal','pony','steed',
      'cheval','jument','pferd','cavallo','caballo','yegua'
    ]},
    { token: 'SUBIECT:elefant', subject: 'elefant', stems: [
      'elefant','elefantul','trompa',
      'elephant','elefante','elefant'
    ]},
    { token: 'SUBIECT:urs', subject: 'urs', stems: [
      'ursul','ursi','ursoaica','ursuleti',
      'bear','grizzly','polar bear','ours','bar','orso','oso'
    ]},
    { token: 'SUBIECT:floare', subject: 'floare', stems: [
      'floare','flori','trandafir','lalea','margareta','crin','macies',
      'flower','flowers','rose','tulip','daisy','lily','blossom','bloom','petal',
      'fleur','fleurs','blume','blumen','fiore','fiori','flor','flores'
    ]},
    { token: 'SUBIECT:luna', subject: 'luna', stems: [
      'luna','lun','semilunar','secera lunii',
      'moon','moonlight','lunar','crescent','full moon',
      'lune','clair de lune','mond','mondlicht','luna','chiaro di luna'
    ]},
    { token: 'SUBIECT:nor', subject: 'nor', stems: [
      'nori','norii','cerul cu nori',
      'cloud','clouds','cloudy','cumulus',
      'nuage','nuages','wolke','wolken','nuvola','nuvole','nube','nubes'
    ]},
    { token: 'SUBIECT:padure', subject: 'padure', stems: [
      'padure','codru','dumbrava','padurea','jungla',
      'forest','woods','jungle','woodland','grove',
      'foret','bois','wald','forst','foresta','bosco','bosque','selva'
    ]},

    /* ── ANIMALE SĂLBATICE ───────────────────── */
    { token: 'SUBIECT:leu', subject: 'leu', stems: [
      'leu','leul','leoaica','regele junglei',
      'lion','lioness','leo','lejon',
      'lion','lionne','lowé','löwe','leone','leon'
    ]},
    { token: 'SUBIECT:tigru', subject: 'tigru', stems: [
      'tigru','tigrul','tigroaica',
      'tiger','tigress',
      'tigre','tigre','tiger','tigre'
    ]},
    { token: 'SUBIECT:panda', subject: 'panda', stems: [
      'panda','urs panda','giant panda','panda bear',
      'panda','pandabär','panda','panda géant'
    ]},
    { token: 'SUBIECT:vulpe', subject: 'vulpe', stems: [
      'vulpe','vulpea','renard',
      'fox','vixen','fuchs','volpe','zorro','renard'
    ]},
    { token: 'SUBIECT:lup', subject: 'lup', stems: [
      'lup','lupul','lupoaica','haita',
      'wolf','wolves','wolf','lupo','lobo','loup'
    ]},
    { token: 'SUBIECT:cerb', subject: 'cerb', stems: [
      'cerb','cerbul','caprioara','caprioa',
      'deer','stag','doe','buck','reindeer',
      'cerf','hirsch','cervo','ciervo'
    ]},
    { token: 'SUBIECT:zebra', subject: 'zebra', stems: [
      'zebra','zebre','zebras','zebra','zèbre','zebra'
    ]},
    { token: 'SUBIECT:gorila', subject: 'gorila', stems: [
      'gorila','gorilla','gorilă','gorille','gorilla'
    ]},
    { token: 'SUBIECT:crocodil', subject: 'crocodil', stems: [
      'crocodil','aligator','aligato','alligator','crocodile','krokodil'
    ]},

    /* ── ANIMALE DOMESTICE EXTRA ─────────────── */
    { token: 'SUBIECT:vaca', subject: 'vaca', stems: [
      'vaca','vacuta','bou','taurul','vitel',
      'cow','bull','calf','cattle','ox',
      'vache','veau','kuh','buey','mucca','bue'
    ]},
    { token: 'SUBIECT:oaie', subject: 'oaie', stems: [
      'oaie','miel','berbec','oita',
      'sheep','lamb','ram','ewe',
      'mouton','agneau','schaf','oveja','pecora','agnello'
    ]},
    { token: 'SUBIECT:iepure', subject: 'iepure', stems: [
      'iepure','iepuras','iepurele',
      'rabbit','bunny','hare',
      'lapin','kaninchen','conejo','coniglio'
    ]},
    { token: 'SUBIECT:gaina', subject: 'gaina', stems: [
      'gaina','cocos','pui','pasare de curte',
      'chicken','hen','rooster','chick','cock',
      'poule','coq','huhn','gallina','pollo'
    ]},

    /* ── INSECTE / PEȘTI ─────────────────────── */
    { token: 'SUBIECT:fluture', subject: 'fluture', stems: [
      'fluture','fluturele','fluturi',
      'butterfly','moth','papillon',
      'schmetterling','farfalla','mariposa'
    ]},
    { token: 'SUBIECT:albina', subject: 'albina', stems: [
      'albina','albinele','stup','fagure',
      'bee','honeybee','bumblebee',
      'abeille','biene','ape','abeja'
    ]},
    { token: 'SUBIECT:gandac', subject: 'gandac', stems: [
      'gandac','insecta','gargarita','lacusta','greier',
      'bug','insect','beetle','grasshopper','cricket',
      'insecte','käfer','insetto','insecto'
    ]},
    { token: 'SUBIECT:peste', subject: 'peste', stems: [
      'peste','pestele','rechin','delfin','balena','crap','stiuca',
      'fish','shark','dolphin','whale','salmon',
      'poisson','requin','dauphin','fisch','pesce','pez'
    ]},

    /* ── PLANTE EXTRA ────────────────────────── */
    { token: 'SUBIECT:trandafir', subject: 'trandafir', stems: [
      'trandafir','trandafirul','roses','rosier',
      'rose','roses','rosen','rosa','trandafiri'
    ]},
    { token: 'SUBIECT:cactus', subject: 'cactus', stems: [
      'cactus','cactusi','cactee','kakteen','cactus','cacto'
    ]},
    { token: 'SUBIECT:bambus', subject: 'bambus', stems: [
      'bambus','bamboo','bambou','bambou','bambu','bambù'
    ]},
    { token: 'SUBIECT:palmier', subject: 'palmier', stems: [
      'palmier','palmier','palma','palme','palm tree','palm','coconut tree'
    ]},
    { token: 'SUBIECT:brad', subject: 'brad', stems: [
      'brad','brazi','molid','conifer','pin','pinul',
      'pine','fir','spruce','cedar','christmas tree',
      'sapin','tanne','abete','pino'
    ]},
    { token: 'SUBIECT:grau', subject: 'grau', stems: [
      'grau','spic','holda','câmp de grau',
      'wheat','grain','field of wheat','cornfield',
      'ble','weizen','grano','trigo'
    ]},

    /* ── PEISAJ EXTRA ────────────────────────── */
    { token: 'SUBIECT:vulcan', subject: 'vulcan', stems: [
      'vulcan','vulcanul','eruptie','lava',
      'volcano','eruption','lava','volcanic',
      'volcan','vulkan','vulcano','volcán'
    ]},
    { token: 'SUBIECT:plaja', subject: 'plaja', stems: [
      'plaja','plajă','nisip','litoral','tarm',
      'beach','shore','coast','seaside','sand',
      'plage','strand','spiaggia','playa'
    ]},
    { token: 'SUBIECT:stanca', subject: 'stanca', stems: [
      'stanca','stânca','roca','piatra','bolovan','perete de roca',
      'rock','cliff','boulder','stone wall','crag',
      'rocher','falaise','felsen','roccia','roca'
    ]},
    { token: 'SUBIECT:casa', subject: 'casa', stems: [
      'casa','casuta','cladire','locuinta',
      'house','home','cottage','building','cabin',
      'maison','haus','casa','hogar'
    ]},

    /* ── CINEMA / STIL ────────────────────────── */
    { token: 'CINEMA:epic', stems: [
      'epic','cinematic','hollywood','blockbuster','grandios','spectaculos','magnific',
      'epic','cinematic','dramatic','spectacular','magnificent','grand','majestic',
      'epique','grandiose','episch','grandios','cinematografico','epico','grandioso'
    ]},
    { token: 'CINEMA:minimal', stems: [
      'minimalist','simplu','simplist','pur','curat','fara detalii',
      'minimal','minimalist','simple','clean','pure','bare',
      'minimaliste','simple','minimalistisch','einfach','minimalista','semplice'
    ]},

    /* ── INTENSITATE ──────────────────────────── */
    { token: 'INTENSITATE:mare', stems: [
      'foarte','extrem','incredibil','super','mega','enorm','maxim','la maxim',
      'very','extremely','super','incredibly','highly','intensely','deeply',
      'tres','extremement','sehr','extrem','molto','estremamente','muy','extremadamente'
    ]},
    { token: 'INTENSITATE:mica', stems: [
      'putin','usor','discret','subtil','aproape','abia','treptat',
      'slightly','barely','gently','softly','subtly','almost','faintly',
      'peu','legerement','wenig','leicht','poco','leggermente','apenas'
    ]},

    /* ── MULTIPLU ─────────────────────────────── */
    { token: 'MULTIPLU:multi', stems: [
      'mai multi','grup de','multime','gramada','o multime','zece','doisprezece',
      'many','group of','crowd','lots of','plenty','several','dozen',
      'plusieurs','beaucoup','mehrere','viele','molti','tanti','varios','muchos'
    ]},

    /* ── ORGANISM VIU ─────────────────────────── */
    { token: 'ORGANISM:viu', stems: [
      'viu','respira','organism','traieste','pulsatie','bate inima',
      'alive','breathing','living','breathe','pulse','heartbeat','vital',
      'vivant','respire','lebendig','atmet','vivo','respira','vive'
    ]}
  ];

  /* ── Funcția principală de îmbogățire ── */
  function enrich(parsed, rawText) {
    var l = ' ' + norm(rawText) + ' ';

    ABECEDAR.forEach(function (entry) {
      var matched = entry.stems.some(function (stem) {
        return hasStem(l, stem);
      });
      if (!matched) return;

      /* Token */
      if (parsed.tokens.indexOf(entry.token) === -1) parsed.tokens.push(entry.token);

      /* Câmpuri semantice — nu suprascrie ce a detectat deja tokenizerul de bază */
      if (entry.mood    && !parsed.mood)    parsed.mood    = entry.mood;
      if (entry.weather && !parsed.weather) parsed.weather = entry.weather;
      if (entry.time    && !parsed.time)    parsed.time    = entry.time;
      if (entry.season  && !parsed.season)  parsed.season  = entry.season;
      if (entry.action  && !parsed.action)  parsed.action  = entry.action;
      if (entry.musicKey && parsed.musicKey === 'liniste') parsed.musicKey = entry.musicKey;

      /* Subiecți */
      if (entry.subject && parsed.subjects.indexOf(entry.subject) === -1) {
        parsed.subjects.push(entry.subject);
      }
    });

    return parsed;
  }

  /* ── Auto-inject în VVHiSTokenize ── */
  var _origTokenize = global.VVHiSTokenize;
  if (_origTokenize) {
    global.VVHiSTokenize = function (txt, opts) {
      var parsed = _origTokenize(txt, opts);
      return enrich(parsed, txt);
    };
  }

  /* ── Export ── */
  global.VVHiSAbecedar = {
    version: '1.0.0',
    enrich: enrich,
    norm: norm,
    size: ABECEDAR.length
  };

  if (typeof console !== 'undefined') {
    console.log('[VV HiS Abecedar] v1.0 — ' + ABECEDAR.length + ' tipare semantice · 6 limbi');
  }

})(typeof window !== 'undefined' ? window : this);
