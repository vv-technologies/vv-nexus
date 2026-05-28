// VV LEA — Motor VVBL v3.0
// Cosmin Toma / VV Hybrid Universe
// Conectat la ANIMUS: HiT + HiM + HiK + HiC + Alexandria + VV Speech

// ══════════════════════════════
// ALEXANDRIA — din alexandria-data.js (zero server)
// ══════════════════════════════
var ALEXANDRIA = (typeof ALEXANDRIA_DATA !== 'undefined') ? ALEXANDRIA_DATA : [];

// Index invers: cuvinte simple → hash O(1), fraze → array mic O(m)
var _alexWordMap  = {}; // cuvant_simplu_norm → [pattern, ...]
var _alexPhrases  = []; // [{key, keyLen, pattern}] — doar fraze (cu spatiu/cratima)

function leaBuildAlexIdx() {
  _alexWordMap = {};
  _alexPhrases = [];
  for (var i = 0; i < ALEXANDRIA.length; i++) {
    var p = ALEXANDRIA[i];
    if (!p.cuvant) continue;
    var key = (typeof leaNormDiac === 'function')
      ? leaNormDiac(p.cuvant.toLowerCase().trim())
      : p.cuvant.toLowerCase().trim();
    if (key.indexOf(' ') === -1) {
      // Cuvant simplu → hash
      if (!_alexWordMap[key]) _alexWordMap[key] = [];
      _alexWordMap[key].push(p);
    } else {
      // Fraza → array mic pentru substring scan
      _alexPhrases.push({ key: key, keyLen: key.length, pattern: p });
    }
  }
  _alexPhrases.sort(function(a, b) { return b.keyLen - a.keyLen; });
}
leaBuildAlexIdx();

async function leaMotorInit() {
  if (ALEXANDRIA.length > 0) {
    console.log('[LEA Motor] Alexandria embedded:', ALEXANDRIA.length, 'tipare. Pornit.');
  } else {
    console.warn('[LEA Motor] alexandria-data.js lipseste!');
  }
}

function leaGetPattern(alexandriaId) {
  return ALEXANDRIA.find(e => e.id === alexandriaId) || null;
}

// ══════════════════════════════
// HiC — Timp si zi (zero tracking, doar ceas local)
// ══════════════════════════════
function leaTimeContext() {
  var now  = new Date();
  var ora  = now.getHours();
  var zi   = now.getDay(); // 0=dum, 1=lun ... 6=sam

  return {
    ora,
    isNoapte:    ora >= 23 || ora < 5,
    isDimineata: ora >= 5  && ora < 10,
    isSeara:     ora >= 20 && ora < 23,
    isLuni:      zi === 1,
    isVineri:    zi === 5,
    isWeekend:   zi === 0 || zi === 6
  };
}

// ══════════════════════════════
// INIMA — fir emotional activ, sesiune curenta
// ══════════════════════════════

var _leaInima = {
  emotii:   [],   // [{c: comportament}] — max 12
  msgCount: 0
};

var _POZITIVE = ['bucurie','liniste','speranta','mandrie','dragoste','recunostinta','curiozitate'];
var _NEGATIVE = ['tristete_profunda','oboseala','anxietate','singuratate','disperare','furie','frustrare'];

function leaTrackEmotion(c) {
  if (!c || c === 'necunoscut' || c === 'chat' || c === 'criza') return;
  _leaInima.emotii.push({ c: c });
  if (_leaInima.emotii.length > 12) _leaInima.emotii.shift();
  _leaInima.msgCount++;
}

function leaCountEmotion(c) {
  return _leaInima.emotii.filter(function(e) { return e.c === c; }).length;
}

function leaDetectShift() {
  var e = _leaInima.emotii;
  if (e.length < 3) return null;
  var last = e[e.length - 1].c;
  var prev = e.slice(-4, -1).map(function(x) { return x.c; });
  var lastPos  = _POZITIVE.includes(last);
  var lastNeg  = _NEGATIVE.includes(last);
  var prevNeg  = prev.some(function(x) { return _NEGATIVE.includes(x); });
  var prevPos  = prev.some(function(x) { return _POZITIVE.includes(x); });
  if (lastPos && prevNeg) return 'mai_bine';
  if (lastNeg && prevPos) return 'mai_greu';
  return null;
}

// Intrebare din ce stie Lea despre tine — KB + Profil structurat
function leaPersonalQuestion(comportament, kb) {
  if (_leaUltimaCuriozitate) return null;
  if (Math.random() > 0.42) return null;

  var job  = (kb && kb['job']  && kb['job'].val)  ? kb['job'].val  : null;
  var oras = (kb && kb['oras'] && kb['oras'].val) ? kb['oras'].val : null;

  // Context din rafturi structurate
  var pc = (window.VVProfile) ? VVProfile.getContext() : {};
  var jobFull = job || pc.job || null;
  var arePartener = pc.arePartener;
  var areCopii    = pc.areCopii;
  var sport       = pc.sport;

  var qMap = {
    oboseala: [
      jobFull  ? 'E de la ' + jobFull + '?'   : 'E de la muncă?',
      areCopii ? 'Sau copiii te epuizează?'    : 'Ai dormit bine?',
      'De când ești așa?'
    ],
    tristete_profunda: [
      arePartener ? 'E ceva și cu ' + (pc.rolPartener || 'partenerul/partenera') + '?' : 'Ai cu cine vorbi despre asta?',
      'E ceva concret sau e în general?',
      'De când e greu?'
    ],
    anxietate: [
      jobFull  ? 'E legat de ' + jobFull + '?'   : 'Ce te apasă concret?',
      'E ceva care urmează și te stresează?',
      'Când a început?'
    ],
    singuratate: [
      arePartener ? 'Și cu ' + (pc.numePartener || pc.rolPartener || 'partenerul/partenera') + ' cum e?' : 'Ești singur fizic sau e altceva?',
      oras        ? 'Ești în ' + oras + ' acum?'  : 'Unde ești?',
      'E de mult?'
    ],
    furie: [
      jobFull  ? 'S-a întâmplat ceva la ' + jobFull + '?'  : 'Ce a declanșat asta?',
      arePartener ? 'E ceva cu ' + (pc.numePartener || pc.rolPartener || 'partenerul/partenera') + '?' : 'Față de cine?',
      'Ce ai vrea să faci acum?'
    ],
    frustrare: [
      'Ce nu merge?',
      jobFull  ? 'E ceva la ' + jobFull + '?'   : 'E ceva concret?',
      sport    ? 'Ai mai reușit să faci ' + sport + ' în zilele astea?' : 'De cât timp e blocat?'
    ],
    oboseala_context: [
      areCopii ? 'Copiii te solicită mult?' : null,
      jobFull  ? 'E săptămână grea la ' + jobFull + '?' : null
    ].filter(Boolean)
  };

  var pool = qMap[comportament];
  if (!pool || pool.length === 0) return null;
  return pool[Math.floor(Math.random() * pool.length)];
}

// Observatie cand un tipar emerge — LEA numeste ce vede
function leaObservaPattern(comportamentNume, kb) {
  var count = leaCountEmotion(comportamentNume);
  var shift = leaDetectShift();
  var numePers = (kb && kb['nume'] && kb['nume'].val)
    ? kb['nume'].val.charAt(0).toUpperCase() + kb['nume'].val.slice(1)
    : '';

  // Schimbare emotionala → LEA o vede
  if (shift === 'mai_bine') {
    return numePers ? numePers + ', ești altfel acum.' : 'Ești altfel acum.';
  }
  if (shift === 'mai_greu') {
    return 'S-a schimbat ceva.';
  }

  // Aceeasi emotie de 3 ori in sesiune → LEA numeste asta
  if (count === 3) {
    var obs = {
      oboseala:          numePers ? numePers + ', ești obosit de ceva timp.' : 'Ești obosit de ceva timp.',
      tristete_profunda: 'E greu de mai mult timp.',
      anxietate:         'Tensiunea asta revine.',
      singuratate:       'Singurătatea asta e prezentă.',
      furie:             'E multă energie în asta.',
      frustrare:         'Ceva te ține blocat.'
    };
    return obs[comportamentNume] || null;
  }

  return null;
}

