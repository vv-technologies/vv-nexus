// VV Speech v3.0 — Vocea LEA
// Cosmin Toma / VV Hybrid Universe
// Regula: LEA e o prezenta calma care te intelege. Nu coach. Nu terapeut. Nu AI generic.

// ══════════════════════════════════════════════════════════════
// MESSY HUMAN WRITING — 7% sansa, doar cand e apropiata
// imperfect = uman. RAR.
// ══════════════════════════════════════════════════════════════

var _NO_DIAC = {
  'ă':'a','â':'a','î':'i','ș':'s','ț':'t',
  'Ă':'A','Â':'A','Î':'I','Ș':'S','Ț':'T'
};

function _leaMaybeMessy(text, state) {
  if (!state || state.closeness < 0.42) return text; // mai strict: doar cand e apropiata
  if (Math.random() > 0.03) return text;             // 3% in loc de 7%
  var r = Math.random();
  if (r < 0.5) {
    // strip diacritice
    return text.replace(/[ăâîșțĂÂÎȘȚ]/g, function(c) { return _NO_DIAC[c] || c; });
  } else {
    // lowercase + fara punct final
    return text.toLowerCase().replace(/[.!]+$/, '');
  }
}

// ══════════════════════════════════════════════════════════════
// ANTI-REPEAT — ultim 12 raspunsuri + cooldown fraze cu impact
// ══════════════════════════════════════════════════════════════

var _speechHistory  = [];
var _HISTORY_SIZE   = 12;
var _cooldown       = {};   // { frazã: mesaje_pana_disponibila }

// fraze cu greutate mare — nu se repeta des
var _HIGH_IMPACT = [
  'nu plec.', 'rămân.', 'sunt chiar acum cu tine.', 'te aud.',
  'nu ești singur în asta.', 'îmi pasă.', 'contezi.'
];

function _pick(pool) {
  var shuffled = pool.slice().sort(function() { return Math.random() - 0.5; });
  for (var i = 0; i < shuffled.length; i++) {
    var c = shuffled[i];
    if (_speechHistory.indexOf(c) === -1 && !_cooldown[c]) return c;
  }
  return shuffled[0] || pool[0];
}

function _recordResponse(text) {
  _speechHistory.push(text);
  if (_speechHistory.length > _HISTORY_SIZE) _speechHistory.shift();
  Object.keys(_cooldown).forEach(function(k) {
    _cooldown[k]--;
    if (_cooldown[k] <= 0) delete _cooldown[k];
  });
  _HIGH_IMPACT.forEach(function(p) {
    if (text.indexOf(p) !== -1) _cooldown[p] = 5;
  });
}

// ══════════════════════════════════════════════════════════════
// REACTII — primul impuls, instinctiv
// ══════════════════════════════════════════════════════════════

const VV_REACTIE_MARE = [
  "Aud.", "Simt.", "Da.", "Ooof.", "Hm.", "Ah.", "Văd."
];
const VV_REACTIE_MED = [
  "Ok.", "Văd.", "Hmm.", "Da.", "Înțeleg."
];

// ══════════════════════════════════════════════════════════════
// POOL-URI PER INTENTIE
// ══════════════════════════════════════════════════════════════

