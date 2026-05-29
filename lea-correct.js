// VV LEA — Corecție Inteligentă Română
// Cosmin Toma / VV Hybrid Universe
// Aplica diacritice + corecții comune înainte de trimitere

// ══════════════════════════════════════════════════════════════
// DICȚIONAR CORECȚII — cuvinte fără diacritice → cu diacritice
// Doar cazuri neambigue (nu "si" care poate fi EN sau RO)
// ══════════════════════════════════════════════════════════════

const LEA_CORRECT_MAP = {
  // A → Ă / Â
  "fata":       "față",
  "data":       "dată",
  "seara":      "seară",
  "dimineata":  "dimineață",
  "placere":    "plăcere",
  "multumesc":  "mulțumesc",
  "multumit":   "mulțumit",
  "intrebare":  "întrebare",
  "intrebari":  "întrebări",
  "intotdeauna":"întotdeauna",
  "inainte":    "înainte",
  "inapoi":     "înapoi",
  "impreuna":   "împreună",
  "asa":        "așa",
  "acasa":      "acasă",
  "afara":      "afară",
  "apa":        "apă",
  "mana":       "mână",
  "luna":       "lună",
  "vara":       "vară",
  "toamna":     "toamnă",
  "primavara":  "primăvară",
  "inima":      "inimă",
  "masa":       "masă",
  "casa":       "casă",
  "strada":     "stradă",
  "tara":       "țară",
  "bara":       "bară",

  // Ș / Ț
  "stiu":       "știu",
  "stii":       "știi",
  "stie":       "știe",
  "stim":       "știm",
  "stiți":      "știți",
  "cati":       "câți",
  "cate":       "câte",
  "cand":       "când",
  "cat":        "cât",
  "cata":       "câtă",
  "atata":      "atâta",
  "atat":       "atât",
  "unde":       "unde",
  "saptamana":  "săptămână",
  "saptamani":  "săptămâni",
  "trebuie":    "trebuie",
  "trebuia":    "trebuia",
  "pastrat":    "păstrat",
  "pastrez":    "păstrez",
  "gasit":      "găsit",
  "gasesc":     "găsesc",
  "gaseste":    "găsește",
  "inceput":    "început",
  "incep":      "încep",
  "incepe":     "începe",
  "inchis":     "închis",
  "inchide":    "închide",
  "deschis":    "deschis",
  "inteles":    "înțeles",
  "inteleg":    "înțeleg",
  "intelegi":   "înțelegi",
  "intelege":   "înțelege",
  "imi":        "îmi",
  "iti":        "îți",
  "isi":        "își",
  "intai":      "întâi",
  "intamplat":  "întâmplat",
  "intampla":   "întâmplă",
  "intalnit":   "întâlnit",
  "intalnire":  "întâlnire",
  "singur":     "singur",
  "singura":    "singură",
  "tanar":      "tânăr",
  "tanara":     "tânără",
  "batran":     "bătrân",
  "batrana":    "bătrână",
  "frumos":     "frumos",
  "frumoasa":   "frumoasă",
  "greu":       "greu",
  "grea":       "grea",
  "puternic":   "puternic",
  "puternica":  "puternică",

  // Cuvinte comune cu î
  "intrist":    "întristat",
  "ingrijorat": "îngrijorat",
  "infricosat": "înfricoșat",
  "invoiat":    "învoiat",

  // Greșeli comune de tastare
  "vreo":       "vreo",
  "vreu":       "vreau",
  "vrea":       "vrea",
  "vrei":       "vrei",
  "avem":       "avem",
  "facem":      "facem",
  "putem":      "putem",
  "suntem":     "suntem",
  "merge":      "merge",
  "mearga":     "meargă",
  "spuna":      "spună",
  "vada":       "vadă",
  "poata":      "poată",
  "treaca":     "treacă",
  "placa":      "placă",
  "zica":       "zică",

  // Salutări
  "buna":       "bună",
  "bun":        "bun",
  "neata":      "neața",

  // Stare fizica / emotie
  "rau":        "rău",
  "raul":       "răul",
  "rea":        "rea",
  "bolnav":     "bolnav",
  "obosit":     "obosit",
  "trist":      "trist",
  "fericit":    "fericit",
  "suparat":    "supărat",
  "suparata":   "supărată",
  "speriat":    "speriat",
  "speriata":   "speriată",
  "racit":      "răcit",
  "oboseala":   "oboseală",
  "durere":     "durere",
  "foame":      "foame",
  "sete":       "sete",
  "somn":       "somn",

  // Verbe comune fara diacritice
  "vreau":      "vreau",
  "stiu":       "știu",
  "pot":        "pot",
  "trebuie":    "trebuie",
  "merg":       "merg",
  "vine":       "vine",
  "este":       "este",
  "sunt":       "sunt",
  "eram":       "eram",
  "aveam":      "aveam",
  "simti":      "simți",
  "simte":      "simte",
  "simtit":     "simțit",
  "simteam":    "simțeam",
  "zici":       "zici",
  "zice":       "zice",
  "spui":       "spui",
  "spune":      "spune",

  // Timp
  "ieri":       "ieri",
  "azi":        "azi",
  "maine":      "mâine",
  "acum":       "acum",
  "dupa":       "după",
  "inainte":    "înainte",
  "tarziu":     "târziu",
  "devreme":    "devreme",
  "astazi":     "astăzi",
  "aseara":     "aseară",
  "diseara":    "diseară",
  "noaptea":    "noaptea",
  "dimineata":  "dimineață",
};