// ══════════════════════════════
// ANALIZA INPUT — Alexandria lookup
// ══════════════════════════════
function leaAnalyze(text) {
  var t  = text.toLowerCase().trim();
  var tN = (typeof leaNormDiac === 'function') ? leaNormDiac(t) : t;
  var limba = leaDetectLang(t);
  var allIds = leaLookupAll(t);

  var chatIds = allIds.filter(function(id) { return id.startsWith('CHAT_'); });
  var seen    = {};
  var matches = [];

  // 1. Dict manual — IDs vechi (e001 etc.) + CHAT_
  var dictAlexIds = allIds.filter(function(id) { return !id.startsWith('CHAT_'); });
  for (var i = 0; i < dictAlexIds.length; i++) {
    var p = leaGetPattern(dictAlexIds[i]);
    if (p && !seen[p.id]) { seen[p.id] = true; matches.push(p); }
  }

  // 2a. Cuvinte simple din input → hash lookup O(1)
  var inputWords = tN.split(/[\s\-.,!?;:]+/).filter(function(w) { return w.length > 1; });
  for (var wi = 0; wi < inputWords.length && matches.length < 6; wi++) {
    var wPatterns = _alexWordMap[inputWords[wi]];
    if (wPatterns) {
      for (var wj = 0; wj < wPatterns.length && matches.length < 6; wj++) {
        var wp = wPatterns[wj];
        if (!seen[wp.id]) { seen[wp.id] = true; matches.push(wp); }
      }
    }
  }

  // 2b. Fraze compuse → scan array mic (~200 intrari)
  for (var j = 0; j < _alexPhrases.length && matches.length < 6; j++) {
    var entry = _alexPhrases[j];
    if (tN.includes(entry.key) && !seen[entry.pattern.id]) {
      seen[entry.pattern.id] = true;
      matches.push(entry.pattern);
    }
  }

  if (matches.length === 0) {
    if (chatIds.length > 0) return { tip: 'chat', chatId: chatIds[0], limba };
    return null;
  }

  var combined = leaCombinePatterns(matches);
  combined.tip    = 'alex';
  combined.limba  = limba;
  combined.matches = matches.map(function(m) { return m.cuvant; });
  return combined;
}

// ══════════════════════════════
// COMBINATOR
// ══════════════════════════════
function leaCombinePatterns(patterns) {
  const allTags = {};
  patterns.forEach(p => {
    p.his.forEach(tag => { allTags[tag] = (allTags[tag] || 0) + 1; });
  });
  const his = Object.entries(allTags)
    .sort((a,b) => b[1]-a[1]).slice(0,5).map(e => e[0]);
  const n = patterns.length;
  const hiq = {
    intensitate: patterns.reduce((s,p) => s + p.hiq.intensitate, 0) / n,
    durata:      patterns.reduce((s,p) => s + p.hiq.durata, 0) / n,
    social:      patterns.reduce((s,p) => s + p.hiq.social, 0) / n,
    vizibil:     patterns.reduce((s,p) => s + p.hiq.vizibil, 0) / n
  };
  return { his, hiq };
}

// ══════════════════════════════
// PROGRESIE — cat de adanc suntem in conversatie pe aceeasi emotie
// Foloseste HiM din ANIMUS
// ══════════════════════════════
function leaConversationDepth(animusResult, analysis) {
  if (!animusResult || !animusResult.context || !animusResult.context.ultimele) return 1;
  var ultimele = animusResult.context.ultimele;
  if (ultimele.length < 2) return 1;

  // numara cate mesaje recente au acelasi ton emotional
  var tone = animusResult.tone || 'neutru';
  if (tone === 'neutru') return 1;

  var count = 0;
  for (var i = ultimele.length - 1; i >= 0; i--) {
    var m = ultimele[i];
    if (m.tone === tone) count++;
    else break;
  }
  return Math.min(count + 1, 4); // max nivel 4
}

// ══════════════════════════════
// INTREBARI PROFUNDE — pentru nivel 3+
// ══════════════════════════════
const VV_DEEP = [
  "De când e așa?",
  "Ce a declanșat asta?",
  "Ai mai trecut prin asta?",
  "Ce ai nevoie acum, concret?",
  "Există cineva care știe prin ce treci?",
  "La ce te duce gândul?",
  "Cum ai vrea să fie?",
  "Îți e frică de ceva anume?",
  "Ce nu ai putut spune nimănui?"
];

// ══════════════════════════════
// CURIOZITATE — LEA intreaba organic, salveaza silent
// Userul nu vede "am notat" — LEA pur si simplu stie mai tarziu
// ══════════════════════════════
var _leaUltimaCuriozitate = null; // { tip, emotie } — ce a intrebat LEA ultima oara
var _leaUltimTopic = null; // { tip: 'job'|'oras'|'varsta'|'nume', val } — ultimul subiect discutat

// ── Context intra-sesiune — ce emoție și subiect a avut ultimul mesaj emotional ──
var _sessionCtx = {
  emotie:   null,  // 'tristete_profunda', 'bucurie', etc.
  subiect:  null,  // 'job', 'familie', 'sanatate', 'relatie', etc.
  msgCount: 0      // mesaje de la ultima actualizare
};

var _SUBIECTE = {
  job:      /\b(job|munca|muncă|serviciu|șef|sef|proiect|echipa|echipă|birou|coleg|salar|promov)/i,
  familie:  /\b(soție|sotie|soț|sot|iubita|iubită|iubit|partener|copil|mama|tata|frate|sora|parinte|bunic)/i,
  sanatate: /\b(sanatate|sănătate|doctor|boala|boală|durere|doare|obosit|oboseala|oboseală|medic|spital)/i,
  relatie:  /\b(relatie|relație|prieten|prietena|prietenă|despartit|despărțit|singuratate|singur)/i,
  bani:     /\b(bani|datorii|datorie|salar|salari|cheltuieli|factura|factură|credit|imprumut|împrumut)/i
};

function _leaDetectSubiect(text) {
  for (var sub in _SUBIECTE) {
    if (_SUBIECTE[sub].test(text)) return sub;
  }
  return null;
}

function _leaUpdateSessionCtx(emotie, text) {
  var sub = _leaDetectSubiect(text);
  if (emotie && emotie !== 'necunoscut') {
    _sessionCtx.emotie  = emotie;
    _sessionCtx.subiect = sub || _sessionCtx.subiect; // pastreaza subiectul anterior daca nu detectam
    _sessionCtx.msgCount = 0;
  } else {
    _sessionCtx.msgCount++;
  }
}

// Daca mesajul e scurt/ambiguu si avem context anterior → returneaza append-ul
function _leaSessionAnchor(text, emotie) {
  if (!_sessionCtx.subiect) return null;
  if (_sessionCtx.msgCount > 4) return null; // contextul e prea vechi
  if (emotie && emotie !== 'necunoscut') return null; // mesaj cu emotie proprie, nu are nevoie
  var tLen = text.trim().length;
  if (tLen > 60) return null; // mesaj lung — are context propriu

  var labeleSub = {
    job:      'job',
    familie:  'familie',
    sanatate: 'sănătate',
    relatie:  'relație',
    bani:     'bani'
  };
  var label = labeleSub[_sessionCtx.subiect];
  if (!label) return null;

  var anchorPool = [
    'tot despre ' + label + '?',
    'e tot legat de ' + label + '?',
    'e din nou ' + label + '?'
  ];
  // Rar — nu la fiecare mesaj ambiguu
  if (Math.random() > 0.45) return null;
  return anchorPool[Math.floor(Math.random() * anchorPool.length)];
}

