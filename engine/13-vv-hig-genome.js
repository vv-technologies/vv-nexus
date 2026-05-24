/**
 * VV HiG — Genomul Personajului v1.0
 * ADN vizual per personaj, persistent în nor-personal (localStorage)
 * Un "om" = mereu TU, nu un generic
 * © VV Technologies · Cosmin Toma
 */
(function (global) {
  'use strict';

  var KEY = 'vv_hig_genome';

  var DEFAULTS = {
    prenume:      '',
    skin:         0,          /* 0=deschis 1=mediu 2=măsliniu 3=închis */
    hair:         'saten',    /* negru|saten|blond|roscat|alb|gri */
    shirt:        'albastru', /* orice din SHIRT_COLORS */
    height:       1.0,        /* 0.75 – 1.35 */
    mood_default: 'neutru',
    setup_done:   false
  };

  var HAIR_HEX = {
    negru: 0x120c04, saten: 0x2e1c0a, blond: 0xc8a040,
    roscat: 0x8a3010, alb: 0xd8d0c8, gri: 0x909090
  };

  var SHIRT_VALID = ['albastru','verde','rosu','portocaliu','negru','alb','galben','mov'];

  /* ── Normalizare universală (fără diacritice) ── */
  function norm(s) {
    return (s || '').toLowerCase()
      .replace(/[ăâ]/g, 'a').replace(/[îí]/g, 'i')
      .replace(/[șş]/g, 's').replace(/[țţ]/g, 't')
      .replace(/[éèê]/g, 'e').replace(/[^\w\s]/g, ' ');
  }

  /* ── Parser limbaj natural → câmpuri genome ── */
  function parseText(text) {
    var n = norm(text);
    var up = {};

    /* Prenume */
    var nm = n.match(/(?:ma cheama|cheama|numele meu(?: este| e)?|sunt|me call|name is|mi chiamo|je suis|ich bin)\s+([a-z]{2,20})/);
    if (nm) up.prenume = nm[1].charAt(0).toUpperCase() + nm[1].slice(1);

    /* Păr */
    var HAIR_MAP = [
      ['par negru|negru par|black hair|cheveux noirs', 'negru'],
      ['par saten|saten|brunet|brown hair', 'saten'],
      ['par blond|blond|blonde|golden hair', 'blond'],
      ['par roscat|roscat|rosu|auburn|red hair', 'roscat'],
      ['par alb|alb par|white hair|cheveux blancs', 'alb'],
      ['par gri|gri|grey hair|gray hair', 'gri']
    ];
    HAIR_MAP.forEach(function (pair) {
      if (pair[0].split('|').some(function (p) { return n.indexOf(p) >= 0; }))
        up.hair = pair[1];
    });

    /* Ten */
    if (/ten deschis|piele deschisa|piele alba|fair skin|light skin/.test(n)) up.skin = 0;
    else if (/ten mediu|piele medie|olive skin|mediterane/.test(n)) up.skin = 2;
    else if (/ten inchis|piele inchisa|dark skin/.test(n)) up.skin = 3;

    /* Cămașă */
    SHIRT_VALID.forEach(function (c) {
      if (n.indexOf('camasa ' + c) >= 0 || n.indexOf(c + ' camasa') >= 0 ||
          n.indexOf('tricou ' + c) >= 0 || n.indexOf(c + ' shirt') >= 0) up.shirt = c;
    });

    /* Înălțime */
    if (/\binalt\b|inalta|tall|grand/.test(n))   up.height = 1.22;
    else if (/\bscund\b|mic de statura|short|petit/.test(n)) up.height = 0.82;
    else if (/\bmediu\b|medie|average height/.test(n))       up.height = 1.0;

    /* Mood default */
    if (/\boptimist\b|vesel|fericit|cheerful/.test(n))  up.mood_default = 'fericit';
    else if (/\bserios\b|calm|linistit|serene/.test(n)) up.mood_default = 'liniste';

    return up;
  }

  /* ── Comenzi Director rapid (schimbă cămașa, părul etc.) ── */
  function parseDirectorCmd(text) {
    var n = norm(text);
    var up = {};

    /* "schimbă cămașa la/în roșu" */
    var shirtMatch = n.match(/(?:schimba|fa|pune).{0,12}camasa.{0,6}(?:la|in|pe)?\s+(\w+)/);
    if (shirtMatch && SHIRT_VALID.indexOf(shirtMatch[1]) >= 0) up.shirt = shirtMatch[1];

    /* "schimbă părul la blond" */
    var hairMatch = n.match(/(?:schimba|fa|pune).{0,8}par.{0,6}(?:la|in)?\s+(\w+)/);
    if (hairMatch && HAIR_HEX[hairMatch[1]]) up.hair = hairMatch[1];

    /* "fă-l mai înalt / scund" */
    if (/mai inalt|creste inaltimea|taller/.test(n))  up.height = Math.min((HiG.get().height || 1) + 0.12, 1.35);
    if (/mai scund|mai mic|shorter/.test(n))          up.height = Math.max((HiG.get().height || 1) - 0.12, 0.75);

    return up;
  }

  /* ── API public ── */
  var HiG = {
    version: '1.0.0',

    get: function () {
      try { return Object.assign({}, DEFAULTS, JSON.parse(localStorage.getItem(KEY) || '{}')); }
      catch (e) { return Object.assign({}, DEFAULTS); }
    },

    set: function (fields) {
      var g = HiG.get();
      Object.assign(g, fields);
      g.setup_done = !!(g.prenume);
      try { localStorage.setItem(KEY, JSON.stringify(g)); } catch (e) {}
      return g;
    },

    /* Parse descriere liberă → salvează → returnează ce a înțeles */
    applyDescription: function (text) {
      var up = parseText(text);
      if (!Object.keys(up).length) return null;
      HiG.set(up);
      return up;
    },

    /* Parse comandă director ("schimbă cămașa la roșu") */
    applyCommand: function (text) {
      var up = parseDirectorCmd(text);
      if (!Object.keys(up).length) return null;
      HiG.set(up);
      return up;
    },

    /* Convertește genome → overrides pentru buildHuman() */
    toOverrides: function () {
      var g = HiG.get();
      return {
        skin_idx:     g.skin,
        hair_col:     HAIR_HEX[g.hair] || HAIR_HEX.saten,
        shirt_ov:     g.shirt || 'albastru',
        height_scale: g.height || 1.0,
        mood_ov:      g.mood_default && g.mood_default !== 'neutru' ? g.mood_default : 'auto'
      };
    },

    isSetup:  function () { return !!(HiG.get().prenume); },
    getName:  function () { return HiG.get().prenume || 'Personaj'; },
    reset:    function () { try { localStorage.removeItem(KEY); } catch (e) {} },

    /* Mesaj intro Lea când genomul nu e configurat */
    setupPrompt: function () {
      return 'Nu te cunosc încă. Cum te cheamă și cum arăți? (ex: "Mă cheamă Cosmin, am părul negru, sunt înalt, cămașă albastră")';
    },

    /* Rezumat genome pentru afișare */
    summary: function () {
      var g = HiG.get();
      if (!g.prenume) return 'Genome neconfigurat';
      return g.prenume + ' · păr ' + g.hair + ' · ' + g.shirt + ' · ' +
             (g.height > 1.1 ? 'înalt' : g.height < 0.9 ? 'scund' : 'mediu');
    }
  };

  global.VVHiG = HiG;
  console.log('[VV HiG] v1.0 · ' + (HiG.isSetup() ? HiG.summary() : 'neconfigurat'));

})(typeof window !== 'undefined' ? window : this);
