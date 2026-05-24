/**
 * VV HiQ — Hybrid intelligence Quantum (probabilistic)
 * Formula: Output = (Token × Nor_Emoție) + Nor_Timp + Nor_Memorie
 * © VV Technologies · Cosmin Toma
 *
 * Nu e cuantic hardware — e gândire cuantică ca filozofie:
 * fiecare token are mai multe stări posibile cu ponderi,
 * HiQ colapsează la cea mai probabilă stare din context.
 */
(function (global) {
  'use strict';

  if (!global.VVNori) {
    console.warn('VV HiQ: VVNori lipsește — încarcă 09-vv-hiq-clouds.js primul.');
    return;
  }

  var Nori = global.VVNori;

  /* ── Mapare mood din tokenizer → cheie nor-emoție ── */
  var MOOD_MAP = {
    fericit: 'fericit', bucuros: 'fericit', vesel: 'fericit', bine: 'fericit',
    trist: 'trist', melancolic: 'trist', suparat: 'trist',
    furios: 'furios', nervos: 'furios', enervat: 'furios',
    speriat: 'speriat', anxios: 'speriat', ingrijorat: 'speriat',
    surprins: 'surprins', uimit: 'surprins',
    linistit: 'linistit', calm: 'linistit', relaxat: 'linistit', meditativ: 'linistit',
    indragostit: 'indragostit', romantic: 'indragostit', dragoste: 'indragostit',
    obosit: 'obosit', somnoros: 'obosit', epuizat: 'obosit'
  };

  /* ── Mapare timp din tokenizer → cheie nor-timp ── */
  var TIMP_MAP = {
    dimineata: 'dimineata', 'dis-de-dimineata': 'dimineata',
    zi: 'zi', 'in-zi': 'zi',
    amiaza: 'amiaza', 'la-amiaza': 'amiaza',
    dupa_amiaza: 'dupa_amiaza', 'dupa-amiaza': 'dupa_amiaza',
    apus: 'apus', sunset: 'apus',
    seara: 'seara',
    noapte: 'noapte',
    'miezul-noptii': 'miezul_noptii', miezul_noptii: 'miezul_noptii'
  };

  /* ── Mapare sezon ── */
  var SEZON_MAP = {
    primavara: 'primavara', vara: 'vara', toamna: 'toamna', iarna: 'iarna'
  };

  /* ── Mapare vreme ── */
  var VREME_MAP = {
    ploaie: 'ploaie', ninge: 'ninge', ceata: 'ceata',
    soare: 'soare', insorit: 'soare', vant: 'vant', vântat: 'vant'
  };

  /* ── Collapse principal ── */
  function collapse(parsed) {
    /* 1. Rezolvă starea de emoție */
    var moodKey = (parsed.mood && MOOD_MAP[parsed.mood]) || 'neutru';
    var norEm  = Nori.emotie[moodKey]  || Nori.emotie.neutru;
    var norViz = Nori.vizual[moodKey]  || Nori.vizual.neutru;
    var norSon = Nori.sonor[moodKey]   || Nori.sonor.neutru;

    /* 2. Rezolvă modificatorul de timp */
    var timpKey  = (parsed.time   && TIMP_MAP[parsed.time])   || 'zi';
    var sezonKey = (parsed.season && SEZON_MAP[parsed.season]) || null;
    var vremeKey = (parsed.weather && VREME_MAP[parsed.weather]) || null;

    var norTimpOre  = Nori.timp.ore[timpKey]                || Nori.timp.ore.zi;
    var norTimpSez  = sezonKey ? (Nori.timp.sezoane[sezonKey] || {}) : {};
    var norTimpVr   = vremeKey ? (Nori.timp.vreme[vremeKey]   || {}) : {};

    /* 3. Nor-memorie (personal) */
    var personal = Nori.personal.load();

    /* 4. Formula HiQ — colaps ponderat */
    var intensitate = norEm.intensitate
      * (norTimpOre.lumina || 1)
      * personal.intensitatePreferata;

    var lumina = norEm.lumina
      * (norTimpOre.lumina || 1)
      + (norTimpVr.lumina  || 0);
    lumina = Math.max(0.1, Math.min(2.0, lumina));

    var ritm = norEm.ritm * personal.ritmulPreferit;

    var bpm = Math.round(
      norSon.bpm
      * (norTimpOre.lumina || 1)         // zi = mai alert, noapte = mai lent
      * (norTimpSez.bonus !== undefined ? (1 + norTimpSez.bonus) : 1)
    );

    var saturatie = (norTimpOre.saturatie || 1)
      * (norTimpSez.saturatie || 1)
      + (norTimpVr.saturatie !== undefined ? norTimpVr.saturatie - 1 : 0);
    saturatie = Math.max(0.2, Math.min(1.5, saturatie));

    var culoareAccent = norViz.accent;
    if (personal.stilPreferatCuloare) culoareAccent = personal.stilPreferatCuloare;

    /* 5. Bonus total din nori de timp */
    var bonus = (norTimpOre.bonus || 0)
              + (norTimpSez.bonus || 0)
              + (norTimpVr.bonus  || 0);

    /* 6. Verdele (relevant pentru copaci, păduri) */
    var verdele = norTimpSez.verdele !== undefined ? norTimpSez.verdele : 1.0;

    return {
      moodKey:       moodKey,
      intensitate:   +intensitate.toFixed(3),
      lumina:        +lumina.toFixed(3),
      ritm:          +ritm.toFixed(3),
      saturatie:     +saturatie.toFixed(3),
      bonus:         +bonus.toFixed(3),
      verdele:       +verdele.toFixed(3),
      culoareCer:    norViz.cerul,
      culoareAccent: culoareAccent,
      stele:         norViz.stele,
      noriViz:       norViz.nori,
      bpm:           bpm,
      gama:          norSon.gama,
      reverb:        norSon.reverb,
      temp:          norTimpOre.temp || 'neutru'
    };
  }

  /* ── Aplică rezultatul HiQ ca override HiR ── */
  function applyToHiR(hiq) {
    var HiR = global.VVHiR;
    if (!HiR) return;

    /* Modulează legile HiR cu valorile HiQ (fără a le suprascrie definitiv) */
    HiR.state._hiqLumina    = hiq.lumina;
    HiR.state._hiqRitm      = hiq.ritm;
    HiR.state._hiqIntensitate = hiq.intensitate;
    HiR.state._hiqVerdele   = hiq.verdele;
    HiR.state._hiqBpm       = hiq.bpm;
    HiR.state._hiqGama      = hiq.gama;
    HiR.state._hiqAccent    = hiq.culoareAccent;
    HiR.state._hiqCer       = hiq.culoareCer;
  }

  /* ── Hook beforeRender: injectează HiQ înainte de compunere ── */
  function installHook() {
    var HiR = global.VVHiR;
    if (!HiR || !HiR.use) return;

    HiR.use('beforeRender', function (ctx) {
      var hiq = collapse(ctx.parsed);
      applyToHiR(hiq);
      ctx._hiq = hiq;

      /* Aplică modulare pe legile active (temporar, per-render) */
      ctx._lawsOrig = {
        lumina: ctx.laws.lumina,
        ritm:   ctx.laws.ritm
      };
      ctx.laws.lumina = +(ctx.laws.lumina * hiq.lumina).toFixed(3);
      ctx.laws.ritm   = +(ctx.laws.ritm   * hiq.ritm).toFixed(3);
    });

    HiR.use('afterRender', function (ctx) {
      /* Restaurează legile după render */
      if (ctx._lawsOrig) {
        ctx.laws.lumina = ctx._lawsOrig.lumina;
        ctx.laws.ritm   = ctx._lawsOrig.ritm;
      }
    });
  }

  /* ── API public ── */
  var HiQ = {
    version: '1.0.0',
    name: 'VV HiQ',

    collapse: collapse,
    applyToHiR: applyToHiR,
    installHook: installHook,

    /* Înregistrează o preferință personală observată */
    learn: function (key, value) {
      Nori.personal.record(key, value);
    },

    /* Returnează starea curentă a norului personal */
    personalState: function () {
      return Nori.personal.load();
    }
  };

  /* Auto-install dacă HiR e deja prezent */
  if (global.VVHiR) {
    installHook();
  } else {
    /* Așteaptă HiR să fie încărcat */
    var _retries = 0;
    var _wait = setInterval(function () {
      if (global.VVHiR) {
        clearInterval(_wait);
        installHook();
      } else if (++_retries > 20) {
        clearInterval(_wait);
        console.warn('VV HiQ: VVHiR nu a apărut în 2s — hook neinstalat.');
      }
    }, 100);
  }

  global.VVHiQ = HiQ;

})(typeof window !== 'undefined' ? window : this);