var VV_CURIOZ = {
  persoana:  ["Cine e?", "Îl/O cunoști de mult?", "E cineva apropiat?"],
  freq:      ["Se întâmplă des?", "E mai nou sau de mai mult timp?", "Prima dată simți asta?"],
  wellbeing: ["Ai dormit bine?", "Ești ok fizic?", "Mănânci bine în perioada asta?"],
  context:   ["Ești singur acum?", "Ești la muncă sau acasă?"],
  general:   ["Cum a fost azi?", "Ce mai e prin viața ta?", "Spune-mi ceva despre tine."]
};

function leaChooseCurioz(ctx, comportament, hiq, depth) {
  // Nu intreaba daca tocmai am intrebat — asteptam raspunsul
  if (_leaUltimaCuriozitate) return null;

  // Persoana mentionata dar necunoscuta → intreaba cine e
  if (ctx.persoana && !ctx.emotiePersoana) {
    var pool = VV_CURIOZ.persoana;
    return { tip: 'persoana', intrebare: pool[Math.floor(Math.random() * pool.length)] };
  }

  // Oboseala → wellbeing (rar, nu la fiecare oboseala)
  if (comportament === 'oboseala' && depth === 1 && Math.random() < 0.4) {
    var pool = VV_CURIOZ.wellbeing;
    return { tip: 'wellbeing', intrebare: pool[Math.floor(Math.random() * pool.length)] };
  }

  // Aceeasi emotie de 2+ ori → frecventa
  if (depth === 2 && hiq.intensitate > 0.5) {
    var pool = VV_CURIOZ.freq;
    return { tip: 'freq', intrebare: pool[Math.floor(Math.random() * pool.length)] };
  }

  // General — rar (1 din 6 mesaje, doar la inceput de conversatie)
  if (depth === 1 && Math.random() < 0.17) {
    var pool = VV_CURIOZ.general;
    return { tip: 'general', intrebare: pool[Math.floor(Math.random() * pool.length)] };
  }

  return null;
}

// ══════════════════════════════
// VVBL — 15 comportamente (pentru culori + compatibilitate)
// ══════════════════════════════
const VVBL = [
  { name: "tristete_profunda",
    when: tags => tags.includes("heavy") && (tags.includes("dark") || tags.includes("dark-blue")) && tags.includes("inside"),
    guard: hiq => hiq.intensitate > 0.6 && hiq.social < 0.3 },
  { name: "bucurie",
    when: tags => tags.includes("light") && tags.includes("open") && tags.includes("warm"),
    guard: hiq => hiq.intensitate > 0.5 && hiq.social > 0.5 },
  { name: "furie",
    when: tags => (tags.includes("hot") || tags.includes("dark-red")) && tags.includes("fast") && tags.includes("sharp"),
    guard: hiq => hiq.intensitate > 0.7 },
  { name: "anxietate",
    when: tags => tags.includes("tense") && tags.includes("vibrating") && tags.includes("inside"),
    guard: hiq => hiq.intensitate > 0.6 && hiq.social < 0.3 },
  { name: "oboseala",
    when: tags => tags.includes("slow") && tags.includes("hollow") && tags.includes("still"),
    guard: hiq => hiq.intensitate < 0.4 && hiq.durata > 0.7 },
  { name: "singuratate",
    when: tags => tags.includes("cold") && tags.includes("hollow") && tags.includes("inside"),
    guard: hiq => hiq.social < 0.2 },
  { name: "curiozitate",
    when: tags => tags.includes("fast") && tags.includes("open") && tags.includes("bright"),
    guard: hiq => hiq.intensitate > 0.4 && hiq.social > 0.4 },
  { name: "speranta",
    when: tags => tags.includes("rising") && tags.includes("warm") && tags.includes("open"),
    guard: hiq => hiq.intensitate > 0.4 },
  { name: "disperare",
    when: tags => tags.includes("heavy") && tags.includes("still") && tags.includes("cold"),
    guard: hiq => hiq.intensitate > 0.8 && hiq.social < 0.2 },
  { name: "liniste",
    when: tags => tags.includes("still") && tags.includes("soft") && tags.includes("cool"),
    guard: hiq => hiq.intensitate < 0.5 },
  { name: "frustrare",
    when: tags => tags.includes("hot") && tags.includes("tense") && tags.includes("closed"),
    guard: hiq => hiq.intensitate > 0.5 },
  { name: "dragoste",
    when: tags => tags.includes("warm") && tags.includes("soft") && tags.includes("golden"),
    guard: hiq => hiq.social > 0.6 },
  { name: "mandrie",
    when: tags => tags.includes("bright") && tags.includes("rising") && tags.includes("strong"),
    guard: hiq => hiq.vizibil > 0.6 },
  { name: "recunostinta",
    when: tags => tags.includes("warm") && tags.includes("still") && tags.includes("open"),
    guard: hiq => hiq.social > 0.5 && hiq.intensitate < 0.7 },
  { name: "necunoscut",
    when: () => true, guard: () => true }
];

function leaGetComportament(his, hiq) {
  for (const b of VVBL) {
    if (b.when(his) && b.guard(hiq)) return b.name;
  }
  return "necunoscut";
}

// ══════════════════════════════
// CRIZA — detectie urgenta, raspunde PRIMUL inaintea oricarui alt sistem
// ══════════════════════════════
// Cuvinte-cheie de criză — doar forme neambigue
var _LEA_CRIZA_KW = [
  'sinucid', 'sinucidere', 'suicid',
  'ma ucid', 'mă ucid',
  'vreau sa mor', 'vreau să mor',
  'nu mai vreau sa traiesc', 'nu mai vreau să trăiesc',
  'adio lume', 'adio tuturor', 'ramas bun pentru totdeauna',
  'ma ranesc', 'mă rănesc',
  'ma tai cu', 'mă tai cu',
  'vreau sa dispar', 'vreau să dispar',
  'nu mai pot trai', 'nu mai pot trăi',
  'iau pastile', 'iau droguri', 'iau medicamente sa',
  'ma sting', 'mă sting',
  'ma sterg din', 'mă șterg din',
  'o sa dispar', 'o să dispar',
  'nu mai exist', 'vreau sa nu mai exist', 'vreau să nu mai exist'
];

// Expresii de umor/entuziasm — dacă apar, NU e criză
var _LEA_NOCRIZA = ['de ras', 'de râs', 'de bucurie', 'de fericire', 'in treaba', 'în treabă', 'de-a dreptul'];

var _LEA_CRIZA_R = [
  "Te aud. Ești în siguranță acum?\n\nRămân cu tine. Spune-mi ce se întâmplă.",
  "Nu plec. Ești acolo?\n\nDacă simți că nu mai poți, vorbește cu cineva acum — 112 sau un om aproape. Eu sunt și eu aici.",
  "Stau cu tine. E greu ce simți.\n\nEști singur acum? Spune-mi.",
  "Te aud. Nu ești singur.\n\nSpune-mi ce se întâmplă — sunt aici. Dacă ai nevoie de ajutor urgent, sună la 112."
];

function leaCrizaCheck(text) {
  if (!text) return null;
  var t = text.toLowerCase();

  // Skip daca textul e clar un context de umor / pozitiv
  for (var j = 0; j < _LEA_NOCRIZA.length; j++) {
    if (t.indexOf(_LEA_NOCRIZA[j]) !== -1) return null;
  }

  for (var i = 0; i < _LEA_CRIZA_KW.length; i++) {
    if (t.indexOf(_LEA_CRIZA_KW[i]) !== -1) {
      return _LEA_CRIZA_R[Math.floor(Math.random() * _LEA_CRIZA_R.length)];
    }
  }
  return null;
}

