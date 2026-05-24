/**
 * Legătură VV HiR ↔ Lea Studios (shell complet)
 */
(function (global) {
  'use strict';

  global._leaUseHiR = true;

  global.leaHiRSyncFromApp = function () {
    if (!global.VVHiR) return;
    if (global._laws) Object.keys(global._laws).forEach(function (k) {
      if (global.VVHiR.laws[k] !== undefined) global.VVHiR.laws[k] = global._laws[k];
    });
    if (global._perfMode) global.VVHiR.perf.mode = global._perfMode;
    if (typeof global._wikiEnabled === 'boolean') global.VVHiR.perf.wiki = global._wikiEnabled;
    global.VVHiR.state.frozen = !!global._frozen;
    global.VVHiR.setExternalOverrides(global._subjOverrides || {});
  };

  global.leaHiRSyncToApp = function (result) {
    if (!result || !global.VVHiR) return;
    if (global._laws) Object.keys(global.VVHiR.laws).forEach(function (k) {
      if (global._laws[k] !== undefined) global._laws[k] = global.VVHiR.laws[k];
    });
    if (result.subjects && typeof global._sceneSubjects !== 'undefined') {
      global._sceneSubjects = result.subjects;
    }
    if (result.overrides) {
      Object.keys(result.overrides).forEach(function (i) {
        global._subjOverrides[i] = result.overrides[i];
      });
    }
  };

  global.leaHiRRender = function (text, w, h) {
    if (!global.VVHiR || !global.VVHiSTokenize) return null;
    global.leaHiRSyncFromApp();
    var result = global.VVHiR.render(text, {
      width: w || 700,
      height: h || 400,
      kb: global.KB || {},
      customVocab: global._customVocab || {},
      overrides: global._subjOverrides || {}
    });
    if (!result.error) {
      global.leaHiRSyncToApp(result);
      /* Expune datele HiQ pentru UI (muzică, culori, BPM) */
      if (result.ctx && result.ctx._hiq) {
        global._lastHiQ = result.ctx._hiq;
        if (global.leaHiQAfterRender) global.leaHiQAfterRender(result.ctx._hiq, result);
      }
      if (global.leaHiRAfterRender) global.leaHiRAfterRender(result, text);
    }
    return result;
  };

  global.leaHiRAllSubjectsSupported = function (parsed) {
    if (!parsed || !parsed.subjects.length) return true;
    return parsed.subjects.every(function (s) {
      return (global.VVHiR && global.VVHiR.plugins.actors[s]) || global._leaLegacyDraw;
    });
  };

  /* Fallback: monolitul desenează actori nemigrati încă */
  if (global.VVHiR && global.VVHiR.syncPatternsFromLegacy) {
    try {
      var leg = JSON.parse(localStorage.getItem('vv_subj_patterns') || '{}');
      global.VVHiR.syncPatternsFromLegacy(leg);
    } catch (e) {}
  }

  global._leaLegacyDraw = function (subj, cx, yDepth, parsed, h, action, ov, ctx) {
    if (typeof global.person !== 'function') return '';
    var y = yDepth * (parsed.mood === 'trist' ? 0.92 : 0.88);
    var rH = h * (ov.h_factor || 1);
    if (subj === 'om') return global.person(cx, y, parsed.mood, rH, action, ov);
    if (subj === 'pisica' && global.cat) return global.cat(cx, h * 0.76, parsed.time, action);
    if (subj === 'copac' && global.tree) return global.tree(cx, h * 0.88, h, parsed.season);
    if (subj === 'caine' && global.dog) return global.dog(cx, h * 0.82, h, action);
    if (subj === 'pasare' && global.bird) return global.bird(cx, h * 0.25, h, action);
    return '';
  };
})(typeof window !== 'undefined' ? window : this);
