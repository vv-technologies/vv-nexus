// VV LEA — Personal Shelves (Rafturi Personale)
// Cosmin Toma / VV Hybrid Universe
// Local. Al tau. Zero server.

// ══════════════════════════════════════════════════════════════
// STRUCTURA RAFTURI
// ══════════════════════════════════════════════════════════════

var _shelves = null;

var SHELF_DEFAULT = {
  emotii: {
    tipare:      [],   // { emotie, tags, ora, ziua, next, ts }
    tipar_dupa:  {},   // { "tristete_profunda": "continua", "furie": "tace" }
    declansatori:{},   // { "ana": "tristete", "job": "furie" }
    dominanta:   null
  },
  limbaj: {
    stil:          'neutru',  // informal / neutru / formal
    injuraturi_ok: false,
    limba:         'ro'
  },
  relatii: {
    persoane: []   // { nume, emotie, count, ultima_data }
  },
  obiceiuri: {
    ore:       {},  // { "22": 4 } — de cate ori a vorbit la ora X
    zile:      {},  // { "1": 3 }  — de cate ori a vorbit ziua X
    total:     0
  }
};

// ── LOAD / SAVE ───────────────────────────────────────────────

function shelfLoad() {
  if (_shelves) return _shelves;
  try {
    var raw = localStorage.getItem('vv_shelves_v2');
    _shelves = raw ? JSON.parse(raw) : JSON.parse(JSON.stringify(SHELF_DEFAULT));
  } catch(e) {
    _shelves = JSON.parse(JSON.stringify(SHELF_DEFAULT));
  }
  return _shelves;
}

function shelfSave() {
  try { localStorage.setItem('vv_shelves_v2', JSON.stringify(_shelves)); } catch(e) {}
}

function shelfGet() { return shelfLoad(); }

// ── DECAY — tipare vechi scad in intensitate ──────────────────

function shelfDecay() {
  var s = shelfLoad();
  var now = Date.now();
  var treizecizile = 30 * 24 * 60 * 60 * 1000;

  s.emotii.tipare = s.emotii.tipare.filter(function(t) {
    return (now - t.ts) < treizecizile * 3; // sterge dupa 90 zile
  });

  // Pastreaza max 100 tipare
  if (s.emotii.tipare.length > 100) {
    s.emotii.tipare = s.emotii.tipare.slice(-100);
  }

  shelfSave();
}

// ── DETECTEAZA PERSOANE din text ──────────────────────────────

var _numeComune = ['nu','da','si','cu','la','de','pe','in','ca','sa','ma','am','e','o','un','o','al','ai','lui','ei'];

function shelfDetectNume(text) {
  var found = [];
  // Cauta dupa: "cu X", "la X", "despre X", "si X", "lui X", "cu ea/el" -> skip
  var patterns = [
    /(?:cu|la|despre|lui|pentru|de la|si)\s+([A-ZÁÉÍÓÚĂÂÎȘȚ][a-záéíóúăâîșț]{2,})/g,
    /([A-ZÁÉÍÓÚĂÂÎȘȚ][a-záéíóúăâîșț]{2,})\s+(?:a zis|a spus|mi-a|m-a)/g
  ];
  patterns.forEach(function(re) {
    var m;
    while ((m = re.exec(text)) !== null) {
      var nume = m[1];
      if (_numeComune.indexOf(nume.toLowerCase()) === -1) found.push(nume);
    }
  });
  return found;
}

// ── DETECTEAZA LIMBAJ ─────────────────────────────────────────

var _prescurtari = ['pl','ngl','meh','omg','wth','wtf','idk','fml','lol','bruh','bro','ugh'];
var _injuraturi  = ['pula','pl ','mortii','naibii','dracu','futu','mama ei','mama ta'];

function shelfDetectLimbaj(text) {
  var t = text.toLowerCase();
  var informal = false;
  var injur = false;

  _prescurtari.forEach(function(p) { if (t.includes(p)) informal = true; });
  _injuraturi.forEach(function(i)  { if (t.includes(i)) injur = true; });

  return { informal, injur };
}

// ── INVATA din interactiune ───────────────────────────────────