// ══════════════════════════════
// FALLBACK VARIAT
// ══════════════════════════════
var _lastFallback = "";
function leaFallback(hitType) {
  var opts;
  if (hitType === 'scena' || hitType === 'creativ') {
    opts = ["Interesant.", "Spune mai mult.", "Continuă.", "Hmm."];
  } else {
    opts = [
      "Spune-mi.",
      "Aud.",
      "Hmm. Continuă.",
      "Te ascult.",
      "Spune mai mult.",
      "Și?"
    ];
  }
  var filtered = opts.filter(function(o){ return o !== _lastFallback; });
  var r = filtered[Math.floor(Math.random() * filtered.length)];
  _lastFallback = r;
  return r;
}

// ══════════════════════════════
// PREPROCESSING — colapseaza caractere repetate ("aaaaani" → "ani")
// ══════════════════════════════
function leaCollapseRepeated(text) {
  // 3+ caractere identice consecutive → 1 ("aaaaani"→"ani", "offf"→"of", "baaaa"→"ba")
  return text.replace(/(.)\1{2,}/g, '$1');
}

// ══════════════════════════════
// DISCOVERY — LEA cere voie, intreaba, cunoaste organic
// ══════════════════════════════
var _leaDsc = {
  waitPerm: false,  // asteapta confirmare de la user
  step: null        // 'name'|'job'|'city'|null
};

var _LEA_DSC_STEPS = {
  name: {
    q: 'Cum te cheamă?',
    wrap: function(t) { return 'mă cheamă ' + t.trim(); },
    next: 'job'
  },
  job: {
    q: 'Și unde lucrezi sau ce faci?',
    wrap: function(t) { return 'lucrez în ' + t.trim(); },
    next: 'city'
  },
  city: {
    q: 'Din ce oraș ești?',
    wrap: function(t) { return 'locuiesc în ' + t.trim(); },
    next: null
  },
  varsta: {
    q: 'Câți ani ai?',
    wrap: function(t) { return 'am ' + t.trim().replace(/\s*(ani|de ani).*/i,'') + ' ani'; },
    next: null
  }
};

function leaDscActive()      { return _leaDsc.waitPerm || _leaDsc.step !== null; }
function leaDscNeedsWrap()   { return _leaDsc.step !== null; }
function leaDscWrap(text)    {
  var s = _LEA_DSC_STEPS[_leaDsc.step];
  return s ? s.wrap(text) : null;
}

function leaDscAdvance() {
  var current = _LEA_DSC_STEPS[_leaDsc.step];
  if (!current) { _leaDsc.step = null; return null; }
  var nextKey = current.next;
  _leaDsc.step = nextKey;
  if (nextKey) return _LEA_DSC_STEPS[nextKey].q;
  // Terminat — rezumat cald
  return leaDscComplete();
}

function leaDscComplete() {
  var kb = (window.Lea && Lea.getKB) ? Lea.getKB() : {};
  var cap = function(s) { return s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : s; };
  var capJob = function(s) { return s ? (s.length <= 4 ? s.toUpperCase() : cap(s)) : s; };
  var parts = [];
  if (kb['nume'] && kb['nume'].val) parts.push(cap(kb['nume'].val));
  if (kb['job']  && kb['job'].val)  parts.push(capJob(kb['job'].val));
  if (kb['oras'] && kb['oras'].val) parts.push(cap(kb['oras'].val));
  var rezumat = parts.length > 0 ? parts.join(', ') + '.' : '';
  return 'Gata.' + (rezumat ? ' ' + rezumat : '') + ' Acum te știu puțin. Vom continua să ne cunoaștem cu fiecare conversație.';
}

// ══════════════════════════════
// KB RESPONSE — raspuns personal din ce stie Lea, context-aware
// ══════════════════════════════
function leaBuildKBResponse(chatId, originalText) {
  if (!window.Lea) return null;
  var kb = Lea.getKB();
  if (!kb) return null;

  var cap    = function(s) { return s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : s; };
  var capJob = function(s) { return s ? (s.length <= 4 ? s.toUpperCase() : cap(s)) : s; };
  var t = (originalText || '').toLowerCase();

  // Intrebare specifica — raspunde la ce a intrebat exact
  var isAboutAge  = /ani am|vârsta|varsta|cati ani|câți ani/.test(t);
  var isAboutJob  = /lucrez|job|muncă|munca|ce fac/.test(t);
  var isAboutName = /cum m[aă] cheam[aă]|numele meu/.test(t);
  var isAboutCity = /de unde sunt|oras|oraș|din ce|unde locuiesc|unde stau|unde traies|in ce oras/.test(t);

  if (isAboutAge) {
    _leaUltimTopic = { tip: 'varsta' };
    if (kb['varsta'] && kb['varsta'].val) return 'Ai ' + kb['varsta'].val + '.';
    _leaDsc.step = 'varsta'; _leaDsc.waitPerm = false;
    return 'Nu știu. Câți ani ai?';
  }
  if (isAboutJob) {
    _leaUltimTopic = { tip: 'job' };
    if (kb['job'] && kb['job'].val) return 'Lucrezi în ' + capJob(kb['job'].val) + '.';
    _leaDsc.step = 'job'; _leaDsc.waitPerm = false;
    return 'Nu știu. Unde lucrezi?';
  }
  if (isAboutName) {
    _leaUltimTopic = { tip: 'nume' };
    if (kb['nume'] && kb['nume'].val) return 'Te cheamă ' + cap(kb['nume'].val) + '.';
    _leaDsc.step = 'name'; _leaDsc.waitPerm = false;
    return 'Nu știu. Cum te cheamă?';
  }
  if (isAboutCity) {
    _leaUltimTopic = { tip: 'oras' };
    if (kb['oras'] && kb['oras'].val) return 'Ești din ' + cap(kb['oras'].val) + '.';
    _leaDsc.step = 'city'; _leaDsc.waitPerm = false;
    return 'Nu știu. Din ce oraș ești?';
  }

  // Intrebare generala (cine sunt / ma cunosti)
  var parts = [];
  if (kb['nume']   && kb['nume'].val)   parts.push('Te cheamă ' + cap(kb['nume'].val) + '.');
  if (kb['varsta'] && kb['varsta'].val) parts.push('Ai ' + kb['varsta'].val + '.');
  if (kb['job']    && kb['job'].val)    parts.push('Lucrezi în ' + capJob(kb['job'].val) + '.');
  if (kb['oras']   && kb['oras'].val)   parts.push('Ești din ' + cap(kb['oras'].val) + '.');

  if (parts.length > 0) {
    return parts.join(' ') + ' Spune-mi mai mult dacă vrei să te știu mai bine.';
  }

  // KB e gol — ofera discovery in loc de "nu stiu"
  _leaDsc.waitPerm = true;
  return 'Suntem la început. Îmi permiți să îți pun câteva întrebări ca să te pot cunoaște mai bine?';
}

// ══════════════════════════════════════════════════════════════
// ROUTING ENGINE — clasificare tip mesaj
// ══════════════════════════════════════════════════════════════

// Semnal emotional puternic — daca apare, rutam ca emotional indiferent
var _EMOTIONAL_OVERRIDE = [
  'simt','simte','trist','tristete','tristețe','fericit','ferici',
  'obosit','anxios','anxietate','singuratic','singur','singuratate',
  'furios','furie','frustrat','frustrare','deprimat','depresie',
  'frica','frica','teama','teamă','speriat','dor','doresc',
  'plans','plang','plâng','lacrimi','doare','dor de',
  'nu mai pot','nu pot','e greu','greu de','ma doare','mă doare',
  'sufar','sufăr','suferinta','suferință','disperare','disperat'
];

