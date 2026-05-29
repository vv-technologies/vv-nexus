// VV Profile Engine — Rafturi Structurate
// Cosmin Toma / VV Hybrid Universe
// Familie, Job, Plăceri, Mâncare, Locație — al tău, pe device-ul tău.

var VVProfile = (function () {

  var _d = null;

  var _blank = {
    familie: {
      partener:  null,   // { nume, rol: 'soție'|'soț'|'prietenă'|'prieten' }
      copii:     [],     // [{ nume, varsta }]
      parinti:   {}      // { mama, tata }
    },
    job: {
      titlu:      null,
      angajator:  null,
      domeniu:    null,
      secundar:   null,
      placeri:    [],
      nemultumiri:[]
    },
    placeri: {
      hobby:      [],
      sport:      null,
      muzica:     null,
      calatorii:  []
    },
    mancare: {
      favorite:   [],
      evita:      [],
      alergii:    []
    },
    loc: {
      oras:       null,
      cartier:    null,
      tara:       null
    }
  };

  // ── LOAD / SAVE ───────────────────────────────────────────────

  function _load() {
    if (_d) return _d;
    try {
      var raw = localStorage.getItem('vv_profile_v1');
      _d = raw ? JSON.parse(raw) : JSON.parse(JSON.stringify(_blank));
    } catch(e) {
      _d = JSON.parse(JSON.stringify(_blank));
    }
    return _d;
  }

  function _save() {
    try { localStorage.setItem('vv_profile_v1', JSON.stringify(_d)); } catch(e) {}
  }

  function _cap(s) {
    return s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : s;
  }

  function _addUniq(arr, val) {
    var v = (val + '').toLowerCase().trim();
    if (!v || arr.some(function(x){ return x.toLowerCase() === v; })) return;
    arr.push(_cap(val.trim()));
  }

  // ── DETECȚIE DIN TEXT ─────────────────────────────────────────

  var _RE = {
    // Familie
    sotie:     /\b(soți[ae]|partenera?)\s+mea?\b/i,
    sot:       /\b(soțu[rl]|partenerul)\s+meu\b/i,
    iubita:    /\biubita\s+mea\b/i,
    iubit:     /\biubitul\s+meu\b/i,
    copil:     /\bcopil[uo][rl]\s+meu\b|\bfiul\s+meu\b|\bfiica\s+mea\b/i,
    copii_nr:  /\bam\s+(un|o|doi|doua|două|trei|patru|cinci|\d+)\s+cop[il]/i,
    se_cheama: /\bse\s+cheam[aă]\s+([A-ZÁÉÍÓÚĂÂÎȘȚ][a-záéíóúăâîșț]{2,})\b/,
    varsta_X:  /\bare?\s+(\d{1,2})\s+ani\b/i,
    mama:      /\bmama\s+mea\b/i,
    tata:      /\btata[l]?\s+meu\b|\btatăl\s+meu\b/i,

    // Job
    lucrez_la: /\blucrez\s+la\s+([A-Za-zÀ-ž\s]{2,20})\b/i,
    lucrez_ca: /\blucrez\s+ca\s+([A-Za-zÀ-ž\s]{2,20})\b/i,
    lucrez_in: /\blucrez\s+[îi]n\s+([A-Za-zÀ-ž\s]{2,20})\b/i,
    al2lea_job:/\bal\s+doilea\s+job\b|\bmai\s+fac\s+[șs]i\b|\bfreelance\b/i,
    place_job: /\b[îi]mi\s+place\s+la\s+(job|muncă|serviciu)\b/i,
    nu_place_job:/\bnu\s+[îi]mi\s+place\s+la\s+(job|muncă|serviciu)\b/i,

    // Plăceri
    alerg:     /\balerg\b|\bfug\b|\bmaraton\b/i,
    sala:      /\bsal[aă]\b|\bfitness\b|\bsport\b/i,
    muzica:    /\bascult\s+([a-záéíóúăâîșț]{3,15})\b/i,
    calatorie: /\bcalator[ei]\b|\bcalator[ei]sc\b|\btravel\b|\bvoyage\b/i,
    hobby_ador:/\bador\s+s[aă]\s+([a-záéíóúăâîșț\s]{4,25})/i,

    // Mâncare
    ador_manc: /\bador\s+(pizza|paste|sushi|carne|pe[șs]te|brnz[aă]|mncarea|mâncarea|fructele|legumele|[a-záéíóúăâîșț]{3,14})\b/i,
    nu_suport: /\bnu\s+suport\s+([a-záéíóúăâîșț]{3,14})\b|\bnu\s+m[aă]n[aâ]nc\s+([a-záéíóúăâîșț]{3,14})\b/i,
    alergie:   /\bsunt\s+alergic|am\s+alergie\s+la\s+([a-záéíóúăâîșț]{3,14})\b/i
  };

  function learnFromText(text) {
    if (!text || text.length < 3) return;
    var d = _load();
    var t = text;
    var changed = false;

    // ── Familie ───────────────────────────────────────────────
    if (_RE.sotie.test(t) && !d.familie.partener) {
      d.familie.partener = { rol: 'soție', nume: null };
      changed = true;
    }
    if (_RE.sot.test(t) && !d.familie.partener) {
      d.familie.partener = { rol: 'soț', nume: null };
      changed = true;
    }
    if (_RE.iubita.test(t) && !d.familie.partener) {
      d.familie.partener = { rol: 'prietenă', nume: null };
      changed = true;
    }
    if (_RE.iubit.test(t) && !d.familie.partener) {
      d.familie.partener = { rol: 'prieten', nume: null };
      changed = true;
    }

    // Nume partener — "soția mea se cheamă Ana"
    if (d.familie.partener && _RE.se_cheama.test(t)) {
      var mN = t.match(_RE.se_cheama);
      if (mN && !d.familie.partener.nume) {
        d.familie.partener.nume = _cap(mN[1]);
        changed = true;
      }
    }

    // Copil menționat
    if (_RE.copil.test(t)) {
      // Verificam daca avem si un nume
      var mSC = t.match(_RE.se_cheama);
      var mVa = t.match(_RE.varsta_X);
      if (mSC) {
        var numeC = _cap(mSC[1]);
        var existaC = d.familie.copii.find(function(c){ return c.nume === numeC; });
        if (!existaC) {
          d.familie.copii.push({ nume: numeC, varsta: mVa ? parseInt(mVa[1]) : null });
          changed = true;
        }
      } else if (d.familie.copii.length === 0) {
        d.familie.copii.push({ nume: null, varsta: null });
        changed = true;
      }
    }

    // Nr copii
    var mNrC = t.match(_RE.copii_nr);
    if (mNrC && d.familie.copii.length === 0) {
      var nrMap = { 'un':1,'o':1,'doi':2,'doua':2,'două':2,'trei':3,'patru':4,'cinci':5 };
      var nr = nrMap[mNrC[1].toLowerCase()] || parseInt(mNrC[1]) || 1;
      for (var i = 0; i < nr; i++) d.familie.copii.push({ nume: null, varsta: null });
      changed = true;
    }

    if (_RE.mama.test(t) && !d.familie.parinti.mama) {
      var mMama = t.match(_RE.se_cheama);
      d.familie.parinti.mama = mMama ? _cap(mMama[1]) : '?';
      changed = true;
    }
    if (_RE.tata.test(t) && !d.familie.parinti.tata) {
      var mTata = t.match(_RE.se_cheama);
      d.familie.parinti.tata = mTata ? _cap(mTata[1]) : '?';
      changed = true;
    }

    // ── Job ──────────────────────────────────────────────────
    var mLA = t.match(_RE.lucrez_la);
    if (mLA && !d.job.angajator) {
      d.job.angajator = mLA[1].trim();
      changed = true;
    }
    var mCA = t.match(_RE.lucrez_ca);
    if (mCA && !d.job.titlu) {
      d.job.titlu = mCA[1].trim();
      changed = true;
    }
    var mIN = t.match(_RE.lucrez_in);
    if (mIN && !d.job.domeniu) {
      d.job.domeniu = mIN[1].trim();
      changed = true;
    }
    if (_RE.al2lea_job.test(t) && !d.job.secundar) {
      d.job.secundar = '?';
      changed = true;
    }

    // ── Plăceri ───────────────────────────────────────────────
    if (_RE.alerg.test(t) && !d.placeri.sport) {
      d.placeri.sport = 'alergat';
      changed = true;
    } else if (_RE.sala.test(t) && !d.placeri.sport) {
      d.placeri.sport = 'sală/fitness';
      changed = true;
    }

    var mMuz = t.match(_RE.muzica);
    if (mMuz && !d.placeri.muzica) {
      d.placeri.muzica = mMuz[1];
      changed = true;
    }

    if (_RE.calatorie.test(t)) {
      _addUniq(d.placeri.calatorii, 'călătorit');
      changed = true;
    }

    var mHob = t.match(_RE.hobby_ador);
    if (mHob) {
      _addUniq(d.placeri.hobby, mHob[1].trim());
      changed = true;
    }

    // ── Mâncare ───────────────────────────────────────────────
    var mAM = t.match(_RE.ador_manc);
    if (mAM) {
      _addUniq(d.mancare.favorite, mAM[1]);
      changed = true;
    }

    var mNS = t.match(_RE.nu_suport);
    if (mNS) {
      _addUniq(d.mancare.evita, mNS[1] || mNS[2] || '');
      changed = true;
    }

    if (_RE.alergie.test(t)) {
      var mAl = t.match(_RE.alergie);
      _addUniq(d.mancare.alergii, mAl && mAl[1] ? mAl[1] : 'necunoscută');
      changed = true;
    }

    if (changed) _save();
  }

  // ── SET MANUAL ────────────────────────────────────────────────
  // VVProfile.set('familie', 'partener', { rol:'soție', nume:'Ana' })
  function set(raft, field, value) {
    var d = _load();
    if (!d[raft]) return;
    d[raft][field] = value;
    _save();
  }

  function push(raft, field, value) {
    var d = _load();
    if (!d[raft] || !Array.isArray(d[raft][field])) return;
    _addUniq(d[raft][field], value);
    _save();
  }

  // ── GET ───────────────────────────────────────────────────────
  function get(raft) {
    return _load()[raft] || null;
  }

  function getAll() {
    return _load();
  }

  // ── CE NU ȘTIE — pentru întrebări organice ────────────────────
  // Returnează un obiect cu câmpurile goale, în ordine de prioritate
  function getMissing() {
    var d = _load();
    var missing = [];

    if (!d.familie.partener)
      missing.push({ raft: 'familie', camp: 'partener',  intrebare: 'Ai un partener/parteneră?' });
    if (d.familie.copii.length === 0)
      missing.push({ raft: 'familie', camp: 'copii',     intrebare: 'Ai copii?' });
    if (!d.job.titlu && !d.job.angajator)
      missing.push({ raft: 'job',     camp: 'titlu',     intrebare: 'Ce faci pentru viețuit — job, freelance, altceva?' });
    if (!d.placeri.sport && d.placeri.hobby.length === 0)
      missing.push({ raft: 'placeri', camp: 'hobby',     intrebare: 'Ai un hobby sau ceva ce faci când ai timp?' });
    if (d.mancare.favorite.length === 0)
      missing.push({ raft: 'mancare', camp: 'favorite',  intrebare: 'Ce mâncare îți place cel mai mult?' });

    return missing;
  }

  // ── CONTEXT pentru motor ──────────────────────────────────────
  // Ce poate folosi LEA în răspuns
  function getContext() {
    var d = _load();
    return {
      arePartener:  !!d.familie.partener,
      numePartener: d.familie.partener ? d.familie.partener.nume : null,
      rolPartener:  d.familie.partener ? d.familie.partener.rol  : null,
      areCopii:     d.familie.copii.length > 0,
      nrCopii:      d.familie.copii.length,
      numeleCopii:  d.familie.copii.map(function(c){ return c.nume; }).filter(Boolean),
      job:          d.job.titlu || d.job.angajator || d.job.domeniu,
      areJobSecundar: !!d.job.secundar,
      sport:        d.placeri.sport,
      hobby:        d.placeri.hobby.slice(0, 3),
      mancareFav:   d.mancare.favorite.slice(0, 2),
      mancareEvita: d.mancare.evita.slice(0, 2)
    };
  }

  // ── SUMMARY pentru VV ME popup ────────────────────────────────
  function getSummary() {
    var d = _load();
    var lines = [];

    if (d.familie.partener) {
      var p = d.familie.partener;
      lines.push(p.nume ? 'Ai ' + p.rol + ' — ' + p.nume + '.' : 'Ai ' + p.rol + '.');
    }
    if (d.familie.copii.length > 0) {
      var numite = d.familie.copii.filter(function(c){ return c.nume; }).map(function(c){ return c.nume; });
      if (numite.length > 0) lines.push('Copii: ' + numite.join(', ') + '.');
      else lines.push(d.familie.copii.length === 1 ? 'Ai un copil.' : 'Ai ' + d.familie.copii.length + ' copii.');
    }
    if (d.job.angajator) lines.push('Lucrezi la ' + d.job.angajator + '.');
    else if (d.job.titlu) lines.push('Ești ' + d.job.titlu + '.');
    else if (d.job.domeniu) lines.push('Lucrezi în ' + d.job.domeniu + '.');
    if (d.job.secundar)   lines.push('Mai ai și un al doilea job.');
    if (d.placeri.sport)  lines.push('Faci ' + d.placeri.sport + '.');
    if (d.placeri.hobby.length > 0) lines.push('Îți place să ' + d.placeri.hobby[0].toLowerCase() + '.');
    if (d.mancare.favorite.length > 0) lines.push('Mâncarea ta preferată: ' + d.mancare.favorite[0] + '.');
    if (d.mancare.evita.length > 0)   lines.push('Evitați ' + d.mancare.evita[0] + '.');

    return lines;
  }

  // ── CLEAR ─────────────────────────────────────────────────────
  function clear() {
    _d = null;
    try { localStorage.removeItem('vv_profile_v1'); } catch(e) {}
  }

  return {
    learnFromText: learnFromText,
    set:           set,
    push:          push,
    get:           get,
    getAll:        getAll,
    getMissing:    getMissing,
    getContext:    getContext,
    getSummary:    getSummary,
    clear:         clear
  };

})();

