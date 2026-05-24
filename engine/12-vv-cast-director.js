/**
 * VV Cast Director v1.0 — Lea vorbește cu personajul
 * Limbaj natural (RO/EN/FR) → comenzi 3D smooth pe personajul activ
 * © VV Technologies · Cosmin Toma
 */
(function (global) {
  'use strict';

  var PI = Math.PI;

  function norm(s) {
    return (s || '').toLowerCase()
      .replace(/[ăâ]/g, 'a').replace(/[îí]/g, 'i')
      .replace(/[șş]/g, 's').replace(/[țţ]/g, 't')
      .replace(/ó/g, 'o').replace(/[éèê]/g, 'e')
      .replace(/[^\w\s]/g, ' ');
  }

  /* ════════════════════════════════════════
     COMENZI — {test: regex, fn: function(ch)}
     ch = obiectul returnat de buildHuman (are setTarget, armL, armR, headPivot, legL, legR, root)
  ════════════════════════════════════════ */
  var CMDS = [

    /* ── MÂNA / BRAȚUL DREPT ── */
    { test: /ridica.{0,14}(man|brat).{0,10}(drept|dreapta|right)/,
      fn: function (ch) {
        ch.setTarget('aRz', ch.armR.shoulder.rotation, 'z',  PI * 0.82);
        ch.setTarget('aRx', ch.armR.shoulder.rotation, 'x',  0);
      }},
    { test: /coboara.{0,14}(man|brat).{0,10}(drept|dreapta|right)/,
      fn: function (ch) {
        ch.setTarget('aRz', ch.armR.shoulder.rotation, 'z',  0.12);
        ch.setTarget('aRx', ch.armR.shoulder.rotation, 'x',  0);
        ch.setTarget('aRex', ch.armR.elbow.rotation, 'x', 0);
      }},
    { test: /intinde.{0,14}(man|brat).{0,10}(drept|dreapta|right)|inainte.{0,6}(drept|dreapta)/,
      fn: function (ch) {
        ch.setTarget('aRx', ch.armR.shoulder.rotation, 'x', -PI * 0.52);
        ch.setTarget('aRz', ch.armR.shoulder.rotation, 'z',  0.12);
        ch.setTarget('aRex', ch.armR.elbow.rotation, 'x', 0);
      }},
    { test: /indoaie.{0,10}(cot|brat).{0,10}(drept|dreapta)/,
      fn: function (ch) { ch.setTarget('aRex', ch.armR.elbow.rotation, 'x', -PI * 0.55); }},

    /* ── MÂNA / BRAȚUL STÂNG ── */
    { test: /ridica.{0,14}(man|brat).{0,10}(stang|stanga|left)/,
      fn: function (ch) {
        ch.setTarget('aLz', ch.armL.shoulder.rotation, 'z', -PI * 0.82);
        ch.setTarget('aLx', ch.armL.shoulder.rotation, 'x',  0);
      }},
    { test: /coboara.{0,14}(man|brat).{0,10}(stang|stanga|left)/,
      fn: function (ch) {
        ch.setTarget('aLz', ch.armL.shoulder.rotation, 'z', -0.12);
        ch.setTarget('aLx', ch.armL.shoulder.rotation, 'x',  0);
        ch.setTarget('aLex', ch.armL.elbow.rotation, 'x', 0);
      }},
    { test: /intinde.{0,14}(man|brat).{0,10}(stang|stanga|left)|inainte.{0,6}(stang|stanga)/,
      fn: function (ch) {
        ch.setTarget('aLx', ch.armL.shoulder.rotation, 'x', -PI * 0.52);
        ch.setTarget('aLz', ch.armL.shoulder.rotation, 'z', -0.12);
        ch.setTarget('aLex', ch.armL.elbow.rotation, 'x', 0);
      }},
    { test: /indoaie.{0,10}(cot|brat).{0,10}(stang|stanga)/,
      fn: function (ch) { ch.setTarget('aLex', ch.armL.elbow.rotation, 'x', -PI * 0.55); }},

    /* ── AMBELE BRAȚE ── */
    { test: /ridica.{0,10}(ambele|maini|brate|mains|hands)|maini.{0,6}sus/,
      fn: function (ch) {
        ch.setTarget('aLz', ch.armL.shoulder.rotation, 'z', -PI * 0.82);
        ch.setTarget('aRz', ch.armR.shoulder.rotation, 'z',  PI * 0.82);
        ch.setTarget('aLx', ch.armL.shoulder.rotation, 'x', 0);
        ch.setTarget('aRx', ch.armR.shoulder.rotation, 'x', 0);
      }},
    { test: /coboara.{0,10}(ambele|maini|brate)|maini.{0,6}jos/,
      fn: function (ch) {
        ch.setTarget('aLz', ch.armL.shoulder.rotation, 'z', -0.12);
        ch.setTarget('aRz', ch.armR.shoulder.rotation, 'z',  0.12);
        ch.setTarget('aLx', ch.armL.shoulder.rotation, 'x', 0);
        ch.setTarget('aRx', ch.armR.shoulder.rotation, 'x', 0);
      }},
    { test: /deschide.{0,10}(brate|maini)|brate.{0,8}deschise|open.{0,6}arm/,
      fn: function (ch) {
        ch.setTarget('aLz', ch.armL.shoulder.rotation, 'z', -PI * 0.5);
        ch.setTarget('aRz', ch.armR.shoulder.rotation, 'z',  PI * 0.5);
        ch.setTarget('aLx', ch.armL.shoulder.rotation, 'x', 0);
        ch.setTarget('aRx', ch.armR.shoulder.rotation, 'x', 0);
      }},
    { test: /incrucis.{0,8}(brate|maini)|brate.{0,6}incrucis/,
      fn: function (ch) {
        ch.setTarget('aLz', ch.armL.shoulder.rotation, 'z', -PI * 0.18);
        ch.setTarget('aLx', ch.armL.shoulder.rotation, 'x', -0.35);
        ch.setTarget('aRz', ch.armR.shoulder.rotation, 'z',  PI * 0.18);
        ch.setTarget('aRx', ch.armR.shoulder.rotation, 'x', -0.35);
      }},
    { test: /pune.{0,10}(man|maini).{0,10}(sold|solduri|hip)/,
      fn: function (ch) {
        ch.setTarget('aLz', ch.armL.shoulder.rotation, 'z', -PI * 0.38);
        ch.setTarget('aLex', ch.armL.elbow.rotation, 'x', 0);
        ch.setTarget('aLez', ch.armL.elbow.rotation, 'z',  PI * 0.48);
        ch.setTarget('aRz', ch.armR.shoulder.rotation, 'z',  PI * 0.38);
        ch.setTarget('aRex', ch.armR.elbow.rotation, 'x', 0);
        ch.setTarget('aRez', ch.armR.elbow.rotation, 'z', -PI * 0.48);
      }},
    { test: /pune.{0,10}(man|maini).{0,10}(cap|frunte|head)/,
      fn: function (ch) {
        ch.setTarget('aLz', ch.armL.shoulder.rotation, 'z', -PI * 0.9);
        ch.setTarget('aRz', ch.armR.shoulder.rotation, 'z',  PI * 0.9);
      }},
    { test: /intinde.{0,8}(ambele|brate|maini).{0,8}(inainte|forward)/,
      fn: function (ch) {
        ch.setTarget('aLx', ch.armL.shoulder.rotation, 'x', -PI * 0.5);
        ch.setTarget('aLz', ch.armL.shoulder.rotation, 'z', -0.12);
        ch.setTarget('aRx', ch.armR.shoulder.rotation, 'x', -PI * 0.5);
        ch.setTarget('aRz', ch.armR.shoulder.rotation, 'z',  0.12);
      }},

    /* ── CAP ── */
    { test: /intoarce.{0,8}cap.{0,10}(stang|stanga|left)|priveste.{0,6}(stang|stanga|left)/,
      fn: function (ch) { ch.setTarget('hdY', ch.headPivot.rotation, 'y',  0.72); }},
    { test: /intoarce.{0,8}cap.{0,10}(drept|dreapta|right)|priveste.{0,6}(drept|dreapta|right)/,
      fn: function (ch) { ch.setTarget('hdY', ch.headPivot.rotation, 'y', -0.72); }},
    { test: /uita.{0,6}(in )?sus|ridica.{0,6}(cap|privirea)|look.{0,4}up/,
      fn: function (ch) { ch.setTarget('hdX', ch.headPivot.rotation, 'x', -0.58); }},
    { test: /uita.{0,6}(in )?jos|pleaca.{0,6}(cap|privirea)|look.{0,4}down/,
      fn: function (ch) { ch.setTarget('hdX', ch.headPivot.rotation, 'x',  0.58); }},
    { test: /inclina.{0,6}cap.{0,8}(stang|stanga|left)/,
      fn: function (ch) { ch.setTarget('hdZ', ch.headPivot.rotation, 'z',  0.38); }},
    { test: /inclina.{0,6}cap.{0,8}(drept|dreapta|right)/,
      fn: function (ch) { ch.setTarget('hdZ', ch.headPivot.rotation, 'z', -0.38); }},
    { test: /priveste.{0,8}(inainte|fata|forward)|intoarce.{0,8}fata|drepte|cap.{0,4}drept/,
      fn: function (ch) {
        ch.setTarget('hdY', ch.headPivot.rotation, 'y', 0);
        ch.setTarget('hdX', ch.headPivot.rotation, 'x', 0);
        ch.setTarget('hdZ', ch.headPivot.rotation, 'z', 0);
      }},

    /* ── ROTIRE CORP ── */
    { test: /roteste.{0,8}(stang|stanga|left)|intoarce.{0,8}(corp|spate|spatele)/,
      fn: function (ch) { ch.setTarget('rtY', ch.root.rotation, 'y', ch.root.rotation.y + PI * 0.28); }},
    { test: /roteste.{0,8}(drept|dreapta|right)/,
      fn: function (ch) { ch.setTarget('rtY', ch.root.rotation, 'y', ch.root.rotation.y - PI * 0.28); }},
    { test: /intoarce.{0,8}(spre mine|inainte|fata)|priveste.{0,8}camera/,
      fn: function (ch) { ch.setTarget('rtY', ch.root.rotation, 'y', 0); }},
    { test: /intoarce.{0,8}(cu spatele|spate)/,
      fn: function (ch) { ch.setTarget('rtY', ch.root.rotation, 'y', PI); }},

    /* ── PICIOARE ── */
    { test: /ridica.{0,8}(picior|genunchi).{0,8}(drept|dreapta|right)/,
      fn: function (ch) { ch.setTarget('lRhx', ch.legR.hip.rotation, 'x', -0.75); }},
    { test: /ridica.{0,8}(picior|genunchi).{0,8}(stang|stanga|left)/,
      fn: function (ch) { ch.setTarget('lLhx', ch.legL.hip.rotation, 'x', -0.75); }},
    { test: /coboara.{0,8}(picior|genunchi).{0,8}(drept|dreapta)/,
      fn: function (ch) { ch.setTarget('lRhx', ch.legR.hip.rotation, 'x', 0); }},
    { test: /coboara.{0,8}(picior|genunchi).{0,8}(stang|stanga)/,
      fn: function (ch) { ch.setTarget('lLhx', ch.legL.hip.rotation, 'x', 0); }},

    /* ── RESET ── */
    { test: /pozitie.{0,8}(normala|neutra|reset|default)|da.{0,4}drumul|relaxeaza|stand.{0,4}normal/,
      fn: function (ch) {
        ch.setTarget('aLz', ch.armL.shoulder.rotation, 'z', -0.12);
        ch.setTarget('aRz', ch.armR.shoulder.rotation, 'z',  0.12);
        ch.setTarget('aLx', ch.armL.shoulder.rotation, 'x', 0);
        ch.setTarget('aRx', ch.armR.shoulder.rotation, 'x', 0);
        ch.setTarget('aLex', ch.armL.elbow.rotation, 'x', 0);
        ch.setTarget('aRex', ch.armR.elbow.rotation, 'x', 0);
        ch.setTarget('aLez', ch.armL.elbow.rotation, 'z', 0);
        ch.setTarget('aRez', ch.armR.elbow.rotation, 'z', 0);
        ch.setTarget('hdX', ch.headPivot.rotation, 'x', 0);
        ch.setTarget('hdY', ch.headPivot.rotation, 'y', 0);
        ch.setTarget('hdZ', ch.headPivot.rotation, 'z', 0);
        ch.setTarget('lLhx', ch.legL.hip.rotation, 'x', 0);
        ch.setTarget('lRhx', ch.legR.hip.rotation, 'x', 0);
        ch.setTarget('rtY', ch.root.rotation, 'y', 0);
      }},
  ];

  /* ════════════════════════════════════════
     DETECTARE: comandă personaj vs scenă nouă
  ════════════════════════════════════════ */
  var SCENE_WORDS = [
    'soare','ploaie','ninge','furtuna','ceata','vant','cer','padure','munte',
    'mare','noapte','dimineata','seara','toamna','primavara','vara','iarna',
    'casa','oras','camp','desert','ocean','lac','rau','apus','rasarit',
    'sun','rain','snow','mountain','forest','night','morning','city'
  ];
  var CMD_VERBS = [
    'ridica','coboara','intoarce','uita','roteste','pune','deschide',
    'intinde','incrucis','inclina','priveste','indoaie','relaxeaza','pozitie',
    'raise','lower','turn','look','rotate','open','cross','stretch'
  ];

  var Director = {
    version: '1.0.0',

    isCommand: function (text) {
      var n = norm(text);
      if (SCENE_WORDS.some(function (w) { return n.indexOf(w) >= 0; })) return false;
      return CMD_VERBS.some(function (v) { return n.indexOf(v) >= 0; });
    },

    apply: function (text, charIdx) {
      if (!global.VVCast || !global.VVCast._chars.length) return false;
      var ch = global.VVCast._chars[charIdx !== undefined ? charIdx : 0];
      if (!ch || !ch.setTarget) return false;
      var n = norm(text);
      for (var i = 0; i < CMDS.length; i++) {
        if (CMDS[i].test.test(n)) {
          CMDS[i].fn(ch);
          return true;
        }
      }
      return false;
    },

    listCommands: function () {
      return [
        'ridică mâna dreaptă / stângă / ambele',
        'coboară mâna dreaptă / stângă',
        'întinde mâna dreaptă / stângă înainte',
        'îndoaie cotul drept / stâng',
        'deschide brațele',
        'încrucișează brațele',
        'pune mâinile pe șold / cap',
        'întoarce capul stânga / dreapta',
        'uită-te în sus / în jos',
        'înclină capul stânga / dreapta',
        'privește înainte',
        'ridică piciorul drept / stâng',
        'rotește stânga / dreapta',
        'întoarce-te cu spatele / spre mine',
        'poziție normală (reset)',
      ];
    }
  };

  global.VVCastDirector = Director;
  console.log('[VV Cast Director] v1.0 — limbaj natural → personaj 3D · ' + CMDS.length + ' comenzi');

})(typeof window !== 'undefined' ? window : this);