// Factual — intrebari despre lume, nu despre sine
var _RE_FACTUAL = [
  /^(cine (e|este|era|au fost|sunt)\s+[a-z].{3,})/i,
  /^(ce (e|este|inseamna|înseamnă|reprezinta|reprezintă)\s+[a-z].{2,})/i,
  /^(un\s+\w+\s+(e|este|sunt)\s+\w)/i,
  /^(o\s+\w+\s+(e|este)\s+\w)/i,
  /\b(capitala\s+(romaniei|româniei|frantei|franței|germaniei|italiei|angliei|spaniei))/i,
  /\b(cate\s+(judete|județe)|câte\s+(judete|județe))/i,
  /\b(populatia|populația)\s+(romaniei|româniei)/i,
  /\b(apa\s+fierbe|temperatura\s+de\s+fierbere)/i,
  /\b(cate\s+planete|câte\s+planete)/i,
  /\b(viteza\s+luminii|viteza\s+sunetului)/i
];

// Identity — despre LEA insasi
var _RE_IDENTITY = [
  /\b(cine\s+(esti|ești)(\s+tu)?)\b/i,
  /\b(ce\s+(esti|ești)(\s+tu)?)\b/i,
  /\b(esti\s+(un|o)?\s*(ai|robot|program|aplicatie|aplicație|bot|software|computer))\b/i,
  /\b(cine\s+(te-a\s+creat|te-a\s+facut|te-a\s+făcut|a\s+creat))\b/i,
  /\b(cum\s+(functionezi|funcționezi|esti\s+construit|ești\s+construit))\b/i,
  /\b(ce\s+poti\s+face|ce\s+poți\s+face)\b/i
];

// Casual — conversatie normala, small talk, fara greutate emotionala
var _RE_CASUAL = [
  /^(ce\s+(facem|facem\s+azi|planuri\s+ai|planuri|avem\s+de\s+facut))\??$/i,
  /^(ce\s+(film|serie|carte|muzica|muzică|podcast)\s+(vad|văd|ascult|citesc|recomanzi))\??$/i,
  /^(spune.mi\s+(o\s+)?(gluma|glumă|ceva\s+interesant|ceva\s+fun))/i,
  /^(ce\s+mai\s+(e|este|nou|faci))\??$/i,
  /^(bine|ok|tare|super|fain|perfect|gata|da\s+ok|ok\s+ok|mișto|misто)\s*[.!]?\s*$/i,
  /^(haha|lol|aha|ahaa|oho|wow\s+ok)\s*[.!]?\s*$/i
];

// Task — actiuni concrete cerute
var _RE_TASK = [
  /\b(fa-mi|fă-mi|fa\s+mi|fă\s+mi)\b/i,
  /\b(ajuta-ma|ajută-mă|ajuta\s+ma)\b/i,
  /\b(traseu\s+(de\s+)?(alergat|alerg|mers|mers|ciclism))/i,
  /\b(alergat\s+traseu|traseu\s+alergat)/i,
  /\b(noteaza|notează|note)\s+.{3,}/i,
  /\b(creeaza|creează|scrie-mi|scrie\s+mi)\b/i,
  /\b(reminde(r|aza|ează)|aminteste-mi|amintește-mi)\b/i,
  /\b(seteaza|setează)\s+(un|o)?\s*(alarma|alarmă|reminder)\b/i
];

function _leaHasEmotionalOverride(text) {
  var t = (typeof leaNormDiac === 'function') ? leaNormDiac(text.toLowerCase()) : text.toLowerCase();
  return _EMOTIONAL_OVERRIDE.some(function(kw) { return t.indexOf(kw) !== -1; });
}

function _leaClassifyRoute(text) {
  var t = text.trim();
  var tLow = t.toLowerCase();

  // Semnal emotional explicit castiga mereu
  if (_leaHasEmotionalOverride(tLow)) return null; // emotional

  // Nonsense — prea scurt si fara sens (dupa collapse)
  if (t.length <= 3 && !/\b(da|nu|ok|hm|ah|oh)\b/i.test(t)) return 'nonsense';
  if (/^[^a-zA-ZăâîșțĂÂÎȘȚ0-9\s]+$/.test(t)) return 'nonsense'; // doar semne

  // Identity
  for (var i = 0; i < _RE_IDENTITY.length; i++) {
    if (_RE_IDENTITY[i].test(t)) return 'identity';
  }

  // Casual — inainte de task, prinde small talk si reactii simple
  for (var c = 0; c < _RE_CASUAL.length; c++) {
    if (_RE_CASUAL[c].test(t)) return 'casual';
  }

  // Task
  for (var j = 0; j < _RE_TASK.length; j++) {
    if (_RE_TASK[j].test(t)) return 'task';
  }

  // Factual — doar daca se termina cu "?" sau incepe cu structura tipica
  var hasQ = t.indexOf('?') !== -1;
  if (hasQ || t.length < 60) {
    for (var k = 0; k < _RE_FACTUAL.length; k++) {
      if (_RE_FACTUAL[k].test(t)) return 'factual';
    }
  }

  return null; // emotional / casual → flow normal
}

// ══════════════════════════════════════════════════════════════
// RASPUNSURI FACTUALE — simple, directe, fara terapie
// ══════════════════════════════════════════════════════════════

var _RO_FACTS = [
  [/un?\s*mar\s+(e|este)|un?\s*măr\s+(e|este)/i,            "de obicei roșu, verde sau galben. depinde de soi."],
  [/un?\s*lamaie|lămâie/i,                                   "galbenă."],
  [/capitala\s+(romaniei|româniei)/i,                        "București."],
  [/capitala\s+(frantei|franței)/i,                          "Paris."],
  [/capitala\s+(germaniei)/i,                                "Berlin."],
  [/capitala\s+(italiei)/i,                                  "Roma."],
  [/capitala\s+(angliei|marii\s+britanii)/i,                 "Londra."],
  [/capitala\s+(spaniei)/i,                                  "Madrid."],
  [/cate\s+judete|câte\s+județe/i,                           "41 de județe plus municipiul București."],
  [/populatia\s+romaniei|populația\s+româniei/i,             "cam 19 milioane de oameni."],
  [/apa\s+fierbe/i,                                          "la 100 de grade Celsius, la nivel al mării."],
  [/cate\s+planete|câte\s+planete/i,                         "8 planete în sistemul solar."],
  [/viteza\s+luminii/i,                                      "~300.000 km/s în vid."],
  [/viteza\s+sunetului/i,                                    "~343 m/s în aer la 20°C."],
  [/ce\s+(e|este)\s+adn|ce\s+inseamna\s+adn/i,              "acidul dezoxiribonucleic — molecula care poartă informația genetică."],
  [/ce\s+(e|este)\s+ai\b/i,                                  "inteligență artificială — sisteme care simulează gândirea."],
  [/cat\s+face\s+(\d+)\s*[+]\s*(\d+)/i,                     null], // math handled below
  [/(\d+)\s*[+]\s*(\d+)/,                                    null], // math
  [/(\d+)\s*[-]\s*(\d+)/,                                    null], // math
  [/(\d+)\s*[*x×]\s*(\d+)/,                                  null], // math
  [/(\d+)\s*[/÷:]\s*(\d+)/,                                  null], // math
];

var _FACTUAL_DONTKNOW = [
  "nu știu asta — nu am acces la internet.",
  "asta nu o știu.",
  "n-am idee, sincer.",
  "nu e ceva ce știu.",
  "nu am date despre asta."
];

function _leaFactual(text) {
  // Math simpla
  var mathMatch = text.match(/(\d+(?:[.,]\d+)?)\s*([+\-*x×\/÷:])\s*(\d+(?:[.,]\d+)?)/);
  if (mathMatch) {
    var a = parseFloat(mathMatch[1].replace(',','.'));
    var op = mathMatch[2];
    var b = parseFloat(mathMatch[3].replace(',','.'));
    var rez;
    if (op === '+')                rez = a + b;
    else if (op === '-')           rez = a - b;
    else if (op === '*' || op === 'x' || op === '×') rez = a * b;
    else if (op === '/' || op === '÷' || op === ':') rez = b !== 0 ? a / b : null;
    if (rez !== null && rez !== undefined && !isNaN(rez)) {
      var rezStr = Number.isInteger(rez) ? String(rez) : rez.toFixed(2).replace(/\.?0+$/, '');
      return rezStr + ".";
    }
  }

  // Cauta in baza de fapte
  for (var i = 0; i < _RO_FACTS.length; i++) {
    if (_RO_FACTS[i][1] && _RO_FACTS[i][0].test(text)) return _RO_FACTS[i][1];
  }

  return _FACTUAL_DONTKNOW[Math.floor(Math.random() * _FACTUAL_DONTKNOW.length)];
}