// ══════════════════════════════════════════════════════════════
// FUZZY MATCHING — distanță Levenshtein 1 pentru typo-uri
// Ex: "bluna"→"buna"→"bună", "bna"→"buna"→"bună"
// ══════════════════════════════════════════════════════════════

function _leaLev(a, b) {
  var m = a.length, n = b.length;
  if (Math.abs(m - n) > 1) return 99;
  var prev = [], curr = [];
  for (var j = 0; j <= n; j++) prev[j] = j;
  for (var i = 1; i <= m; i++) {
    curr[0] = i;
    for (var j = 1; j <= n; j++) {
      curr[j] = a[i-1] === b[j-1]
        ? prev[j-1]
        : 1 + Math.min(prev[j], curr[j-1], prev[j-1]);
    }
    var tmp = prev; prev = curr; curr = tmp;
  }
  return prev[n];
}

function leaFuzzyLookup(lower) {
  if (!lower || lower.length < 4 || typeof LEA_RO_DICT === 'undefined') return null;
  var keys = Object.keys(LEA_RO_DICT);
  var best = null, bestDist = 2;
  for (var i = 0; i < keys.length; i++) {
    var k = keys[i];
    if (Math.abs(k.length - lower.length) > 1) continue;
    if (LEA_RO_DICT[k] === k) continue; // skip identity entries
    var d = _leaLev(lower, k);
    if (d === 1 && d < bestDist) { bestDist = d; best = LEA_RO_DICT[k]; }
  }
  return best;
}

// ══════════════════════════════════════════════════════════════
// CORECȚIE FRAZE — înlocuiește expresii multi-cuvânt
// Rulează înaintea corecției per-cuvânt
// ══════════════════════════════════════════════════════════════

function leaCorrectFraze(text) {
  if (typeof LEA_RO_FRAZE === 'undefined') return text;

  var keys = Object.keys(LEA_RO_FRAZE).sort(function(a, b) { return b.length - a.length; });
  var result = text;

  for (var i = 0; i < keys.length; i++) {
    var phrase = keys[i];
    var escaped = phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    var regex = new RegExp('(^|[\\s,;:.!?])(' + escaped + ')(?=[\\s,;:.!?]|$)', 'gi');
    var repl = LEA_RO_FRAZE[phrase];
    result = result.replace(regex, function(match, pre, word) {
      var r = repl;
      if (word.charAt(0) !== word.charAt(0).toLowerCase()) {
        r = r.charAt(0).toUpperCase() + r.slice(1);
      }
      return pre + r;
    });
  }
  return result;
}

// ══════════════════════════════════════════════════════════════
// CORECȚIE — aplică pe text complet
// ══════════════════════════════════════════════════════════════

function leaCorrect(text) {
  if (!text || text.trim().length === 0) return text;

  // 1. Corecție fraze multi-cuvânt
  var phraseChanged = false;
  if (typeof LEA_RO_FRAZE !== 'undefined') {
    var afterFraze = leaCorrectFraze(text);
    if (afterFraze !== text) { text = afterFraze; phraseChanged = true; }
  }

  // 2. Corecție per-cuvânt
  var words = text.split(/(\s+)/); // păstrează spațiile
  var wordChanged = false;

  var corrected = words.map(function(token) {
    // Skip spații și punctuație
    if (/^\s+$/.test(token)) return token;

    // Curăță punctuația din jur pentru lookup
    var punct = token.match(/^([^a-zA-ZăâîșțĂÂÎȘȚ]*)(.*?)([^a-zA-ZăâîșțĂÂÎȘȚ]*)$/);
    if (!punct) return token;

    var pre  = punct[1] || '';
    var word = punct[2] || '';
    var post = punct[3] || '';

    var lower = word.toLowerCase();
    var dedup = lower.replace(/(.)\1+/g, '$1');
    var fix = LEA_CORRECT_MAP[lower];

    // Litere duble (bunaa→buna, stiiu→stiu)
    if (!fix && dedup !== lower) fix = LEA_CORRECT_MAP[dedup];

    // Fallback la dicționar mare (skip cuvinte ambigue)
    if (!fix && typeof LEA_RO_DICT !== 'undefined') {
      var excl = typeof LEA_RO_EXCLUDE_SET !== 'undefined' && LEA_RO_EXCLUDE_SET.has(lower);
      if (!excl) {
        fix = LEA_RO_DICT[lower];
        if (!fix && dedup !== lower) fix = LEA_RO_DICT[dedup];
      }
    }

    // Fuzzy matching (distanță 1) — prinde typo-uri cu literă greșită/în plus/lipsă
    if (!fix) {
      fix = leaFuzzyLookup(lower);
      if (!fix && dedup !== lower) fix = leaFuzzyLookup(dedup);
    }

    if (!fix) return token;

    // Păstrează majuscula dacă era
    if (word.charAt(0) === word.charAt(0).toUpperCase() && word.charAt(0) !== word.charAt(0).toLowerCase()) {
      fix = fix.charAt(0).toUpperCase() + fix.slice(1);
    }

    wordChanged = true;
    return pre + fix + post;
  });

  return { text: corrected.join(''), changed: phraseChanged || wordChanged };
}

// ══════════════════════════════════════════════════════════════
// APLICĂ PE INPUT ÎNAINTE DE TRIMITERE
// Returnează textul corectat + flag dacă s-a schimbat ceva
// ══════════════════════════════════════════════════════════════

function leaCorrectInput(inputEl) {
  if (!inputEl) return '';
  var original = inputEl.value;
  var result = leaCorrect(original);
  if (result && result.changed) {
    inputEl.value = result.text;
    return result.text;
  }
  return original;
}