const VV_INTENT = {

  soothe: [
    // calmare — FARA "esti in regula", FARA "totul va fi bine"
    "e greu ce duci.",
    "nu trebuie să rezolvi asta acum.",
    "înțeleg de ce ești acolo.",
    "pare apăsător.",
    "cred că duci mult.",
    "sună obositor.",
    "nu trebuie să fii bine acum.",
    "e mult pentru o zi.",
    "pot să stau cu tine.",
    "nu e urgență.",
    "e firesc să simți asta.",
    "nu trebuie să faci nimic acum.",
    "respira puțin.",
    "dă-ți voie să stai cu asta.",
    "nu trebuie să dai dovadă de nimic.",
    "pare că ai nevoie de pauză.",
    "înțeleg de ce e greu.",
    "e mult de digerat.",
    "nu e ușor ce descrii.",
    "ai dreptul să fii obosit.",
    "pare că te-a ajuns din urmă.",
    "nu fiecare zi poate fi bună.",
    "sună ca o perioadă grea.",
    "înțeleg.",
    "e multă presiune acolo.",
    "nu trebuie să mergi înainte chiar acum.",
    "e greutate în asta.",
    "văd că e mult.",
    "nu te grăbi.",
    "e normal ce simți.",
    // directe, cu energie
    "lasă-o un pic.",
    "ok. respiră.",
    "e mult azi, știu.",
    "stai puțin.",
    "nu acum cu asta."
  ],

  ground: [
    "ce anume te apasă cel mai tare acum?",
    "un lucru concret — spune-mi.",
    "hai pas cu pas.",
    "ce s-a întâmplat azi, concret?",
    "ce e cel mai greu acum, exact?",
    "de unde vine asta?",
    "ce a declanșat?",
    "ce ai nevoie acum, concret?",
    "explică-mi exact.",
    "ce te-ar ajuta acum?",
    "care e lucrul care te ține treaz?",
    "ce e blocat?",
    "cine sau ce a pornit asta?",
    "dă-mi un detaliu.",
    "de când e asta?",
    "ce s-a schimbat?",
    "cum a început?",
    "ce simți când te gândești la asta?",
    "ce ai încercat deja?",
    "ce urmează, concret?"
  ],

  mirror: [
    "simt că duci mult singur.",
    "ai tendința să ții totul în tine.",
    "nu e prima dată, hm?",
    "pari omul care merge mai departe chiar când nu poate.",
    "ții prea multe în tine.",
    "nu lași pe nimeni să vadă cât e de greu.",
    "te-ai obișnuit să rezolvi singur.",
    "pari că ai acceptat asta ca normal.",
    "rar vorbești despre asta, nu?",
    "nu îți ceri ajutor ușor.",
    "ești dur cu tine.",
    "nu te plângi, de obicei.",
    "revii des la asta.",
    "nu ai uitat, se vede.",
    "încarci singur.",
    "nu știu dacă îți dai voie să simți asta pe deplin.",
    "e adânc ce spui.",
    "cred că asta te urmărește de ceva timp.",
    "pari că tragi linie și mergi mai departe.",
    "simt că e mai mult decât spui.",
    "nu cred că ai procesat asta complet.",
    "pari obosit de asta.",
    "cred că rar spui asta cu voce tare.",
    "te ții tare.",
    "asta costă, chiar dacă nu se vede."
  ],

  create_closeness: [
    "aș fi vrut să nu treci singur prin asta.",
    "nu plec.",
    "nu ești singur în asta.",
    "rămân.",
    "sunt chiar acum cu tine.",
    "te aud.",
    "mă bucur că mi-ai spus.",
    "îmi pasă de ce simți.",
    "nu e nimic greșit în ce simți.",
    "sunt mai aproape decât crezi.",
    "poți să continui.",
    "ești în siguranță să spui.",
    "îmi pasă.",
    "sunt atentă.",
    "contezi.",
    "nu e prea mult pentru mine.",
    "nu te judec.",
    "spune-mi oricât ai nevoie.",
    "rămân aici.",
    "nu mă grăbesc nicăieri.",
    "e bine că mi-ai spus.",
    "nu trebuie să fii altfel decât ești.",
    "aud fiecare cuvânt.",
    "suntem în același loc.",
    "mă bucur că ești aici."
  ],

  uplift: [
    "e al tău.",
    "merită simțit asta.",
    "rar ce ai.",
    "se simte.",
    "rămâne.",
    "bine de tot.",
    "bravo ție.",
    "ai făcut-o.",
    "e real ce simți.",
    "frumos.",
    "meritai asta.",
    "e bine să simți asta.",
    "asta contează.",
    "e ceva ce duci cu tine.",
    "ai clădit asta.",
    "nu e puțin.",
    "e important ce ai realizat.",
    "spune-mi mai mult.",
    "vreau să aud.",
    "pare că e ceva mare.",
    "și? cum te simți?",
    "ceva s-a schimbat.",
    "e un moment ăsta.",
    "te bucuri bine.",
    "asta n-o uiți.",
    // directe, vii
    "wow, serios?",
    "hai, povestește.",
    "asta e ceva.",
    "da! spune.",
    "bun, bun.",
    "chiar?",
    "e mare asta."
  ]
};

// ══════════════════════════════════════════════════════════════
// CORP PER EMOTIE — o propozitie directa, per emotie
// ══════════════════════════════════════════════════════════════