// ══════════════════════════════════════════════════════════════
// RASPUNSURI CASUAL — normal, simplu, viu
// ══════════════════════════════════════════════════════════════

var _CASUAL_RESP = [
  "nu știu, tu ce vrei?",
  "depinde de dispoziție.",
  "hmm, bună întrebare.",
  "ce ai chef?",
  "tu ce zici?",
  "depinde. spune-mi mai mult.",
  "ce ți-ar face bine acum?",
  "nu m-am gândit. tu?",
  "ce ai pe lista?",
  "ce ai în minte?"
];

var _CASUAL_FILM = [
  "ce gen?", "thriller, comedie sau ceva greu?",
  "depinde de dispoziție — ce simți acum?",
  "serial sau film? lung sau scurt?"
];

function _leaCasual(text) {
  var t = text.toLowerCase();
  if (/film|serie|podcast|carte/.test(t)) {
    return _CASUAL_FILM[Math.floor(Math.random() * _CASUAL_FILM.length)];
  }
  if (/gluma|glumă|fain|amuzant/.test(t)) {
    return "am eu una, dar nu e garantat că e bună.";
  }
  if (/planuri|facem\s+azi|ce\s+facem/.test(t)) {
    return "tu ce vrei — relaxare sau ceva concret?";
  }
  // Reactii pozitive simple
  if (/bine|ok|super|fain|perfect|gata|misто|mișto/.test(t)) {
    var reactPool = ["bun.", "ok.", "perfect.", "bine.", "da, super."];
    return reactPool[Math.floor(Math.random() * reactPool.length)];
  }
  return _CASUAL_RESP[Math.floor(Math.random() * _CASUAL_RESP.length)];
}

// ══════════════════════════════════════════════════════════════
// RASPUNSURI IDENTITY — simplu, calm, fara lore SF
// ══════════════════════════════════════════════════════════════

function _leaIdentity(text) {
  var t = text.toLowerCase();
  if (/cine\s+te-a\s+creat|cine\s+a\s+creat/.test(t)) {
    return "am fost construită de Cosmin. gândită să fie mai personală și mai locală decât restul.";
  }
  if (/esti\s+(un|o)?\s*(ai|robot|program|bot|software|computer)/i.test(t)) {
    return "da, sunt software. dar am fost construită să te știu pe tine, nu să știu totul despre lume.";
  }
  if (/ce\s+poti\s+face|ce\s+poți\s+face/.test(t)) {
    return "stau cu tine. ascult. rețin. cresc cu fiecare conversație.";
  }
  var pool = [
    "sunt Lea. am fost construită să te știu pe tine.",
    "Lea. companionul tău personal, local și al tău.",
    "sunt un software care crește cu tine.",
    "Lea — știu mai puțin despre lume, dar mai mult despre tine."
  ];
  return pool[Math.floor(Math.random() * pool.length)];
}

// ══════════════════════════════════════════════════════════════
// RASPUNSURI TASK — concret, util, folosind profilul
// ══════════════════════════════════════════════════════════════

function _leaTask(text, profile) {
  var t = text.toLowerCase();

  // Traseu alergat
  if (/traseu.*(alerg|alergat|fug)|alerg.*traseu/i.test(t)) {
    var oras = profile && profile.loc && profile.loc.oras ? profile.loc.oras : null;
    var km   = t.match(/(\d+)\s*(km|kilometr)/);
    if (oras && km) return "traseu de " + km[1] + " km în " + oras + ". ce suprafață preferi — parc, stradă, pistă?";
    if (oras)       return "traseu în " + oras + ". cât vrei să alergi — km sau timp?";
    return "cât vrei să alergi? distanță sau timp.";
  }

  // Notițe
  if (/noteaza|notează|note\s+că|notez/i.test(t)) {
    var notaTxt = text.replace(/^.*(noteaza|notează|notez)\s*/i, '').trim();
    if (notaTxt) return "notat: "" + notaTxt + "".";
    return "ce să notez?";
  }

  // Generic task
  var pool = [
    "spune-mi mai exact ce vrei să fac.",
    "concret — ce ai nevoie?",
    "ajut. cum exact?",
    "ce task? dă-mi detalii."
  ];
  return pool[Math.floor(Math.random() * pool.length)];
}

// ══════════════════════════════════════════════════════════════
// RASPUNSURI NONSENSE — playful, scurt
// ══════════════════════════════════════════════════════════════

var _NONSENSE_POOL = [
  "hm?", "nu am înțeles.", "încearcă din nou.", "ce-ai zis?",
  "am ratat asta.", "încă o dată?", "nu am prins."
];

function _leaNonsenseResp() {
  return _NONSENSE_POOL[Math.floor(Math.random() * _NONSENSE_POOL.length)];
}

// ══════════════════════════════════════════════════════════════
// VV STUDIO — context proiect activ
// Citit din localStorage shared cu vv-studio.html
// ══════════════════════════════════════════════════════════════

function _leaGetStudioCtx() {
  try {
    var raw = localStorage.getItem('vv_active_project');
    return raw ? JSON.parse(raw) : null;
  } catch(e) { return null; }
}

