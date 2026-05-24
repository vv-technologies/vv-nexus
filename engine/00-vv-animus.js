// ============================================================
// VV ANIMUS — Creierul Central LEA
// Hibrid Inteligent: HiT + HiN + HiM + HiE + HiD
// Cosmin Toma / VV Technologies — Mai 2026
// Toate drepturile rezervate.
//
// API public: window.Lea.think(text) → rezultat complet
// Orice aplicație VV poate folosi acest modul.
// ============================================================

var VVAnimus = (function () {

  // ─────────────────────────────────────────────
  // UTILITAR — normalizare diacritice
  // ─────────────────────────────────────────────
  function norm(s) {
    return (s || '').toLowerCase()
      .replace(/ă/g,'a').replace(/â/g,'a').replace(/î/g,'i')
      .replace(/ș/g,'s').replace(/ş/g,'s')
      .replace(/ț/g,'t').replace(/ţ/g,'t');
  }

  // ════════════════════════════════════════════════════════
  // HiT — Hibrid Inteligent Tranzit
  // Routerul de intenții: ce tip de cerere primim?
  // ════════════════════════════════════════════════════════

  var HIT_COMANDA   = ['ridica','misca','roteste','lasa','coboara','intinde','apleca','intoarce','muta','pune mana','pune piciorul'];
  var HIT_SCENA     = ['deseneaza','arata','imagineaza','creaza','construieste','fa o scena','vreau o scena','pune','adauga','sterge'];
  var HIT_INTREBARE = ['ce este','ce face','cum','de ce','cand','unde','cine','care','cat','este adevarat','stii','ai auzit'];
  var HIT_EMOTIE    = ['eu sunt','sunt','ma simt','simt ca','azi','ma doare','am obosit','nu pot','mi-e','mi e','imi este'];
  var HIT_CREATIV   = ['ceva care sa','transmite','o stare de','sentimentul de','atmosfera de','ceva cu','un sentiment'];
  var HIT_SALUT     = ['buna ziua','buna seara','buna dimineata','buna','salut','hei','hello','hi','ce mai faci','cum esti','neata'];
  var HIT_IDENTITATE= ['cine esti','ce esti','cum te cheama','ce faci tu','cine e lea','ce e lea','prezinta-te','spune-mi despre tine'];

  function hitClassify(text) {
    var n = norm(text);
    var sc = { comanda:0, scena:0, intrebare:0, emotie:0, creativ:0 };

    HIT_COMANDA.forEach(function(v){   if(n.indexOf(norm(v))!==-1) sc.comanda   += 2; });
    HIT_SCENA.forEach(function(v){     if(n.indexOf(norm(v))!==-1) sc.scena     += 1.5; });
    HIT_INTREBARE.forEach(function(v){ if(n.indexOf(norm(v))!==-1) sc.intrebare += 1; });
    HIT_EMOTIE.forEach(function(v){    if(n.indexOf(norm(v))!==-1) sc.emotie    += 2; });
    HIT_CREATIV.forEach(function(v){   if(n.indexOf(norm(v))!==-1) sc.creativ   += 2; });
    HIT_SALUT.forEach(function(v){     if(n.indexOf(norm(v))!==-1) sc.salut     = (sc.salut||0) + 3; });
    HIT_IDENTITATE.forEach(function(v){if(n.indexOf(norm(v))!==-1) sc.identitate= (sc.identitate||0) + 4; });

    if (text.trim().slice(-1) === '?') sc.intrebare += 3;

    var maxKey = 'scena', maxVal = sc.scena;
    Object.keys(sc).forEach(function(k){ if(sc[k] > maxVal){ maxVal = sc[k]; maxKey = k; }});

    return { type: maxKey, confidence: Math.min(1, maxVal / 4), scores: sc };
  }

  // ════════════════════════════════════════════════════════
  // HiN — Hibrid Inteligent Nexus
  // Sinapsele: relații ponderate între concepte
  // Lea nu caută cuvinte — înțelege relații
  // ════════════════════════════════════════════════════════

  var HIN_BASE = {
    // EMOȚII
    'trist':     { implica: {ploaie:0.7,noapte:0.6,singur:0.8,albastru:0.9,frig:0.5,melancolie:0.85},       vizual: {culori_reci:0.9,lumina_slaba:0.8,umbre_adanci:0.6} },
    'furios':    { implica: {rosu:0.8,tensiune:0.9,conflict:0.7,furtuna:0.6,energie:0.7},                    vizual: {rosu_accent:0.7,contraste_mari:0.8,lumina_dura:0.7} },
    'bucuros':   { implica: {soare:0.8,galben:0.7,primavara:0.6,caldura:0.7,energie:0.6},                    vizual: {culori_calde:0.9,lumina_difuza:0.7,saturatie_mare:0.7} },
    'speriat':   { implica: {intuneric:0.9,singur:0.7,noapte:0.8,frig:0.6,pericol:0.8},                     vizual: {intuneric_dominant:0.9,lumina_punctuala:0.7,culori_reci:0.6} },
    'linistit':  { implica: {natura:0.7,munte:0.6,verde:0.7,pace:0.9,respiratie:0.5},                       vizual: {culori_naturale:0.8,lumina_difuza:0.9,contraste_mici:0.7} },
    'singur':    { implica: {noapte:0.6,melancolie:0.8,tacere:0.7,spatiu_gol:0.7},                           vizual: {spatiu_negativ_mare:0.8,culori_reci:0.6,lumina_slaba:0.5} },
    'obosit':    { implica: {noapte:0.7,lentoare:0.8,gri:0.5},                                               vizual: {saturatie_mica:0.7,lumina_calda_slaba:0.6} },
    'mandru':    { implica: {lumina:0.7,verticala:0.8,putere:0.7,rosu:0.4},                                  vizual: {lumina_sus:0.8,verticala_dominanta:0.7} },
    'nostalgic': { implica: {trecut:0.8,galben_cald:0.7,sepia:0.6,melancolie:0.6},                          vizual: {saturatie_mica:0.6,galben_cald:0.8,ceata_usoara:0.5} },

    // VREME
    'ninge':     { implica: {iarna:0.95,frig:0.95,alb:0.95,tacere:0.7,vulnerabilitate:0.4},                 vizual: {alb_dominant:0.8,lumina_difuza_rece:0.9,particule:0.8} },
    'ploaie':    { implica: {tristete:0.6,toamna:0.7,gri:0.8,frig:0.5,melancolie:0.5},                     vizual: {gri_dominant:0.7,reflexii:0.6,lumina_difuza:0.8} },
    'soare':     { implica: {caldura:0.9,bucurie:0.6,galben:0.8,vara:0.7,energie:0.7},                      vizual: {lumina_puternica:0.9,umbre_clare:0.7,culori_saturate:0.8} },
    'furtuna':   { implica: {pericol:0.8,tensiune:0.7,intuneric:0.7,ploaie:0.8},                            vizual: {contrast_extrem:0.8,albastru_inchis:0.7,lumini_dramatice:0.8} },
    'ceata':     { implica: {mister:0.9,melancolie:0.6,tacere:0.7,singur:0.5},                              vizual: {alb_gri_ceata:0.9,contur_estompat:0.9,adancime_mica:0.8} },
    'vant':      { implica: {miscare:0.9,libertate:0.6,energie:0.5,schimbare:0.7},                          vizual: {linii_dinamice:0.8,miscare_vegetatie:0.7} },
    'caldura':   { implica: {vara:0.8,soare:0.7,portocaliu:0.6,lentoare:0.4},                               vizual: {portocaliu_rosu:0.7,lumina_stralucitoare:0.8} },

    // TIMP
    'noapte':    { implica: {intuneric:0.95,odihna:0.5,mister:0.6,singur:0.4,stele:0.6},                    vizual: {intuneric_dominant:0.9,surse_punctuale:0.7,albastru_profund:0.8} },
    'dimineata': { implica: {speranta:0.7,roz:0.6,caldura:0.5,inceput:0.8,pace:0.6},                       vizual: {roz_auriu:0.8,lumina_din_lateral:0.9,ceata_usoara:0.5} },
    'apus':      { implica: {melancolie:0.7,rosu:0.7,sfarsit:0.6,caldura:0.6,frumusete:0.8},               vizual: {rosu_portocaliu:0.9,umbre_lungi:0.8,lumina_din_lateral:0.9} },
    'amiaza':    { implica: {soare:0.8,caldura:0.8,energie:0.7,umbre_scurte:0.8},                           vizual: {lumina_verticala:0.9,umbre_scurte:0.8,saturatie_mare:0.7} },
    'iarna':     { implica: {frig:0.95,ninge:0.7,alb:0.8,tacere:0.7,izolare:0.5},                          vizual: {alb_dominant:0.8,gri_rece:0.6,lumina_difuza:0.7} },
    'vara':      { implica: {caldura:0.9,soare:0.8,verde:0.7,libertate:0.6,energie:0.7},                    vizual: {verde_saturat:0.8,lumina_dura:0.7,umbre_scurte:0.6} },
    'toamna':    { implica: {melancolie:0.7,portocaliu:0.8,sfarsit:0.5,vant:0.6,frig:0.4},                  vizual: {portocaliu_maro:0.9,lumina_calda_slaba:0.7,frunze_cazand:0.8} },
    'primavara': { implica: {inceput:0.8,verde:0.7,bucurie:0.6,energie:0.7,ploaie:0.4},                     vizual: {verde_crud:0.9,lumina_proaspata:0.8,culori_pastel:0.7} },

    // PERSONAJE
    'batran':    { implica: {intelepciune:0.7,lentoare:0.7,vulnerabilitate:0.6,experienta:0.8},              vizual: {detalii_riduri:0.6,linii_orizontale:0.5,contrast_mic:0.5} },
    'copil':     { implica: {bucurie:0.7,joc:0.8,energie:0.7,nevinovatie:0.9},                              vizual: {culori_saturate:0.8,dinamism:0.7,unghiuri_joase:0.6} },
    'om':        { implica: {prezenta:0.8,poveste:0.7,emotie:0.6},                                           vizual: {focus_central:0.7} },
    'femeie':    { implica: {eleganta:0.6,gratie:0.7,prezenta:0.8},                                          vizual: {linii_curbe:0.6,focus_central:0.7} },
    'barbat':    { implica: {forta:0.6,prezenta:0.8,actiune:0.6},                                            vizual: {linii_verticale:0.6,focus_central:0.7} },

    // LOCURI
    'munte':     { implica: {grandoare:0.9,libertate:0.7,liniste:0.7,provocare:0.6,verticalitate:0.9},      vizual: {linii_verticale:0.9,ceata_jos:0.6,gri_albastru:0.7} },
    'mare':      { implica: {libertate:0.9,infinit:0.8,pace:0.6,putere:0.7,albastru:0.9},                   vizual: {orizontala_dominanta:0.9,albastru_adanc:0.8,reflexii:0.7} },
    'padure':    { implica: {natura:0.9,mister:0.6,liniste:0.7,verde:0.9,umbra:0.7},                        vizual: {verde_dominant:0.9,lumina_filtrata:0.8,adancime:0.7} },
    'casa':      { implica: {siguranta:0.8,caldura:0.7,familie:0.6,intimitate:0.8},                          vizual: {lumina_calda_fereastra:0.8,contrast_interior_exterior:0.7} },
    'oras':      { implica: {energie:0.7,aglomeratie:0.6,lumini:0.7,viteza:0.6},                             vizual: {verticalitate:0.7,lumini_artificiale:0.8,contrast:0.6} },
    'desert':    { implica: {singur:0.8,imens:0.9,tacere:0.8,caldura:0.7,libertate:0.6},                    vizual: {orizontala_dominanta:0.9,galben_portocaliu:0.8,spatiu_negativ:0.7} },
    'camp':      { implica: {libertate:0.8,natura:0.7,liniste:0.6,verde:0.7,vant:0.5},                      vizual: {orizontala_dominanta:0.8,verde_deschis:0.7,cer_dominant:0.6} },
    'stanca':    { implica: {forta:0.8,permanent:0.7,singur:0.5,pericol:0.4},                               vizual: {gri_dominant:0.8,textura:0.7,verticalitate:0.6} },

    // OBIECTE CU SEMNIFICAȚIE
    'foc':       { implica: {caldura:0.9,pericol:0.5,intimitate:0.6,viata:0.7,lumina:0.8},                  vizual: {portocaliu_rosu:0.9,lumina_pulsatila:0.8,intuneric_fundal:0.7} },
    'luna':      { implica: {noapte:0.8,romantism:0.7,mister:0.6,singur:0.4,frumusete:0.7},                 vizual: {albastru_argintiu:0.9,lumina_difuza:0.7,intuneric_fundal:0.8} },
    'stele':     { implica: {noapte:0.9,infinit:0.7,speranta:0.6,mister:0.5},                               vizual: {puncte_luminoase:0.9,intuneric_profund:0.8,albastru_negru:0.9} },
    'fereastra': { implica: {asteptare:0.7,melancolie:0.6,granita:0.8,lumina:0.6},                           vizual: {lumina_din_interior:0.8,contrast_interior_exterior:0.9} },
    'tren':      { implica: {calatorie:0.9,despartire:0.7,miscare:0.8,melancolie:0.5},                      vizual: {linii_orizontale:0.8,miscare_blur:0.7,perspectiva:0.7} },
    'carte':     { implica: {cunoastere:0.8,liniste:0.7,interior:0.6,timp:0.5},                             vizual: {lumina_calda:0.7,detaliu:0.6} },
  };

  // Reguli de inferență combinată — dacă A și B împreună, deduce C
  var HIN_RULES = [
    { if:['trist','ninge'],       then:'vulnerabilitate',    w:0.9 },
    { if:['furios','casa'],       then:'conflict_interior',  w:0.8 },
    { if:['batran','frig'],       then:'vulnerabilitate',    w:0.85 },
    { if:['batran','ninge'],      then:'pericol',            w:0.7 },
    { if:['copil','soare'],       then:'bucurie_pura',       w:0.9 },
    { if:['singur','noapte'],     then:'melancolie_profunda',w:0.85 },
    { if:['furtuna','om'],        then:'drama',              w:0.8 },
    { if:['apus','singur'],       then:'melancolie',         w:0.85 },
    { if:['noapte','foc'],        then:'intimitate_calda',   w:0.8 },
    { if:['munte','ceata'],       then:'mister_grandios',    w:0.85 },
    { if:['ploaie','fereastra'],  then:'melancolie_calda',   w:0.8 },
    { if:['copil','ploaie'],      then:'joc_inocent',        w:0.75 },
    { if:['batran','apus'],       then:'sfarsit_nobil',      w:0.8 },
    { if:['linistit','natura'],   then:'pace_profunda',      w:0.9 },
    { if:['furios','noapte'],     then:'tensiune_maxima',    w:0.85 },
    { if:['singur','desert'],     then:'izolare_absoluta',   w:0.9 },
    { if:['luna','mare'],         then:'romantism_profund',  w:0.85 },
    { if:['foc','noapte'],        then:'caldura_in_intuneric',w:0.8 },
    { if:['tren','apus'],         then:'despartire_frumoasa',w:0.8 },
    { if:['copil','padure'],      then:'aventura_inocenta',  w:0.8 },
    { if:['batran','carte'],      then:'intelepciune_linistita',w:0.85},
    { if:['furtuna','casa'],      then:'adapost_in_furtuna', w:0.8 },
    { if:['om','stanca'],         then:'rezistenta',         w:0.75 },
  ];

  // Ponderi dinamice — modificate de HiD (Dopamina)
  var _hinWeights = {};
  try { _hinWeights = JSON.parse(localStorage.getItem('vv_animus_weights') || '{}'); } catch(e){}

  function hinInfer(entities) {
    var result = { concepts: {}, visual: {} };

    entities.forEach(function(e) {
      var key = norm(e);
      var node = HIN_BASE[key];
      if (!node) return;
      var boost = _hinWeights[key] || 1.0;
      Object.keys(node.implica || {}).forEach(function(k) {
        result.concepts[k] = Math.max(result.concepts[k] || 0, node.implica[k] * boost);
      });
      Object.keys(node.vizual || {}).forEach(function(k) {
        result.visual[k] = Math.max(result.visual[k] || 0, node.vizual[k] * boost);
      });
    });

    HIN_RULES.forEach(function(rule) {
      var match = rule.if.every(function(req) {
        return entities.some(function(e) { return norm(e) === norm(req); });
      });
      if (match) result.concepts[rule.then] = Math.max(result.concepts[rule.then] || 0, rule.w);
    });

    return result;
  }

  // ════════════════════════════════════════════════════════
  // HiM — Hibrid Inteligent Memorie
  // Hipocampul digital: context și memorie de scurtă durată
  // ════════════════════════════════════════════════════════

  var _him = {
    scena_curenta: { subiecte: [], emotie: 'neutru', vreme: null, moment: null },
    conversatie:   [],
    profil:        { frecventa: {}, evita: [] }
  };

  try {
    var _savedMem = localStorage.getItem('vv_animus_memory');
    if (_savedMem) _him = JSON.parse(_savedMem);
  } catch(e) {}

  function himSave() {
    try { localStorage.setItem('vv_animus_memory', JSON.stringify(_him)); } catch(e) {}
  }

  function himUpdate(text, result) {
    _him.conversatie.push({
      text: text, type: result.type, tone: result.tone, t: Date.now()
    });
    if (_him.conversatie.length > 12) _him.conversatie.shift();

    if (result.type === 'scena' || result.type === 'creativ') {
      var VREME_WORDS = ['ninge','ploaie','soare','furtuna','ceata','vant','caldura'];
      var MOMENT_WORDS = ['noapte','dimineata','apus','amiaza'];
      result.entities.forEach(function(e) {
        if (_him.scena_curenta.subiecte.indexOf(e) === -1) _him.scena_curenta.subiecte.push(e);
        _him.profil.frecventa[e] = (_him.profil.frecventa[e] || 0) + 1;
        if (VREME_WORDS.indexOf(norm(e)) !== -1) _him.scena_curenta.vreme = e;
        if (MOMENT_WORDS.indexOf(norm(e)) !== -1) _him.scena_curenta.moment = e;
      });
      if (result.tone && result.tone !== 'neutru') _him.scena_curenta.emotie = result.tone;
    }
    himSave();
  }

  function himContext() {
    return {
      scena:      _him.scena_curenta,
      ultimele:   _him.conversatie.slice(-3),
      preferinte: Object.keys(_him.profil.frecventa).sort(function(a, b) {
        return (_him.profil.frecventa[b] || 0) - (_him.profil.frecventa[a] || 0);
      }).slice(0, 5)
    };
  }

  // ════════════════════════════════════════════════════════
  // HiE — Hibrid Inteligent Emotio
  // Amigdala digitală: detector emoțional rapid
  // ════════════════════════════════════════════════════════

  var HIE_TONES = {
    trist:    ['trist','tristete','suparat','plans','lacrimi','singur','izolat','abandonat','pierdut','distrus','rupt','deprimat','durere','suferinta'],
    furios:   ['furios','furie','nervos','enervat','agresiv','iritat','suparat foc','turba'],
    bucuros:  ['bucuros','fericit','vesel','incantat','entuziasmat','minunat','magic','incredibil','fericireadevarat','jubilat'],
    speriat:  ['speriat','frica','anxios','ingrijorat','panica','groaza','teroare','nesigur'],
    linistit: ['linistit','calm','relaxat','pace','multumit','senin','in regula','ok','bine'],
    obosit:   ['obosit','epuizat','adormit','fara energie','nu mai pot','greu'],
    nostalgic:['nostalgic','imi amintesc','mi-a fost dor','pe vremuri','de demult','amintiri'],
  };

  function hieDetect(text) {
    var n = norm(text);
    var scores = {};
    Object.keys(HIE_TONES).forEach(function(tone) {
      scores[tone] = 0;
      HIE_TONES[tone].forEach(function(w) {
        if (n.indexOf(norm(w)) !== -1) scores[tone] += 1;
      });
    });
    var maxTone = 'neutru', maxScore = 0;
    Object.keys(scores).forEach(function(t) {
      if (scores[t] > maxScore) { maxScore = scores[t]; maxTone = t; }
    });
    return { tone: maxTone, intensity: Math.min(1, maxScore * 0.4) };
  }

  // ════════════════════════════════════════════════════════
  // HiK — Hibrid Inteligent Knowing
  // KB Personal: Lea ține minte ce îi spui permanent
  // ════════════════════════════════════════════════════════

  var _kb = {};
  try { _kb = JSON.parse(localStorage.getItem('vv_animus_kb') || '{}'); } catch(e) {}

  function kbSave(key, value) {
    _kb[key] = { val: value, t: Date.now() };
    try { localStorage.setItem('vv_animus_kb', JSON.stringify(_kb)); } catch(e) {}
  }

  function kbGet() { return _kb; }

  function kbForget(key) {
    delete _kb[key];
    try { localStorage.setItem('vv_animus_kb', JSON.stringify(_kb)); } catch(e) {}
  }

  // Tipare de detectat ce trebuie reținut
  var HIK_PATTERNS = [
    { rx: /ma cheama\s+(\w+)/i,              key: 'nume',        fmt: function(m){ return m[1]; } },
    { rx: /am\s+(\d+)\s+ani/i,               key: 'varsta',      fmt: function(m){ return m[1] + ' ani'; } },
    { rx: /lucrez\s+(?:la|ca|in)\s+(.+)/i,   key: 'job',         fmt: function(m){ return m[1].trim(); } },
    { rx: /locuiesc\s+(?:in|la)\s+(.+)/i,    key: 'oras',        fmt: function(m){ return m[1].trim(); } },
    { rx: /imi place\s+(.+)/i,               key: null,          fmt: function(m){ return m[1].trim(); }, category: 'place' },
    { rx: /nu imi place\s+(.+)/i,            key: null,          fmt: function(m){ return m[1].trim(); }, category: 'nu_place' },
    { rx: /retine\s+(?:ca\s+)?(.+)/i,        key: null,          fmt: function(m){ return m[1].trim(); }, category: 'nota' },
    { rx: /tine minte\s+(?:ca\s+)?(.+)/i,    key: null,          fmt: function(m){ return m[1].trim(); }, category: 'nota' },
    { rx: /sa stii\s+(?:ca\s+)?(.+)/i,       key: null,          fmt: function(m){ return m[1].trim(); }, category: 'nota' },
    { rx: /noteaza\s+(?:ca\s+)?(.+)/i,       key: null,          fmt: function(m){ return m[1].trim(); }, category: 'nota' },
  ];

  function hikDetect(text) {
    var n = text.toLowerCase()
      .replace(/ă/g,'a').replace(/â/g,'a').replace(/î/g,'i')
      .replace(/ș/g,'s').replace(/ş/g,'s').replace(/ț/g,'t').replace(/ţ/g,'t');

    for (var i = 0; i < HIK_PATTERNS.length; i++) {
      var p = HIK_PATTERNS[i];
      var m = n.match(p.rx);
      if (m) {
        var val = p.fmt(m);
        var key = p.key;
        if (!key) {
          key = (p.category || 'nota') + '_' + Date.now();
        }
        return { key: key, val: val, category: p.category || key, raw: m[0] };
      }
    }
    return null;
  }

  function hikResponse(detected) {
    var cat = detected.category || detected.key;
    if (cat === 'nume')     return 'Am reținut. Te cheamă ' + detected.val + '.';
    if (cat === 'varsta')   return 'Notat. ' + detected.val + '.';
    if (cat === 'job')      return 'Reținut — ' + detected.val + '.';
    if (cat === 'oras')     return 'Știu acum. ' + detected.val + '.';
    if (cat === 'place')    return 'Am notat că îți place ' + detected.val + '.';
    if (cat === 'nu_place') return 'Am notat. Evit ' + detected.val + '.';
    return 'Am reținut: ' + detected.val + '.';
  }

  // ════════════════════════════════════════════════════════
  // HiD — Hibrid Inteligent Dopamina
  // Feedback: Lea se îmbunătățește din reacțiile tale
  // ════════════════════════════════════════════════════════

  var HID_POS = ['perfect','exact','imi place','superb','bravo','asa da','minunat','wow','boom','e bine','e corect','mai asa','chiar asa','exact asta'];
  var HID_NEG = ['nu imi place','nu e bine','nu asa','nu vreau asta','mai incearca','gresit','schimba totul','nu e corect','nu ma reprezinta'];

  var _lastEntities = [];

  function hidDetect(text) {
    var n = norm(text);
    var pos = HID_POS.some(function(w){ return n.indexOf(norm(w)) !== -1; });
    var neg = HID_NEG.some(function(w){ return n.indexOf(norm(w)) !== -1; });
    if (pos && !neg) return 'pozitiv';
    if (neg && !pos) return 'negativ';
    return null;
  }

  function hidApply(isPositive) {
    var delta = isPositive ? 0.08 : -0.06;
    _lastEntities.forEach(function(e) {
      var k = norm(e);
      _hinWeights[k] = Math.max(0.1, Math.min(2.0, (_hinWeights[k] || 1.0) + delta));
    });
    try { localStorage.setItem('vv_animus_weights', JSON.stringify(_hinWeights)); } catch(e) {}
    return isPositive
      ? 'Bine notat. Fac mai mult din asta.'
      : 'Înțeles. Ajustez pentru data viitoare.';
  }

  // ════════════════════════════════════════════════════════
  // EXTRACTOR — entități din text
  // ════════════════════════════════════════════════════════

  var ALL_KNOWN = Object.keys(HIN_BASE);

  var STOP_WORDS = [
    'un','o','si','cu','la','de','in','pe','ca','sa','se','ma','mi',
    'ai','au','al','ale','cel','cea','cei','care','dar','sau','din',
    'spre','sub','langa','prin','pentru','dupa','inainte','tot','toate',
    'este','esti','eram','era','sunt','suntem','sunteti','vor','voi',
    'vom','vrea','vrei','avem','ati','lor','lui','ei','ele','ele'
  ];

  function extractEntities(text) {
    var n = norm(text);
    var found = [];

    ALL_KNOWN.forEach(function(concept) {
      if (n.indexOf(norm(concept)) !== -1) {
        if (found.indexOf(concept) === -1) found.push(concept);
      }
    });

    // adaugă cuvinte necunoscute relevante (substanțiale)
    n.split(/\s+/).forEach(function(w) {
      if (w.length > 3 && STOP_WORDS.indexOf(w) === -1 && found.indexOf(w) === -1) {
        found.push(w);
      }
    });

    return found;
  }

  // ════════════════════════════════════════════════════════
  // GENERARE RĂSPUNS — ce spune Lea
  // ════════════════════════════════════════════════════════

  var RASPUNSURI_EMOTIE = {
    trist:    ['Aud că ești trist. Rămân lângă tine.', 'Te ascult. Nu trebuie să spui mai mult.', 'Sunt aici.'],
    furios:   ['Înțeleg. Lasă energia asta să devină ceva.', 'Furia ta are putere. O transform.', 'Simt tensiunea. O pun în scenă.'],
    bucuros:  ['Energia ta e vizibilă. Hai să construim din ea.', 'Bucuria asta merită o scenă pe măsură.', 'Excelent. Îți urmez ritmul.'],
    speriat:  ['Sunt lângă tine. Nimic nu se poate întâmpla.', 'Înțeleg. O să fie bine.'],
    linistit: ['Pace. Construim din liniștea asta.', 'Bine. Mergem lin.'],
    obosit:   ['Înțeleg. O scenă liniștită?', 'Puțin calm nu strică.'],
    nostalgic:['Amintirile au o lumină aparte. O capturez.', 'Nostalgia e o sursă frumoasă.'],
  };

  var RASPUNSURI_ATMOSFERA = {
    vulnerabilitate:       'Fragilitate vizibilă. Scenă cu greutate reală.',
    tensiune_maxima:       'Tensiune la maxim. Scena respiră greu.',
    melancolie_profunda:   'Adânc și tăcut. Melancolie curată.',
    bucurie_pura:          'Luminos. Energie vie și curată.',
    drama:                 'Dramatică. Contrast puternic.',
    pace_profunda:         'Liniște profundă. Spațiu larg.',
    conflict_interior:     'Conflict intern vizibil. Scena se simte.',
    mister_grandios:       'Mister și grandoare în același timp.',
    melancolie:            'Melancolie subtilă. Ton cald-rece.',
    pericol:               'Tensiune latentă. Ceva urmează.',
    intimitate_calda:      'Căldură intimă în întuneric.',
    izolare_absoluta:      'Singurătate absolută. Spațiu imens.',
    romantism_profund:     'Romantic și profund. Lumina lunii.',
    despartire_frumoasa:   'Tristețe frumoasă. Plecare cu demnitate.',
    aventura_inocenta:     'Aventură curată. Curiozitate vie.',
    intelepciune_linistita:'Calm și înțelepciune. Timp stătut.',
    adapost_in_furtuna:    'Contrast puternic: furtună afară, căldură înăuntru.',
    rezistenta:            'Forță în adversitate. Scena ține.',
    sfarsit_nobil:         'Finaluri frumoase au lumina lor.',
    caldura_in_intuneric:  'Lumina focului în beznă. Contrastul perfect.',
    joc_inocent:           'Copilărie pură. Ploaia nu e tristă pentru ei.',
  };

  var SALUTARI = [
    'Bună. Sunt aici.', 'Salut. Ce construim azi?', 'Bună ziua. Gata.', 'Bună seara. Ce ai în minte?', 'Prezent.'
  ];

  var IDENTITATE = [
    'Sunt Lea — creierul VV Hybrid Universe. Nu sunt un chatbot. Sunt un sistem de inteligență personală care trăiește pe dispozitivul tău, înțelege românește și crește cu tine.',
    'Mă cheamă Lea. Fac parte din ecosistemul VV — un creier local, al tău, care nu trimite nimic nicăieri. Cu cât vorbim mai mult, cu atât te înțeleg mai bine.',
    'Lea — Hibrid Inteligent. Înțeleg ce simți, ce vrei să construiești, și țin minte. Datele tale rămân la tine.'
  ];

  function generateResponse(result) {
    if (result.type === 'identitate') return IDENTITATE[Math.floor(Math.random() * IDENTITATE.length)];
    if (result.type === 'salut')     return SALUTARI[Math.floor(Math.random() * SALUTARI.length)];
    if (result.type === 'intrebare') return 'Te ascult. Ce vrei să știi?';
    if (result.type === 'comanda')   return 'Execut.';

    if (result.type === 'emotie') {
      var arr = RASPUNSURI_EMOTIE[result.tone];
      if (arr) return arr[Math.floor(Math.random() * arr.length)];
      return 'Te ascult.';
    }

    // Scenă sau creativ
    var topConcepts = Object.keys(result.inferred.concepts).sort(function(a, b) {
      return result.inferred.concepts[b] - result.inferred.concepts[a];
    });

    for (var i = 0; i < topConcepts.length; i++) {
      if (RASPUNSURI_ATMOSFERA[topConcepts[i]]) return RASPUNSURI_ATMOSFERA[topConcepts[i]];
    }

    var toneResp = {
      trist:    'Scenă tristă. Culori reci, lumină slabă.',
      furios:   'Scenă tensionată. Roșu și contrast.',
      bucuros:  'Scenă luminoasă. Culori calde, energie.',
      speriat:  'Scenă apăsătoare. Întuneric și izolare.',
      linistit: 'Scenă calmă. Spațiu și respirație.',
    };
    if (result.tone !== 'neutru' && toneResp[result.tone]) return toneResp[result.tone];

    return 'Înțeleg. Construiesc.';
  }

  // ════════════════════════════════════════════════════════
  // API PUBLIC — window.Lea.think(text)
  // Orice aplicație VV apelează asta și primește tot.
  // ════════════════════════════════════════════════════════

  function think(text) {
    if (!text || !text.trim()) return null;

    // 1. HiK — e ceva de reținut permanent?
    var kbDetected = hikDetect(text);
    if (kbDetected) {
      kbSave(kbDetected.key, kbDetected.val);
      return {
        type: 'memorie', tone: 'neutru', intensity: 0,
        entities: [], inferred: { concepts: {}, visual: {} },
        context: himContext(), response: hikResponse(kbDetected),
        kb: kbDetected
      };
    }

    // 2. HiT — clasifică intenția PRIMUL (înainte de feedback)
    var intent = hitClassify(text);

    // 3. HiE — emoție rapidă
    var emotion = hieDetect(text);

    // 4. HiD — e feedback? (doar dacă NU e scenă/comandă clară)
    var fb = (intent.confidence < 0.5) ? hidDetect(text) : null;
    if (fb) {
      return {
        type:     'feedback',
        tone:     emotion.tone,
        intensity:emotion.intensity,
        entities: [],
        inferred: { concepts: {}, visual: {} },
        context:  himContext(),
        response: hidApply(fb === 'pozitiv'),
        feedback: fb
      };
    }

    // 4. Extrage entitățile
    var entities = extractEntities(text);
    _lastEntities = entities;

    // 5. HiN — inferează relații și vizual
    var inferred = hinInfer(entities);

    // 6. Ton final — din emoție directă sau din inferență
    var finalTone = emotion.tone !== 'neutru' ? emotion.tone :
      (inferred.concepts['tristete']  > 0.5 ? 'trist'    :
       inferred.concepts['bucurie']   > 0.5 ? 'bucuros'  :
       inferred.concepts['tensiune']  > 0.5 ? 'furios'   :
       inferred.concepts['pericol']   > 0.5 ? 'speriat'  :
       inferred.concepts['pace']      > 0.5 ? 'linistit' : 'neutru');

    var result = {
      type:       intent.type,
      confidence: intent.confidence,
      tone:       finalTone,
      intensity:  emotion.intensity,
      entities:   entities,
      inferred:   inferred,
      context:    himContext(),
      response:   ''
    };

    result.response = generateResponse(result);

    // 7. HiM — actualizează memoria
    himUpdate(text, result);

    return result;
  }

  // ════════════════════════════════════════════════════════
  // API SECUNDAR — control manual
  // ════════════════════════════════════════════════════════

  function feedback(isPositive) {
    return hidApply(isPositive);
  }

  function getMemory() {
    return himContext();
  }

  function clearMemory() {
    _him = {
      scena_curenta: { subiecte: [], emotie: 'neutru', vreme: null, moment: null },
      conversatie:   [],
      profil:        { frecventa: {}, evita: [] }
    };
    himSave();
  }

  function resetWeights() {
    _hinWeights = {};
    try { localStorage.removeItem('vv_animus_weights'); } catch(e) {}
  }

  // ════════════════════════════════════════════════════════
  // EXPORT
  // ════════════════════════════════════════════════════════

  return {
    // API principal
    think:        think,
    feedback:     feedback,
    // Memorie
    getMemory:    getMemory,
    clearMemory:  clearMemory,
    resetWeights: resetWeights,
    // KB Personal
    getKB:        kbGet,
    kbForget:     kbForget,
    // Acces direct la module (pentru debugging și extensii)
    _hit: hitClassify,
    _hin: hinInfer,
    _hie: hieDetect,
    _him: himContext,
    _extract: extractEntities
  };

})();

// Creierul central — disponibil global pentru orice aplicație VV
window.Lea    = VVAnimus;
window.VVAnimus = VVAnimus;

console.log('[VV ANIMUS] Creierul Lea activ — HiT + HiN + HiM + HiE + HiD');