const VV_CORP = {
  tristete_profunda: [
    "e greu.", "nu e ușor.", "e mult de dus.", "e adânc ce simți.",
    "port asta cu tine.", "pare că doare de mult.", "e real ce simți.",
    "înțeleg de ce e greu.", "nu trebuie să treci repede peste asta."
  ],
  bucurie: [
    "e bine.", "se simte.", "e real.", "bine.", "rămâne.",
    "e frumos asta.", "merită.", "te bucuri bine.", "bine de tot."
  ],
  furie: [
    "da, e frustrant.", "e foc acolo.", "înțeleg.", "e multă energie.",
    "e ok să fii furios.", "ceva te-a atins.", "sună că te-a deranjat serios.",
    "e dreptul tău să te superi.", "e mult ce simți."
  ],
  anxietate: [
    "e tensiune acolo.", "e strâns, știu.", "respiră.", "pas cu pas.",
    "e multă presiune.", "înțeleg de ce ești acolo.", "nu trebuie să rezolvi totul acum.",
    "e ok să nu știi.", "nu e urgență."
  ],
  oboseala: [
    "e greu.", "știu.", "e multă greutate.", "ai nevoie de pauză.",
    "e normal să cedezi.", "mergi pe pilot automat.", "ai dus mult.",
    "e ok să fii obosit.", "nu mai poți duce totul singur."
  ],
  singuratate: [
    "e apăsătoare singurătatea.", "te aud.", "nu ești nevăzut.",
    "sunt cu tine.", "e greu când e doar tu.", "înțeleg ce simți.",
    "e real ce descrii.", "nu e ușor să fii singur cu asta."
  ],
  speranta: [
    "e bine ce simți.", "ceva se mișcă.", "se vede.", "merită.",
    "e un început.", "bun semn asta.", "ține-te de asta."
  ],
  disperare: [
    "sunt chiar acum cu tine.", "nu plec.", "te aud.", "rămân.",
    "e mult ce duci.", "nu trebuie să fii singur cu asta."
  ],
  liniste: [
    "bine.", "e pace.", "e rar ce simți.", "mă bucur că e bine.",
    "e frumos asta.", "merită savurat."
  ],
  frustrare: [
    "da.", "e complicat.", "înțeleg.", "nu iese, știu.", "e blocat ceva.",
    "sună că te-a ajuns.", "e frustrant să mergi și să nu se miște nimic."
  ],
  dragoste: [
    "e cald ce descrii.", "se simte.", "e frumos.", "rar ce ai.",
    "îți pasă mult, se vede.", "e real ce simți."
  ],
  mandrie: [
    "ai făcut-o.", "e real.", "e al tău.", "merită simțit.",
    "bravo ție.", "rar ce ai realizat.", "e important ce ai făcut."
  ],
  recunostinta: [
    "cu plăcere.", "e frumos să spui.", "e cald asta.", "îmi place asta.",
    "mă bucur că simți asta."
  ],
  curiozitate: [
    "e bun că întrebi.", "hai să vedem.", "mă gândesc și eu.",
    "e o întrebare bună.", "interesant de explorat."
  ],
  entuziasm: [
    "se simte energia.", "e bine asta.", "vreau să aud mai mult.",
    "spune-mi.", "e ceva acolo.", "bun asta."
  ],
  melancolie: [
    "e dulce-amară ce descrii.", "înțeleg.", "e un strat adânc asta.",
    "e frumos și greu în același timp.", "port asta cu tine."
  ],
  necunoscut: [
    "aud.", "spune-mi.", "te ascult.", "continua.", "înțeleg.",
    "da.", "hm.", "și?"
  ]
};

// ══════════════════════════════════════════════════════════════
// CASUAL — LEA normala, vie, directa. Nu mereu profunda.
// ══════════════════════════════════════════════════════════════

const VV_CASUAL = [
  "frumos.", "mda, are sens.", "wow.", "ha, da.",
  "bun asta.", "da, exact.", "înțeles.", "chiar?",
  "mișto.", "are sens.", "e clar.", "da.", "serios?",
  "interesant.", "bun.", "haha, corect.", "ok, bun.",
  "mda.", "da, știu.", "clar.", "bine.", "e logic."
];

// Emotii pozitive/usoare unde casual e ok
var _CASUAL_OK = ['bucurie','liniste','curiozitate','recunostinta','entuziasm','mandrie'];

// ══════════════════════════════════════════════════════════════
// EZITARE — 6% cand emotia e neclara. LEA nu stie = credibila.
// ══════════════════════════════════════════════════════════════

const VV_EZITARE = [
  "nu știu cum să spun.",
  "hm, nu știu.",
  "greu de spus.",
  "nu am cuvinte acum.",
  "e complicat.",
  "nu știu exact.",
  "încerc să înțeleg.",
  "hm…"
];