function shelfLearn(text, emotie, tags, ora, ziua) {
  var s = shelfLoad();

  // Completeaza "next" la tiparul anterior
  if (s.emotii.tipare.length > 0) {
    var last = s.emotii.tipare[s.emotii.tipare.length - 1];
    if (last.next === null) last.next = text;
  }

  // Adauga tipar nou
  s.emotii.tipare.push({
    emotie: emotie,
    tags:   tags,
    ora:    ora,
    ziua:   ziua,
    next:   null,
    ts:     Date.now()
  });

  // Actualizeaza tipar_dupa din istoric
  var total = {};
  var dupa  = {};
  s.emotii.tipare.forEach(function(t) {
    if (!t.next) return;
    if (!total[t.emotie]) { total[t.emotie] = 0; dupa[t.emotie] = { lung: 0, scurt: 0 }; }
    total[t.emotie]++;
    if (t.next.length > 15) dupa[t.emotie].lung++;
    else dupa[t.emotie].scurt++;
  });
  Object.keys(total).forEach(function(e) {
    var d = dupa[e];
    s.emotii.tipar_dupa[e] = d.scurt / total[e] >= 0.45 ? 'tace' : 'continua';
  });

  // Emotie dominanta
  var freq = {};
  s.emotii.tipare.forEach(function(t) { freq[t.emotie] = (freq[t.emotie]||0)+1; });
  s.emotii.dominanta = Object.keys(freq).sort(function(a,b){return freq[b]-freq[a];})[0] || null;

  // Persoane detectate
  var nume = shelfDetectNume(text);
  nume.forEach(function(n) {
    var existing = s.relatii.persoane.find(function(p) { return p.nume === n; });
    if (existing) {
      existing.count++;
      existing.emotie = emotie;
      existing.ultima_data = Date.now();
    } else {
      s.relatii.persoane.push({ nume: n, emotie: emotie, count: 1, ultima_data: Date.now() });
    }
  });
  // Pastreaza max 20 persoane, cele mai frecvente
  s.relatii.persoane.sort(function(a,b){return b.count-a.count;});
  if (s.relatii.persoane.length > 20) s.relatii.persoane = s.relatii.persoane.slice(0, 20);

  // Limbaj
  var lb = shelfDetectLimbaj(text);
  if (lb.informal) s.limbaj.stil = 'informal';
  if (lb.injur)    s.limbaj.injuraturi_ok = true;

  // Declanșatori — leaga cuvinte din text de emotie
  var cuvinte = text.toLowerCase().split(/\s+/).filter(function(w) { return w.length > 4; });
  cuvinte.forEach(function(c) {
    if (!s.emotii.declansatori[c]) s.emotii.declansatori[c] = emotie;
  });

  // Obiceiuri temporale
  var oraStr = String(ora);
  var ziuaStr = String(ziua);
  s.obiceiuri.ore[oraStr]   = (s.obiceiuri.ore[oraStr]  || 0) + 1;
  s.obiceiuri.zile[ziuaStr] = (s.obiceiuri.zile[ziuaStr]|| 0) + 1;
  s.obiceiuri.total++;

  shelfSave();
}

// ── GET CONTEXT — ce stim despre user pentru mesajul curent ──

function shelfGetContext(text, emotie, ora, ziua) {
  var s = shelfLoad();
  var ctx = {
    tipicDupa:   null,   // 'tace' | 'continua' | null
    oraObicei:   false,  // vorbeste des la ora asta cu aceasta emotie
    ziuaGrea:    false,  // ziua asta e frecvent asociata cu emotie grea
    persoana:    null,   // persoana detectata in text
    emotiePersoana: null,// emotia asociata persoanei
    stilInformal: false  // foloseste limbaj informal
  };

  // Tipic dupa aceasta emotie
  ctx.tipicDupa = s.emotii.tipar_dupa[emotie] || null;

  // Ora obisnuita pentru aceasta emotie
  var tipareEmotie = s.emotii.tipare.filter(function(t) { return t.emotie === emotie; });
  var oraSimilara  = tipareEmotie.filter(function(t) { return Math.abs(t.ora - ora) <= 2; });
  ctx.oraObicei = oraSimilara.length >= 3;

  // Ziua grea
  var ziuaCount = s.obiceiuri.zile[String(ziua)] || 0;
  ctx.ziuaGrea  = ziuaCount >= 3 && (emotie === 'oboseala' || emotie === 'tristete_profunda' || emotie === 'frustrare');

  // Persoana detectata
  var numeGasite = shelfDetectNume(text);
  if (numeGasite.length > 0) {
    var p = s.relatii.persoane.find(function(r) { return r.nume === numeGasite[0]; });
    ctx.persoana       = numeGasite[0];
    ctx.emotiePersoana = p ? p.emotie : null;
  }

  // Limbaj
  ctx.stilInformal = s.limbaj.stil === 'informal' || s.limbaj.injuraturi_ok;

  return ctx;
}

// ── STATS ─────────────────────────────────────────────────────

function shelfStats() {
  var s = shelfLoad();
  return {
    total:     s.obiceiuri.total,
    dominanta: s.emotii.dominanta,
    persoane:  s.relatii.persoane.slice(0, 3).map(function(p){return p.nume;}),
    stil:      s.limbaj.stil
  };
}

function shelfClear() {
  _shelves = null;
  localStorage.removeItem('vv_shelves_v2');
}