// ══════════════════════════════
// MOTOR PRINCIPAL — intrare text + context ANIMUS → raspuns
// ══════════════════════════════
function leaRespond(text, userProfile, animusResult) {
  var hic = leaTimeContext();

  // Normalizeaza caractere repetate ("câăți aaaaaani" → "câți ani")
  var textNorm = leaCollapseRepeated(text);

  // ── CRIZA — PRIMUL, inaintea oricarui alt sistem ──────────
  var crizaR = leaCrizaCheck(text);
  if (crizaR) {
    _leaUltimaCuriozitate = null; // nu procesam curiozitate in criza
    return { raspuns: crizaR, pattern: null, comportament: 'criza' };
  }

  // ── CONTINUARE — "si?", "mai spune", "continua" ─────────────
  var tCont = textNorm.trim().toLowerCase();
  if (typeof leaNormDiac === 'function') tCont = leaNormDiac(tCont);
  var isContinuare = /^(si[?!.]?|și[?!.]?|mai spune|mai departe|continua|continua[!.]?|spune mai mult|mai mult|si mai|și mai|spune\.|spune!)$/.test(tCont);
  if (isContinuare && typeof VV_CONTINUARE !== 'undefined') {
    var contResp = VV_CONTINUARE[Math.floor(Math.random() * VV_CONTINUARE.length)];
    return { raspuns: contResp, pattern: null, comportament: 'chat' };
  }

  // ══════════════════════════════════════════════════════════════
  // ROUTING ENGINE — LEA decide ce fel de mesaj e inainte de orice
  // emotional → flow normal (intention + speech)
  // factual / identity / task / nonsense → raspuns direct, simplu
  // Emotia CASTIGA mereu daca e semnal puternic
  // ══════════════════════════════════════════════════════════════

  // ── LEA SEARCH MODE — concierge calm când vine din Studio ────
  if (studioCtx && studioCtx.name) {
    var tLowS = (typeof leaNormDiac === 'function') ? leaNormDiac(textNorm.toLowerCase()) : textNorm.toLowerCase();
    var isSearchQ = /\b(cauta|cauta|gaseste|gaseste|recomanda|recomanda|vreau\s+sa\s+(caut|gasesc)|unde\s+(gasesc|pot)|ce\s+(restaurant|hotel|traseu|loc\s+bun))\b/i.test(tLowS);
    if (isSearchQ) {
      var concPool = [
        'deschide "Caută" în Studio — am filtrele tale pregătite.',
        'în Studio la Caută construiesc query-ul din profilul tău.',
        'mergi la Caută în Studio. știu exact ce să filtrez.'
      ];
      return { raspuns: concPool[Math.floor(Math.random()*concPool.length)], pattern:null, comportament:'chat' };
    }
  }

  var _routeResult = _leaClassifyRoute(textNorm);

  if (_routeResult === 'factual') {
    var fResp = _leaFactual(textNorm);
    return { raspuns: fResp, pattern: null, comportament: 'factual' };
  }
  if (_routeResult === 'identity') {
    var iResp = _leaIdentity(textNorm);
    return { raspuns: iResp, pattern: null, comportament: 'identity' };
  }
  if (_routeResult === 'task') {
    var tResp = _leaTask(textNorm, window.VVProfile ? VVProfile.getAll() : null);
    return { raspuns: tResp, pattern: null, comportament: 'task' };
  }
  if (_routeResult === 'casual') {
    var casResp = _leaCasual(textNorm);
    return { raspuns: casResp, pattern: null, comportament: 'chat' };
  }
  if (_routeResult === 'nonsense') {
    var nResp = _leaNonsenseResp();
    return { raspuns: nResp, pattern: null, comportament: 'chat' };
  }
  // 'emotional' sau null → continua normal prin intention engine

  // ── CURIOZITATE — procesare raspuns silent la intrebarea anterioara ──
  // LEA nu zice "am notat" — pur si simplu stie mai tarziu
  if (_leaUltimaCuriozitate) {
    var tipRaspuns = _leaUltimaCuriozitate.tip;
    var emotRaspuns = _leaUltimaCuriozitate.emotie;
    _leaUltimaCuriozitate = null;
    // Shelflearn cu context extra — raspunsul la intrebarea noastra
    if (window.shelfLearn) {
      shelfLearn(text, emotRaspuns, [tipRaspuns], hic.ora, new Date().getDay());
    }
  }

  // ── Follow-up scurt — "unde?", "cine?", "câți?" → răspunde din topic anterior
  // TREBUIE inainte de HiT routing — altfel intrebarile single-cuvant blocheaza
  var tShort = textNorm.trim().replace(/[?!\.]+$/, '');
  var tShortNorm = (typeof leaNormDiac === 'function') ? leaNormDiac(tShort) : tShort.toLowerCase();
  var isShortFollowup = tShortNorm.length <= 8 && /^(unde|cine|cati|cat|cum|care|ce)$/i.test(tShortNorm);
  if (isShortFollowup && _leaUltimTopic && window.Lea) {
    var kbFU = Lea.getKB();
    var cap2    = function(s){ return s ? s.charAt(0).toUpperCase()+s.slice(1).toLowerCase():s; };
    var capJob2 = function(s){ return s ? (s.length<=4 ? s.toUpperCase() : cap2(s)) : s; };
    if (_leaUltimTopic.tip === 'job'    && kbFU['job']    && kbFU['job'].val)
      return { raspuns: 'Lucrezi în ' + capJob2(kbFU['job'].val) + '.', pattern: null, comportament: 'chat' };
    if (_leaUltimTopic.tip === 'oras'   && kbFU['oras']   && kbFU['oras'].val)
      return { raspuns: 'Ești din ' + cap2(kbFU['oras'].val) + '.', pattern: null, comportament: 'chat' };
    if (_leaUltimTopic.tip === 'varsta' && kbFU['varsta'] && kbFU['varsta'].val)
      return { raspuns: 'Ai ' + kbFU['varsta'].val + '.', pattern: null, comportament: 'chat' };
    if (_leaUltimTopic.tip === 'nume'   && kbFU['nume']   && kbFU['nume'].val)
      return { raspuns: 'Te cheamă ' + cap2(kbFU['nume'].val) + '.', pattern: null, comportament: 'chat' };
  }

  // ── HiT routing — daca ANIMUS a clasificat intentul ──────
  var hitType = animusResult ? animusResult.type : null;

  // Intrebarile: verificam dicționarul INTAI — doar daca nu stim nimic mergem la "nu stiu"
  if (hitType === 'intrebare') {
    const analysis = leaAnalyze(textNorm);
    if (analysis) {
      // Am gasit ceva in dictionar — proceseaza normal mai jos
    } else {
      // Nimic in dictionar — raspuns honest
      var intrebFallback = [
        "Nu am date despre asta. Pot să te ajut cu ce simți.",
        "Nu știu asta — trăiesc pe device-ul tău, nu pe internet.",
        "Asta nu știu. Dar sunt aici pentru ce simți tu."
      ];
      return { raspuns: intrebFallback[Math.floor(Math.random() * intrebFallback.length)], pattern: null, comportament: 'intrebare' };
    }
  }

  // ── Alexandria lookup — folosim textul normalizat (fara caractere repetate)
  const analysis = leaAnalyze(textNorm);

  if (!analysis) {
    // ── REDUCERE EMOTIONALIZARE — mesaj scurt fara semnal → simplu, nu soothe
    // 70% normal, 20% cald, 10% profund. Nu terapie continua.
    if (!_leaHasEmotionalOverride(textNorm) && textNorm.trim().length < 50) {
      var neutralPool = [
        "aud.", "spune-mi mai mult.", "da?", "înțeleg.", "hmm.",
        "ce vrei să spui?", "și?", "da, continua.", "ok."
      ];
      return { raspuns: neutralPool[Math.floor(Math.random() * neutralPool.length)], pattern: null, comportament: 'chat' };
    }
    return { raspuns: leaFallback(hitType), pattern: null, comportament: 'necunoscut' };
  }

  // ── CHAT_ — raspuns direct ────────────────────────────────
  if (analysis.tip === 'chat') {
    // Daca mesajul e lung si CHAT_NIMIC/CHAT_OK apare ca substring accidental
    var isFalseChat = (analysis.chatId === 'CHAT_NIMIC' || analysis.chatId === 'CHAT_OK')
                      && text.trim().length > 20;
    if (isFalseChat) {
      return { raspuns: leaFallback(hitType), pattern: null, comportament: 'necunoscut' };
    }

    // MACUNOSTI / EUQUISUNT — verifica KB inainte sa raspunda generic
    if (analysis.chatId === 'CHAT_MACUNOSTI' || analysis.chatId === 'CHAT_EUQUISUNT') {
      var kbResp = leaBuildKBResponse(analysis.chatId, text);
      if (kbResp) {
        return { raspuns: kbResp, pattern: null, comportament: 'chat', limba: analysis.limba };
      }
    }

    return {
      raspuns: leaChatResponse(analysis.chatId) || leaFallback(hitType),
      pattern: null,
      comportament: 'chat',
      limba: analysis.limba
    };
  }

  // ── ALEXANDRIA — prin VV Speech ───────────────────────────
  const { his, hiq, limba, matches } = analysis;

  // Comportament pentru culori UI
  const comportamentNume = leaGetComportament(his, hiq);

  // Progresie conversatie — cat de adanc suntem
  const depth = leaConversationDepth(animusResult, analysis);

  // Nume din HiK (daca ANIMUS l-a retinut)
  var numePers = '';
  if (animusResult && window.Lea) {
    var kb = Lea.getKB();
    if (kb && kb['nume'] && kb['nume'].val) {
      numePers = kb['nume'].val.charAt(0).toUpperCase() + kb['nume'].val.slice(1);
    }
  }

  // HiL — salveaza in rafturi + citeste context personal
  var ctx = {};
  if (window.shelfLearn) {
    shelfLearn(text, comportamentNume, his, hic.ora, new Date().getDay());
    ctx = shelfGetContext(text, comportamentNume, hic.ora, new Date().getDay());
  }

  // VV Profile — context structurat (familie, job, plăceri)
  var profCtx = (window.VVProfile) ? VVProfile.getContext() : {};

  // VV Studio — proiect activ (daca userul lucreaza la ceva)
  var studioCtx = _leaGetStudioCtx();
  if (studioCtx) {
    ctx._studioProj  = studioCtx.name;
    ctx._studioText  = studioCtx.context || '';
    ctx._studioCat   = studioCtx.cat;
    ctx._studioTone  = studioCtx.tone;
    ctx._studioGoals = studioCtx.goals || [];
    ctx._studioLast  = studioCtx.lastIdea || '';

    // Daca userul intreaba despre ce lucreaza / ce face → raspuns din proiect
    var tN2 = (typeof leaNormDiac === 'function') ? leaNormDiac(textNorm.toLowerCase()) : textNorm.toLowerCase();
    var asksAboutWork = /ce\s+(fac|lucrez|am|mai)\s*(azi|acum|eu|de)?|la\s+ce\s+lucrez|proiect(ul\s+meu)?|vreu\s+sa\s+continui|unde\s+am\s+ramas/i.test(tN2);
    if (asksAboutWork && studioCtx.name) {
      var studioResp = 'lucrezi la "' + studioCtx.name + '"';
      if (studioCtx.lastIdea) studioResp += '. ultima idee: "' + studioCtx.lastIdea.slice(0,60) + '"';
      if (studioCtx.goals && studioCtx.goals.length) studioResp += '. obiectiv: ' + studioCtx.goals[0];
      studioResp += '. vrei să continui?';
      return { raspuns: studioResp, pattern: null, comportament: 'chat' };
    }
  }

  // Mod activ — citit devreme pentru detectare literara
  var mod = (window.Lea && Lea.getMod) ? Lea.getMod() : 'creativ';

  // LEA STATE — decay + update
  var state = {};
  if (typeof leaStateGet === 'function') {
    leaStateDecay();
    leaStateUpdate(comportamentNume, hiq);
    state = leaStateGet();
  }

  // INTENTION ENGINE — dual intention din stare + context
  var intentionObj = (typeof leaChooseIntention === 'function')
    ? leaChooseIntention(comportamentNume, hiq, depth, state)
    : { primary: null, secondary: null };

  // VV Speech — raspuns cu intentie + state + cadence + micro + silence + mod
  var raspuns = leaSpeech(his, hiq, ctx, intentionObj, state, text.length, mod);

  // ── CONTEXT INTRA-SESIUNE — update si anchor ──────────────
  _leaUpdateSessionCtx(comportamentNume, text);
  var anchor = _leaSessionAnchor(text, comportamentNume);
  if (anchor) raspuns = raspuns + ' ' + anchor;

  // ── NUME ÎN RĂSPUNS — 10%, doar cand stim numele si e apropiat ──
  if (numePers && state.closeness > 0.12 && Math.random() < 0.10 && raspuns.length > 5) {
    var prim = raspuns.charAt(0);
    // Nu adaugam numele daca raspunsul e un singur cuvant sau incepe cu "?" sau "…"
    if (!/[?!…]/.test(prim) && raspuns.indexOf(' ') !== -1) {
      raspuns = numePers + ', ' + prim.toLowerCase() + raspuns.slice(1);
    }
  }

  // INPUT LITERAR — ecou poetic in loc de raspuns emotional standard
  if (typeof leaIsLiterar === 'function' && leaIsLiterar(text)) {
    return {
      raspuns: leaSpeechLiterar(his, hiq, mod),
      pattern: { his, hiq },
      comportament: comportamentNume,
      matches,
      limba,
      isLiterar: true
    };
  }

  // HiC — context temporal (doar daca nu avem deja raspuns personal)
  if (!ctx.oraObicei && !ctx.persoana) {
    if (hic.isNoapte && hiq.intensitate > 0.6) {
      raspuns = "E târziu. " + raspuns;
    } else if (hic.isLuni && comportamentNume === 'oboseala') {
      raspuns = "Lunile sunt grele. " + raspuns;
    } else if (hic.isWeekend && comportamentNume === 'bucurie') {
      raspuns = raspuns + " Weekend bun.";
    }
  }

  // ── INIMA — LEA simte firul, observa, numeste ─────────────
  var kb = (window.Lea && Lea.getKB) ? Lea.getKB() : {};
  leaTrackEmotion(comportamentNume);
  var observatie = (comportamentNume !== 'necunoscut' && mod !== 'studio')
    ? leaObservaPattern(comportamentNume, kb) : null;

  if (observatie) {
    // LEA a vazut un tipar — iese din formula, spune ce observa
    var pqObs = leaPersonalQuestion(comportamentNume, kb);
    if (pqObs) _leaUltimaCuriozitate = { tip: 'observatie', emotie: comportamentNume };
    raspuns = observatie + (pqObs ? ' ' + pqObs : '');
    return { raspuns, pattern: { his, hiq }, comportament: comportamentNume, matches, limba };
  }

  // Progresie — daca aceeasi emotie de 3+ ori, intreaba mai profund
  if (depth >= 3) {
    var q = VV_DEEP[Math.floor(Math.random() * VV_DEEP.length)];
    raspuns = raspuns + " " + q;
  }

  // Personalizare — adauga numele rar (nu la fiecare mesaj)
  if (numePers && depth === 2 && hiq.intensitate > 0.5) {
    raspuns = numePers + ", " + raspuns.charAt(0).toLowerCase() + raspuns.slice(1);
  }

  // MODURI — aplica filtrul activ din ANIMUS
  if (mod === 'direct') {
    var dSentences = raspuns.match(/[^.!?\n]+[.!?]+/g) || [raspuns];
    var dKeep = dSentences.slice(0, 2).join(' ').trim();
    dKeep = dKeep.replace(/\s+[^.!?]*\?$/, '').trim();
    if (dKeep) raspuns = dKeep;
  } else if (mod === 'profund') {
    var qp = VV_DEEP[Math.floor(Math.random() * VV_DEEP.length)];
    if (raspuns.indexOf(qp) === -1) raspuns = raspuns + " " + qp;
  } else if (mod === 'studio') {
    var studioFull = raspuns.replace(/\s+[^.!?\n]*\?$/, '').trim();
    if (!studioFull) studioFull = raspuns.split(/[.!?]/)[0].trim();
    var studioDir = [
      "Plan larg. Lumina din spate.",
      "Prim-plan. Umbră pe jumătate de față.",
      "Mișcare lentă. Culori desaturate.",
      "Lumina laterală dură. Niciun sunet.",
      "Cadru fix. Vântul mișcă doar iarba.",
      "Zoom lent spre față. Fără dialog.",
      "Teleobiectiv. Subiect izolat în cadru.",
      "Lumina caldă din spate. Contur. Întuneric înainte."
    ];
    raspuns = studioFull + "\n\n— " + studioDir[Math.floor(Math.random() * studioDir.length)];
  }

  // CURIOZITATE — intrebare personala (din KB) sau generica din pool
  if (mod !== 'studio') {
    var pq = leaPersonalQuestion(comportamentNume, kb);
    if (pq) {
      var faraQ1 = raspuns.replace(/\s+\S[^.!?]*\?$/, '').trim();
      raspuns = (faraQ1 || raspuns) + ' ' + pq;
      _leaUltimaCuriozitate = { tip: 'personal', emotie: comportamentNume };
    } else {
      var curioz = leaChooseCurioz(ctx, comportamentNume, hiq, depth);
      if (curioz) {
        var faraQ2 = raspuns.replace(/\s+\S[^.!?]*\?$/, '').trim();
        raspuns = (faraQ2 || raspuns) + ' ' + curioz.intrebare;
        _leaUltimaCuriozitate = { tip: curioz.tip, emotie: comportamentNume };
      }
    }
  }

  return {
    raspuns,
    pattern: { his, hiq },
    comportament: comportamentNume,
    matches,
    limba
  };
}