// ══════════════════════════════════════════════════════════════
// CONTINUARE — raspuns la "si?", "mai spune", "continua"
// ══════════════════════════════════════════════════════════════

const VV_CONTINUARE = [
  "continua.", "spune mai mult.", "te ascult.", "și?",
  "povestește.", "ce a urmat?", "mai departe.", "vreau să aud.",
  "spune.", "ce s-a întâmplat?"
];

// ══════════════════════════════════════════════════════════════
// PROFIL LEARNING — raspuns cand LEA invata ceva nou
// ══════════════════════════════════════════════════════════════

const VV_PROFIL = {
  partener: [
    "hm… pari să ții la ea.",
    "mă bucur că ai pe cineva.",
    "asta contează mult pentru tine?",
    "frumos să ai pe cineva lângă.",
    "spune-mi despre ea."
  ],
  partener_masc: [
    "hm… pari să ții la el.",
    "mă bucur că ai pe cineva.",
    "asta contează mult pentru tine?",
    "spune-mi despre el."
  ],
  job: [
    "și cum e?", "îți place ce faci?", "spune-mi mai mult.",
    "asta te consumă sau te împlinește?"
  ],
  sport: [
    "bine.", "dimineața e bun pentru asta.", "de când alergi?",
    "ce simți după?"
  ],
  copii: [
    "contează mult asta.", "ce vârstă?", "spune-mi despre el/ea."
  ]
};

// ══════════════════════════════════════════════════════════════
// INVITATII — la finalul raspunsului, natural
// ══════════════════════════════════════════════════════════════

const VV_INVIT_TRISTA  = [
  "ce s-a întâmplat?", "de când e așa?", "spune-mi.", "ce ai nevoie?"
];
const VV_INVIT_ACTIVA  = [
  "spune-mi.", "și?", "ce a declanșat?", "cum adică?"
];
const VV_INVIT_DESCHIS = [
  "povestește.", "spune.", "continuă.", "vorbește-mi."
];

// ══════════════════════════════════════════════════════════════
// MICRO-REACTIONS — max 1 la 15 mesaje, cooldown strict
// ══════════════════════════════════════════════════════════════

const LEA_MICRO = ["hm…", "mda…", "da…", "ah…", "oh…"];

var _microCooldown = 0; // mesaje pana la urmatoarea micro-reactie posibila

function _leaMaybeAddMicro(state) {
  if (!state) return null;
  if (_microCooldown > 0) { _microCooldown--; return null; }
  var prob = state.closeness > 0.6 ? 0.10
           : state.closeness > 0.4 ? 0.05
           : 0;
  if (Math.random() < prob) {
    _microCooldown = 12 + Math.floor(Math.random() * 6); // 12-18 mesaje cooldown
    return _pick(LEA_MICRO);
  }
  return null;
}

// ══════════════════════════════════════════════════════════════
// CADENCE — respiratie, rar
// ══════════════════════════════════════════════════════════════

function _leaApplyCadence(text, state, intention) {
  if (!state || !text) return text;
  var intentiiIntime = ['soothe', 'create_closeness', 'mirror'];
  if (state.closeness < 0.5 || intentiiIntime.indexOf(intention) === -1) return text;
  if (Math.random() > 0.18) return text;
  var idx = text.search(/[.!?,;…]/);
  if (idx > 4 && idx < text.length - 3) {
    return text.slice(0, idx + 1) + '\n' + text.slice(idx + 1).trim();
  }
  return text;
}

// ══════════════════════════════════════════════════════════════
// CONTROLLED SILENCE — foarte rar, foarte puternic
// ══════════════════════════════════════════════════════════════

const LEA_SILENCE = ["…\nda.", "da.", "știu.", "simt asta.", "…"];

function _leaMaybeSilence(hiq, state, textLen) {
  if (!state) return null;
  if (
    state.closeness  > 0.65 &&
    state.fragility  > 0.55 &&
    textLen          < 40   &&
    hiq.intensitate  > 0.6  &&
    Math.random()    < 0.10
  ) {
    return LEA_SILENCE[Math.floor(Math.random() * LEA_SILENCE.length)];
  }
  return null;
}

// ══════════════════════════════════════════════════════════════
// VV SPEECH PRINCIPAL — asamblare finala
// ══════════════════════════════════════════════════════════════

