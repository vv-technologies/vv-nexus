/**
 * VV HiQ — Nori semantici (clouds)
 * Dicționare partajate (NEXUS) + stub personal (localStorage)
 * © VV Technologies · Cosmin Toma
 *
 * NOR-VIZUAL  — culori, forme, intensitate vizuală per emoție
 * NOR-SONOR   — BPM, gamă, reverb, textură sonoră
 * NOR-EMOȚIE  — ponderi de amplificare per stare
 * NOR-TIMP    — modificatori oră din zi / sezon
 */
(function (global) {
  'use strict';

  /* ── NOR-EMOȚIE · ponderi de amplificare ── */
  var NOR_EMOTIE = {
    fericit:   { intensitate: 1.3, lumina: 1.2, ritm: 1.1, culoareHue: 45  },
    trist:     { intensitate: 0.6, lumina: 0.5, ritm: 0.7, culoareHue: 220 },
    furios:    { intensitate: 1.5, lumina: 0.9, ritm: 1.4, culoareHue: 0   },
    speriat:   { intensitate: 0.8, lumina: 0.4, ritm: 1.3, culoareHue: 270 },
    surprins:  { intensitate: 1.2, lumina: 1.1, ritm: 1.2, culoareHue: 60  },
    linistit:  { intensitate: 0.7, lumina: 0.8, ritm: 0.6, culoareHue: 180 },
    indragostit:{ intensitate: 1.1, lumina: 1.3, ritm: 0.9, culoareHue: 340 },
    obosit:    { intensitate: 0.5, lumina: 0.6, ritm: 0.5, culoareHue: 200 },
    neutru:    { intensitate: 1.0, lumina: 1.0, ritm: 1.0, culoareHue: 210 }
  };

  /* ── NOR-VIZUAL · palete + forme per emoție ── */
  var NOR_VIZUAL = {
    fericit:    { cerul: '#1a3a6b', accent: '#f5c842', stele: false, nori: false, lumina: 1.2 },
    trist:      { cerul: '#0a0a1e', accent: '#3a4a6b', stele: true,  nori: true,  lumina: 0.5 },
    furios:     { cerul: '#1a0505', accent: '#c0392b', stele: false, nori: true,  lumina: 0.8 },
    speriat:    { cerul: '#050510', accent: '#6c3483', stele: true,  nori: true,  lumina: 0.4 },
    surprins:   { cerul: '#0d2137', accent: '#f39c12', stele: false, nori: false, lumina: 1.1 },
    linistit:   { cerul: '#0a1628', accent: '#2ecc71', stele: true,  nori: false, lumina: 0.9 },
    indragostit:{ cerul: '#1a0a1e', accent: '#e74c8b', stele: true,  nori: false, lumina: 1.0 },
    obosit:     { cerul: '#0a0a14', accent: '#555577', stele: true,  nori: true,  lumina: 0.5 },
    neutru:     { cerul: '#080814', accent: '#4a6fa5', stele: true,  nori: false, lumina: 0.8 }
  };

  /* ── NOR-SONOR · parametri muzicali per emoție ── */
  var NOR_SONOR = {
    fericit:    { bpm: 120, gama: 'major',    reverb: 0.2, texturaIndex: 0 },
    trist:      { bpm: 60,  gama: 'minor',    reverb: 0.6, texturaIndex: 1 },
    furios:     { bpm: 140, gama: 'phrygian', reverb: 0.1, texturaIndex: 2 },
    speriat:    { bpm: 130, gama: 'diminished', reverb: 0.5, texturaIndex: 3 },
    surprins:   { bpm: 110, gama: 'major',    reverb: 0.3, texturaIndex: 0 },
    linistit:   { bpm: 70,  gama: 'lydian',   reverb: 0.7, texturaIndex: 1 },
    indragostit:{ bpm: 85,  gama: 'major',    reverb: 0.4, texturaIndex: 0 },
    obosit:     { bpm: 55,  gama: 'minor',    reverb: 0.8, texturaIndex: 1 },
    neutru:     { bpm: 90,  gama: 'major',    reverb: 0.3, texturaIndex: 0 }
  };

  /* ── NOR-TIMP · modificatori oră din zi + sezon ── */
  var NOR_TIMP = {
    ore: {
      dimineata: { lumina: 1.1, saturatie: 0.9, temp: 'cald',    bonus: 0.05 },
      zi:        { lumina: 1.3, saturatie: 1.0, temp: 'neutru',  bonus: 0.0  },
      amiaza:    { lumina: 1.4, saturatie: 1.1, temp: 'cald',    bonus: 0.0  },
      dupa_amiaza:{ lumina: 1.2, saturatie: 1.0, temp: 'cald',   bonus: 0.03 },
      apus:      { lumina: 1.0, saturatie: 1.3, temp: 'portocaliu', bonus: 0.1 },
      seara:     { lumina: 0.7, saturatie: 0.8, temp: 'rece',    bonus: 0.0  },
      noapte:    { lumina: 0.4, saturatie: 0.6, temp: 'rece',    bonus: 0.0  },
      miezul_noptii:{ lumina: 0.2, saturatie: 0.4, temp: 'rece', bonus: 0.0  }
    },
    sezoane: {
      primavara: { saturatie: 1.1, verdele: 1.2, bonus: 0.08 },
      vara:      { saturatie: 1.2, verdele: 1.0, bonus: 0.05 },
      toamna:    { saturatie: 1.0, verdele: 0.5, bonus: 0.0  },
      iarna:     { saturatie: 0.6, verdele: 0.1, bonus: 0.0  }
    },
    vreme: {
      ploaie: { lumina: -0.3, saturatie: 0.7, bonus: -0.05 },
      ninge:  { lumina: 0.1,  saturatie: 0.5, bonus: 0.02  },
      ceata:  { lumina: -0.2, saturatie: 0.6, bonus: 0.0   },
      soare:  { lumina: 0.2,  saturatie: 1.1, bonus: 0.05  },
      vant:   { lumina: 0.0,  saturatie: 0.9, bonus: 0.0   }
    }
  };

  /* ── NOR-PERSONAL · stub — datele vin din localStorage ── */
  var NOR_PERSONAL_DEFAULTS = {
    stilPreferatCuloare: null,
    intensitatePreferata: 1.0,
    ritmulPreferit: 1.0,
    subiecteFavorite: [],
    interactiuniRecente: []
  };

  function personalLoad() {
    try {
      var raw = JSON.parse(localStorage.getItem('vv_nor_personal') || 'null');
      if (!raw) return Object.assign({}, NOR_PERSONAL_DEFAULTS);
      return Object.assign({}, NOR_PERSONAL_DEFAULTS, raw);
    } catch (e) {
      return Object.assign({}, NOR_PERSONAL_DEFAULTS);
    }
  }

  function personalSave(data) {
    try { localStorage.setItem('vv_nor_personal', JSON.stringify(data)); } catch (e) {}
  }

  function personalRecord(key, value) {
    var p = personalLoad();
    if (key === 'culoare' && value) p.stilPreferatCuloare = value;
    if (key === 'intensitate' && typeof value === 'number') {
      p.intensitatePreferata = +(p.intensitatePreferata * 0.8 + value * 0.2).toFixed(3);
    }
    if (key === 'ritm' && typeof value === 'number') {
      p.ritmulPreferit = +(p.ritmulPreferit * 0.8 + value * 0.2).toFixed(3);
    }
    if (key === 'subiect' && value && p.subiecteFavorite.indexOf(value) === -1) {
      p.subiecteFavorite.push(value);
      if (p.subiecteFavorite.length > 20) p.subiecteFavorite.shift();
    }
    if (key === 'interactiune') {
      p.interactiuniRecente.push({ v: value, ts: Date.now() });
      if (p.interactiuniRecente.length > 50) p.interactiuniRecente.shift();
    }
    personalSave(p);
  }

  /* ── Export global ── */
  global.VVNori = {
    emotie:   NOR_EMOTIE,
    vizual:   NOR_VIZUAL,
    sonor:    NOR_SONOR,
    timp:     NOR_TIMP,
    personal: { load: personalLoad, save: personalSave, record: personalRecord }
  };

})(typeof window !== 'undefined' ? window : this);
