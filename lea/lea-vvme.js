// VV ME — VVPL Pattern Engine
// Cosmin Toma / VV Hybrid Universe
// Stochează tipare, nu cuvinte. Crește din fiecare conversație.

var VVME = (function () {

  var _p = {};
  try { _p = JSON.parse(localStorage.getItem('vv_me_patterns') || '{}'); } catch(e) {}

  function _save() {
    try { localStorage.setItem('vv_me_patterns', JSON.stringify(_p)); } catch(e) {}
  }

  function _cap(s) {
    return s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : '';
  }

  // ── LEARN — adauga sau intareste un tipar ─────────────────────
  function learn(category, sub, value, intensity, source) {
    if (!category || !sub || !value) return;
    var key = category + ':' + sub + ':' + (value + '').toLowerCase().trim();
    if (_p[key]) {
      _p[key].intensity = Math.min(1.0, _p[key].intensity + 0.12);
      _p[key].count++;
      _p[key].last = Date.now();
    } else {
      _p[key] = {
        cat: category, sub: sub, val: value,
        intensity: intensity || 0.5,
        count: 1,
        source: source || 'explicit',
        first: Date.now(),
        last: Date.now()
      };
    }
    _save();
  }

  // ── DECAY — slabeste tipare neconfirmate ──────────────────────
  function decay() {
    var now = Date.now();
    var changed = false;
    Object.keys(_p).forEach(function(k) {
      var p = _p[k];
      var daysSince = (now - p.last) / 86400000;
      if (daysSince > 7 && p.source === 'observed') {
        p.intensity = Math.max(0.1, p.intensity - 0.05 * Math.floor(daysSince / 7));
        changed = true;
      }
    });
    if (changed) _save();
  }

  // ── FROM KB — extrage din ce a spus explicit ──────────────────
  function learnFromKB(kb) {
    if (!kb) return;
    if (kb.nume)   learn('PERS',  'name', kb.nume.val,   1.0, 'explicit');
    if (kb.varsta) learn('DEMOG', 'age',  kb.varsta.val, 1.0, 'explicit');
    if (kb.job)    learn('JOB',   'field',kb.job.val,    0.9, 'explicit');
    if (kb.oras)   learn('PLACE', 'city', kb.oras.val,   0.9, 'explicit');
    Object.keys(kb).forEach(function(k) {
      if (k.indexOf('place_') === 0) learn('PREF', 'place', kb[k].val, 0.7, 'explicit');
    });
  }

  // ── FROM EMOTION — tipar observat din conversatie ─────────────
  function learnFromEmotion(comportament, hiq, ora, zi) {
    if (!comportament || comportament === 'necunoscut' || comportament === 'chat') return;
    if (hiq.intensitate < 0.35) return; // ignoram semnale slabe

    var timeSlot = ora < 10 ? 'dimineata' : ora < 17 ? 'dupa-amiaza' : ora < 22 ? 'seara' : 'noapte';
    var days = ['duminica','luni','marti','miercuri','joi','vineri','sambata'];
    var dayName = days[zi] || '';

    learn('MOOD', comportament, timeSlot, hiq.intensitate * 0.8, 'observed');
    if (dayName) learn('MOOD', comportament, dayName, hiq.intensitate * 0.7, 'observed');
  }

  // ── GENERATE — text natural din tipare ───────────────────────
  function generateProfile() {
    decay();
    var explicit = [];
    var observed = [];
    var seen = {};

    // Texte per tipar explicit
    Object.keys(_p).forEach(function(k) {
      var p = _p[k];
      if (p.intensity < 0.15) return;
      var text = null;

      if (p.cat === 'PERS' && p.sub === 'name') {
        text = 'Ești ' + _cap(p.val) + '.';
      } else if (p.cat === 'DEMOG' && p.sub === 'age') {
        text = 'Ai ' + p.val + '.';
      } else if (p.cat === 'JOB') {
        var jv = p.val.length <= 4 ? p.val.toUpperCase() : _cap(p.val);
        text = 'Lucrezi în ' + jv + '.';
      } else if (p.cat === 'PLACE' && p.sub === 'city') {
        text = 'Ești din ' + _cap(p.val) + '.';
      } else if (p.cat === 'PREF' && p.sub === 'place') {
        text = 'Îți place ' + p.val + '.';
      }

      if (text && !seen[text]) {
        seen[text] = true;
        explicit.push({ text: text, intensity: p.intensity });
      }
    });

    // Texte per tipar observat (MOOD cu count >= 2)
    var moodCount = {};
    Object.keys(_p).forEach(function(k) {
      var p = _p[k];
      if (p.cat !== 'MOOD' || p.source !== 'observed') return;
      moodCount[p.sub] = (moodCount[p.sub] || 0) + p.count;
    });

    var MOOD_TEXT = {
      tristete_profunda: 'Am observat că sunt momente grele care revin.',
      oboseala:          'Oboseala apare des în conversațiile noastre.',
      anxietate:         'Simți tensiune destul de des.',
      singuratate:       'Singurătatea e un subiect care revine la tine.',
      furie:             'Frustrarea iese uneori la suprafață.',
      frustrare:         'Te mai blochezi uneori în situații.',
      bucurie:           'Bucuria e prezentă când vorbești — se simte.',
      liniste:           'Ai momente de pace care se văd clar.',
      speranta:          'Speranța e un fir care merge prin tot ce spui.',
      disperare:         'Sunt momente când e foarte greu pentru tine.',
      dragoste:          'Căldura e vizibilă în ce descrii.',
      mandrie:           'Mândria apare când vorbești despre ce ai reușit.',
      curiozitate:       'Ești curios — întrebările vin natural la tine.'
    };

    Object.keys(moodCount).forEach(function(mood) {
      if (moodCount[mood] >= 2 && MOOD_TEXT[mood] && !seen[MOOD_TEXT[mood]]) {
        seen[MOOD_TEXT[mood]] = true;
        var bestIntensity = 0;
        Object.keys(_p).forEach(function(k) {
          if (_p[k].cat === 'MOOD' && _p[k].sub === mood) {
            bestIntensity = Math.max(bestIntensity, _p[k].intensity);
          }
        });
        observed.push({ text: MOOD_TEXT[mood], intensity: bestIntensity });
      }
    });

    // Sortat dupa intensitate
    explicit.sort(function(a,b){ return b.intensity - a.intensity; });
    observed.sort(function(a,b){ return b.intensity - a.intensity; });

    return { explicit: explicit, observed: observed };
  }

  // ── STATS ─────────────────────────────────────────────────────
  function getConvCount() {
    try {
      return JSON.parse(localStorage.getItem('vv_lea_history') || '[]').length;
    } catch(e) { return 0; }
  }

  function hasAnything() {
    return Object.keys(_p).length > 0;
  }

  function getTopMood() {
    var best = null, bestScore = 0;
    Object.keys(_p).forEach(function(k) {
      var p = _p[k];
      if (p.cat === 'MOOD' && p.count * p.intensity > bestScore) {
        bestScore = p.count * p.intensity;
        best = p.sub;
      }
    });
    return best;
  }

  function clear() {
    _p = {};
    try { localStorage.removeItem('vv_me_patterns'); } catch(e) {}
  }

  return {
    learn: learn,
    learnFromKB: learnFromKB,
    learnFromEmotion: learnFromEmotion,
    generateProfile: generateProfile,
    getConvCount: getConvCount,
    hasAnything: hasAnything,
    getTopMood: getTopMood,
    clear: clear
  };
})();