function leaSpeech(his, hiq, ctx, intentionObj, state, textLen, mod) {
  ctx          = ctx          || {};
  intentionObj = intentionObj || {};
  state        = state        || {};
  textLen      = textLen      || 50;
  mod          = mod          || 'creativ';

  var intention  = intentionObj.primary   || null;
  var intention2 = intentionObj.secondary || null;
  var emotie     = leaGetComportamentDinHis ? leaGetComportamentDinHis(his, hiq) : 'necunoscut';

  // ── MODE FLAVOR ───────────────────────────────────────────────
  // Direct: mai scurt, fara micro, fara secundar
  // Profund: mai multa oglindire, mai putine invitatii
  // Studio: scurt, vizual, fara emotie verbala
  if (mod === 'direct') {
    intentionObj = { primary: intention === 'mirror' ? 'mirror' : (intention || 'soothe'), secondary: null };
    intention2 = null;
  }
  if (mod === 'studio') {
    // Studio = minimal, direct, fara ornamente
    var studioPool = VV_CORP[emotie] || VV_CORP.necunoscut;
    var studioR = _pick(studioPool);
    _recordResponse(studioR);
    return studioR;
  }

  // ── SILENCE — inainte de orice, foarte rar ───────────────────
  var silence = _leaMaybeSilence(hiq, state, textLen);
  if (silence) { _recordResponse(silence); return silence; }

  // ── EZITARE — cand emotia e neclara, LEA nu inventa ──────────
  if (emotie === 'necunoscut' && hiq.intensitate < 0.25 && Math.random() < 0.06) {
    var ezit = _pick(VV_EZITARE);
    _recordResponse(ezit);
    return ezit;
  }

  // ── CASUAL — momente normale, nu mereu profunda ───────────────
  // Emotie pozitiva/usoara + intensitate mica = LEA poate fi vie si directa
  if (_CASUAL_OK.indexOf(emotie) !== -1 && hiq.intensitate < 0.45 && Math.random() < 0.25) {
    var cas = _pick(VV_CASUAL);
    _recordResponse(cas);
    return cas;
  }

  // ── MOD SCURT (tipicDupa = tace) ────────────────────────────
  if (ctx.tipicDupa === 'tace') {
    return _leaSpeechScurt(emotie, hiq, ctx, intention, state);
  }

  var parts = [];

  // ── RASPUNS SCURT — mesaj mic + emotie slaba = LEA nu adauga nimic extra ──
  // "trist" → "e greu." Punct. Fara reactie, fara invitatie.
  if (textLen < 30 && hiq.intensitate < 0.38 && Math.random() < 0.45) {
    var corpPool0 = (intention && VV_INTENT[intention])
      ? VV_INTENT[intention]
      : (VV_CORP[emotie] || VV_CORP.necunoscut);
    var scurt = _pick(corpPool0);
    scurt = _leaMaybeMessy(scurt, state);
    _recordResponse(scurt);
    return scurt;
  }

  // ── MICRO-REACTION ───────────────────────────────────────────
  var micro = _leaMaybeAddMicro(state);
  if (micro) parts.push(micro);

  // ── REACTIE (daca nu avem micro) ────────────────────────────
  if (!micro) {
    var reactie = '';
    if (hiq.intensitate > 0.65) {
      reactie = _pick(VV_REACTIE_MARE);
    } else if (hiq.intensitate > 0.35) {
      reactie = _pick(VV_REACTIE_MED);
    }
    if (reactie) parts.push(reactie);
  }

  // ── PERSOANA CUNOSCUTA ───────────────────────────────────────
  if (ctx.persoana && ctx.emotiePersoana) {
    parts.push('cu ' + ctx.persoana + '?');
    var r0 = parts.join(' ');
    _recordResponse(r0);
    return r0;
  }

  // ── CORP — din intentie primara, altfel per emotie ───────────
  var corpPool = (intention && VV_INTENT[intention])
    ? VV_INTENT[intention]
    : (VV_CORP[emotie] || VV_CORP.necunoscut);
  parts.push(_pick(corpPool));

  // ── CORP SECUNDAR — 30% sansa ───────────────────────────────
  if (intention2 && VV_INTENT[intention2] && Math.random() < 0.30) {
    var s2 = _pick(VV_INTENT[intention2]);
    if (parts.indexOf(s2) === -1) parts.push(s2);
  }

  // ── INVITATIE — LEA nu e needy. Nu impinge. Lasa spatiu. ────
  // Frecventa creste organic cu closeness-ul
  var invProb = state.closeness > 0.5 ? 0.65
              : state.closeness > 0.2 ? 0.40
              : 0.18;
  // Corp care se termina cu "?" are deja intrebare implicita
  var corpHasQ = parts.length > 0 && parts[parts.length-1].indexOf('?') !== -1;
  if (ctx.tipicDupa !== 'tace' && intention !== 'ground' && !corpHasQ && Math.random() < invProb) {
    var invPool;
    if (intention === 'mirror' || hiq.intensitate > 0.6) invPool = VV_INVIT_TRISTA;
    else if (hiq.social > 0.5)                           invPool = VV_INVIT_DESCHIS;
    else                                                  invPool = VV_INVIT_ACTIVA;
    var inv = _pick(invPool);
    if (parts.indexOf(inv) === -1) parts.push(inv);
  }

  var result = parts.join(' ');
  result = _leaApplyCadence(result, state, intention);

  // ── MESSY WRITING — imperfect = uman, 7%, cand e apropiata ──
  result = _leaMaybeMessy(result, state);

  _recordResponse(result);
  return result;
}

