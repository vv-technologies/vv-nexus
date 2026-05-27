// VV LEA — Motor VVBL v3.0
// Cosmin Toma / VV Technologies
// Conectat la ANIMUS: HiT + HiM + HiK + HiC + Alexandria + VV Speech

// ══════════════════════════════
// ALEXANDRIA — din alexandria-data.js (zero server)
// ══════════════════════════════
var ALEXANDRIA = (typeof ALEXANDRIA_DATA !== 'undefined') ? ALEXANDRIA_DATA : [];

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
  const t = text.toLowerCase().trim();
  const limba = leaDetectLang(t);
  const allIds = leaLookupAll(t);
  if (allIds.length === 0) return null;

  const chatIds = allIds.filter(id => id.startsWith('CHAT_'));
  const alexIds = allIds.filter(id => !id.startsWith('CHAT_'));

  if (alexIds.length === 0) {
    return { tip: 'chat', chatId: chatIds[0], limba };
  }

  const matches = [];
  for (const id of alexIds) {
    const pattern = leaGetPattern(id);
    if (pattern) matches.push(pattern);
  }
  if (matches.length === 0) return null;

  const combined = leaCombinePatterns(matches);
  combined.tip = 'alex';
  combined.limba = limba;
  combined.matches = matches.map(m => m.cuvant);
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

  // Mod activ — citit devreme pentru detectare literara
  var mod = (window.Lea && Lea.getMod) ? Lea.getMod() : 'creativ';

  // VV Speech — construieste raspunsul cu context personal
  var raspuns = leaSpeech(his, hiq, ctx);

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