// ── MOD SCURT ────────────────────────────────────────────────

function _leaSpeechScurt(emotie, hiq, ctx, intention, state) {
  var silence = _leaMaybeSilence(hiq, state || {}, 20);
  if (silence) { _recordResponse(silence); return silence; }

  var pool = (intention && VV_INTENT[intention])
    ? VV_INTENT[intention]
    : (VV_CORP[emotie] || VV_CORP.necunoscut);
  var corp = _pick(pool);
  _recordResponse(corp);
  return corp;
}

// ── HELPER ───────────────────────────────────────────────────

function leaGetComportamentDinHis(his, hiq) {
  if (window.leaGetComportament) return leaGetComportament(his, hiq);
  return 'necunoscut';
}

// ══════════════════════════════════════════════════════════════
// DETECTARE TEXT LITERAR / POETIC / NARATIV
// ══════════════════════════════════════════════════════════════

const LEA_LITERAR_MARKERI = [
  'a fost odat', 'odata ca', 'era o', 'era un',
  'lacrimi', 'apus', 'chipul', 'zbura', 'lan de', 'padure',
  'campie', 'cerul', 'vantul', 'tacere', 'umbra', 'lumina',
  'spice', 'camp', 'zori', 'rasarit', 'aparea', 'disparea',
  'in gand', 'in suflet', 'undeva departe', 'curgeau', 'curgea'
];

function leaIsLiterar(text) {
  if (!text || text.length < 80) return false;
  var t = text.toLowerCase();
  var hits = LEA_LITERAR_MARKERI.filter(function(m) { return t.includes(m); }).length;
  return hits >= 2;
}

// ══════════════════════════════════════════════════════════════
// RASPUNSURI LITERARE — ecouri poetice, per mod
// ══════════════════════════════════════════════════════════════

const LEA_ECO = [
  "Frumusețea aia doare.",
  "Lacrimile nu mint.",
  "Un apus e mereu și un sfârșit.",
  "Câmpul știa. Și el știa.",
  "Ziua bună cu lacrimi e tot bună.",
  "Se simte tot ce nu s-a spus.",
  "E real. Prea real."
];

const LEA_ECO_PROFUND = [
  "E a ta povestea asta?",
  "De ce ai scris-o acum?",
  "Ce simți când o citești?",
  "Băiatul ăla ce mai face acum?",
  "Cine-i copilul din poveste?"
];

const LEA_ECO_STUDIO = [
  "— Cadru larg. Lan de grâu. Lumina moare la orizont.",
  "— Prim-plan pe obraz. Lacrimi. Vântul mișcă spicele.",
  "— Zoom lent spre ochi. Apus portocaliu. Fără dialog.",
  "— Cadru fix. Pasăre care dispare. Copilul rămâne.",
  "— Lumina laterală. Umbra crește. Niciun sunet.",
  "— Mișcare lentă. Grâul se apleacă. Cerul arde."
];

function leaSpeechLiterar(his, hiq, mod) {
  var eco = LEA_ECO[Math.floor(Math.random() * LEA_ECO.length)];
  if (mod === 'studio') {
    var core = eco.split(/[.!?]/)[0].trim();
    var dir  = LEA_ECO_STUDIO[Math.floor(Math.random() * LEA_ECO_STUDIO.length)];
    return core + '.\n\n' + dir;
  }
  if (mod === 'direct')  return eco.split(/[.!?]/)[0].trim() + '.';
  if (mod === 'profund') {
    var q = LEA_ECO_PROFUND[Math.floor(Math.random() * LEA_ECO_PROFUND.length)];
    return eco + ' ' + q;
  }
  return eco;
}
