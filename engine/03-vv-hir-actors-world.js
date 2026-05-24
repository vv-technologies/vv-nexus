/**
 * VV HiR — actori lume (pisică, câine, copac, pasăre, mare, munte, nor, lună)
 */
(function (global) {
  'use strict';
  if (!global.VVHiR) return;
  var HiR = global.VVHiR;

  function nid(ctx, p) { ctx.pc = (ctx.pc || 0) + 1; return p + ctx.pc; }

  function drawTree(cx, y, h, season, ctx) {
    var id = nid(ctx, 't');
    var th = h * 0.4, tw = h * 0.15;
    var isWinter = season === 'iarna', isAutumn = season === 'toamna', isSummer = season === 'vara';
    var lc1 = isAutumn ? '#d05800' : isWinter ? '#2a3c2a' : isSummer ? '#1a6a0a' : '#2a7818';
    var lc2 = isAutumn ? '#a83000' : isWinter ? '#1a2a1a' : isSummer ? '#0a4a00' : '#185010';
    var trunkW = tw * 0.22;
    var s = '<g><defs><radialGradient id="lf' + id + '"><stop offset="0%" stop-color="' + lc1 + '"/><stop offset="100%" stop-color="' + lc2 + '"/></radialGradient></defs>';
    s += '<rect x="' + (cx - trunkW * 0.5) + '" y="' + (y - th * 0.48) + '" width="' + trunkW + '" height="' + (th * 0.52) + '" rx="' + (trunkW * 0.35) + '" fill="#4a2a0a"/>';
    if (!isWinter) {
      var ry = y - th * 0.55;
      s += '<circle cx="' + cx + '" cy="' + (ry - th * 0.05) + '" r="' + (tw * 0.46) + '" fill="url(#lf' + id + ')"/>';
      s += '<circle cx="' + (cx - tw * 0.18) + '" cy="' + (ry + th * 0.14) + '" r="' + (tw * 0.44) + '" fill="url(#lf' + id + ')" opacity=".9"/>';
    }
    return s + '</g>';
  }

  HiR.registerActor('pisica', function (x, y, parsed, h, action, ov, ctx) {
    var c = '#3a3a3a';
    if (action === 'sare') y -= 30;
    var hy = y - 22;
    return '<ellipse cx="' + x + '" cy="' + y + '" rx="42" ry="26" fill="' + c + '"/>' +
      '<circle cx="' + x + '" cy="' + hy + '" r="22" fill="' + c + '"/>' +
      '<polygon points="' + (x - 11) + ',' + (hy - 18) + ' ' + (x - 17) + ',' + (hy - 38) + ' ' + (x - 3) + ',' + (hy - 20) + '" fill="' + c + '"/>' +
      '<ellipse cx="' + (x - 7) + '" cy="' + hy + '" rx="6" ry="8" fill="#88aa22"/>';
  }, { editable: true, label: 'Pisică', organism: true });

  HiR.registerActor('caine', function (x, y, parsed, h, action, ov, ctx) {
    var r = h * 0.05, dc = '#8a6a40';
    return '<ellipse cx="' + x + '" cy="' + y + '" rx="' + (r * 1.8) + '" ry="' + (r * 0.92) + '" fill="' + dc + '"/>' +
      '<circle cx="' + (x + r * 1.4) + '" cy="' + (y - r * 0.62) + '" r="' + (r * 0.72) + '" fill="' + dc + '"/>' +
      '<circle cx="' + (x + r * 1.55) + '" cy="' + (y - r * 0.82) + '" r="' + (r * 0.18) + '" fill="#111"/>';
  }, { editable: true, label: 'Câine', organism: true });

  HiR.registerActor('copac', function (x, y, parsed, h, action, ov, ctx) {
    var id = nid(ctx, 't'), th = h * 0.35 * (ov.h_factor || 1), tw = th * 0.38;
    var season = (ov.season_ov && ov.season_ov !== 'auto') ? ov.season_ov : (parsed.season || 'vara');
    var lc = season === 'toamna' ? '#d05800' : season === 'iarna' ? '#2a3c2a' : '#2a7818';
    return '<rect x="' + (x - 8) + '" y="' + (y - th * 0.5) + '" width="16" height="' + (th * 0.52) + '" fill="#4a2a0a"/>' +
      '<circle cx="' + x + '" cy="' + (y - th * 0.55) + '" r="' + tw + '" fill="' + lc + '"/>' +
      '<circle cx="' + (x - tw * 0.2) + '" cy="' + (y - th * 0.45) + '" r="' + (tw * 0.85) + '" fill="' + lc + '" opacity=".9"/>';
  }, { editable: true, label: 'Copac', organism: true });

  HiR.registerActor('pasare', function (x, y, parsed, h, action, ov, ctx) {
    var r = h * 0.028 * (action === 'zboara' ? 1.2 : 1);
    var fly = action === 'zboara' ? y - h * 0.15 : y;
    return '<ellipse cx="' + x + '" cy="' + fly + '" rx="' + (r * 1.6) + '" ry="' + (r * 0.72) + '" fill="#c83020"/>' +
      '<path d="M' + (x - r * 1.8) + ' ' + fly + ' Q' + x + ' ' + (fly - r * 2) + ' ' + (x + r * 1.8) + ' ' + fly + '" stroke="#601008" stroke-width="' + (r * 0.5) + '" fill="none">' +
      '<animate attributeName="d" dur="0.8s" repeatCount="indefinite" values="M' + (x - r * 1.8) + ' ' + fly + ' Q' + x + ' ' + (fly - r * 2) + ' ' + (x + r * 1.8) + ' ' + fly + ';M' + (x - r * 1.8) + ' ' + fly + ' Q' + x + ' ' + (fly + r) + ' ' + (x + r * 1.8) + ' ' + fly + ';M' + (x - r * 1.8) + ' ' + fly + ' Q' + x + ' ' + (fly - r * 2) + ' ' + (x + r * 1.8) + ' ' + fly + '"/></path>';
  }, { editable: true, label: 'Pasăre', organism: true });

  HiR.registerActor('munte', function (x, y, parsed, h) {
    var mh = h * 0.65;
    return '<polygon points="' + (x - mh * 0.35) + ',' + (h * 0.88) + ' ' + x + ',' + (h * 0.12) + ' ' + (x + mh * 0.35) + ',' + (h * 0.88) + '" fill="#4a5060" opacity=".85"/>' +
      '<polygon points="' + (x - mh * 0.1) + ',' + (h * 0.25) + ' ' + x + ',' + (h * 0.12) + ' ' + (x + mh * 0.1) + ',' + (h * 0.25) + '" fill="rgba(220,235,255,.9)"/>';
  }, { editable: false, label: 'Munte' });

  HiR.registerActor('mare', function (x, y, parsed, h, action, ov, ctx) {
    var W = ctx.w, H = ctx.h;
    var col = parsed.mood === 'trist' ? 'rgba(30,60,120,.6)' : 'rgba(20,80,120,.5)';
    return '<rect x="0" y="' + (H * 0.6) + '" width="' + W + '" height="' + (H * 0.4) + '" fill="' + col + '"/>';
  }, { editable: false, label: 'Mare' });

  HiR.registerActor('nor', function (x, y, parsed, h) {
    return '<ellipse cx="' + x + '" cy="' + y + '" rx="' + (h * 0.12) + '" ry="' + (h * 0.06) + '" fill="rgba(255,255,255,.25)"/>' +
      '<ellipse cx="' + (x - h * 0.08) + '" cy="' + (y + h * 0.02) + '" rx="' + (h * 0.09) + '" ry="' + (h * 0.05) + '" fill="rgba(255,255,255,.2)"/>';
  }, { editable: false });

  HiR.registerActor('luna', function (x, y, parsed, h, action, ov, ctx) {
    var W = ctx.w, H = ctx.h;
    var lx = W * 0.82, ly = H * 0.1, lr = H * 0.06;
    return '<circle cx="' + lx + '" cy="' + ly + '" r="' + lr + '" fill="#e8e8f0" opacity=".9"/>' +
      '<circle cx="' + (lx + lr * 0.35) + '" cy="' + ly + '" r="' + (lr * 0.85) + '" fill="#06060e"/>';
  }, { editable: false });

  HiR.registerActor('girafa', function (x, y, parsed, h, action, ov, ctx) {
    var sc = ov.scale || 1, gh = h * 0.88 * sc;
    return '<ellipse cx="' + x + '" cy="' + (y - gh * 0.15) + '" rx="' + (gh * 0.08) + '" ry="' + (gh * 0.12) + '" fill="#d4a030"/>' +
      '<rect x="' + (x - gh * 0.04) + '" y="' + (y - gh * 0.5) + '" width="' + (gh * 0.08) + '" height="' + (gh * 0.45) + '" fill="#e8b040" rx="4"/>' +
      '<circle cx="' + x + '" cy="' + (y - gh * 0.55) + '" r="' + (gh * 0.07) + '" fill="#e8b040"/>';
  }, { editable: true, label: 'Girafă', organism: true });

  HiR.registerActor('cal', function (x, y, parsed, h, action, ov, ctx) {
    var id = nid(ctx, 'ca');
    var sc = ov.scale || 1;
    h = h * sc;
    var COLORS = [['#8a5a20', '#5a3410'], ['#1a1008', '#080502'], ['#d4c8b0', '#a09080'], ['#8a3a10', '#5a2008']];
    var ci = (ctx.pc - 1) % 4;
    var c1 = COLORS[ci][0], c2 = COLORS[ci][1];
    var run = action === 'alergare';
    var r = h * 0.06;
    var s = '<g><defs><radialGradient id="ca' + id + '"><stop offset="0%" stop-color="' + c1 + '"/><stop offset="100%" stop-color="' + c2 + '"/></radialGradient></defs>';
    var bx = x, by = y - r * 0.6;
    s += '<ellipse cx="' + bx + '" cy="' + by + '" rx="' + (r * 2.2) + '" ry="' + (r * 0.85) + '" fill="url(#ca' + id + ')"/>';
    var nx = bx + r * 1.6, ny = by - r * 0.3;
    s += '<polygon points="' + (nx - r * 0.28) + ',' + (ny + r * 0.7) + ' ' + (nx + r * 0.28) + ',' + (ny + r * 0.7) + ' ' + (nx + r * 0.6) + ',' + (ny - r * 0.8) + ' ' + nx + ',' + (ny - r * 0.9) + '" fill="url(#ca' + id + ')"/>';
    var hx = nx + r * 0.5, hy = ny - r * 0.9;
    s += '<ellipse cx="' + hx + '" cy="' + hy + '" rx="' + (r * 0.7) + '" ry="' + (r * 0.45) + '" fill="url(#ca' + id + ')"/>';
    s += '<circle cx="' + (hx + r * 0.2) + '" cy="' + (hy - r * 0.18) + '" r="' + (r * 0.14) + '" fill="#1a0a00"/>';
    var legY = by + r * 0.75, legH = r * 1.5;
    [bx - r * 1.6, bx - r * 0.6, bx + r * 0.4, bx + r * 1.5].forEach(function (lx, li) {
      var dy1 = run && (li === 0 || li === 2) ? -legH * 0.35 : 0;
      s += '<line x1="' + lx + '" y1="' + legY + '" x2="' + (lx + (run ? -r * 0.3 : r * 0.05)) + '" y2="' + (legY + legH * 0.5 + dy1) + '" stroke="' + c2 + '" stroke-width="' + (r * 0.38) + '" stroke-linecap="round"/>';
      s += '<line x1="' + (lx + (run ? -r * 0.3 : r * 0.05)) + '" y1="' + (legY + legH * 0.5 + dy1) + '" x2="' + lx + '" y2="' + (legY + legH) + '" stroke="' + c2 + '" stroke-width="' + (r * 0.32) + '" stroke-linecap="round"/>';
    });
    return s + '</g>';
  }, { editable: true, label: 'Cal', organism: true });

  HiR.registerActor('elefant', function (x, y, parsed, h, action, ov, ctx) {
    var id = nid(ctx, 'ef');
    var sc = ov.scale || 1;
    h = h * sc;
    var run = action === 'alergare';
    var r = h * 0.075;
    var s = '<g><defs><radialGradient id="ef' + id + '"><stop offset="0%" stop-color="#7a8888"/><stop offset="100%" stop-color="#3a4a48"/></radialGradient></defs>';
    var bx = x, by = y - r * 0.7;
    s += '<ellipse cx="' + bx + '" cy="' + by + '" rx="' + (r * 2.4) + '" ry="' + (r * 1.3) + '" fill="url(#ef' + id + ')"/>';
    var hx = bx + r * 1.8, hy = by - r * 0.3;
    s += '<circle cx="' + hx + '" cy="' + hy + '" r="' + (r * 1.1) + '" fill="url(#ef' + id + ')"/>';
    var tx = hx + r * 1.0, ty = hy + r * 0.35;
    s += '<path d="M' + tx + ' ' + ty + ' Q' + (tx + r * 0.8) + ' ' + (ty + r * 0.6) + ' ' + (tx + r * 0.4) + ' ' + (ty + r * 1.4) + '" stroke="#3a4a48" stroke-width="' + (r * 0.5) + '" fill="none" stroke-linecap="round"/>';
    s += '<circle cx="' + (hx + r * 0.5) + '" cy="' + (hy - r * 0.3) + '" r="' + (r * 0.16) + '" fill="#1a1a10"/>';
    var legY = by + r * 1.1, legH = r * 1.1;
    [bx - r * 1.5, bx - r * 0.5, bx + r * 0.5, bx + r * 1.5].forEach(function (lx, li) {
      var dy = run && (li === 0 || li === 2) ? -legH * 0.3 : 0;
      s += '<rect x="' + (lx - r * 0.32) + '" y="' + (legY + dy) + '" width="' + (r * 0.64) + '" height="' + legH + '" rx="' + (r * 0.2) + '" fill="#3a4a48"/>';
    });
    return s + '</g>';
  }, { editable: true, label: 'Elefant', organism: true });

  HiR.registerActor('urs', function (x, y, parsed, h, action, ov, ctx) {
    var id = nid(ctx, 'ur');
    var sc = ov.scale || 1;
    h = h * sc;
    var COLORS = [['#4a2e10', '#2a1808'], ['#1a1008', '#080502'], ['#b8a888', '#807060']];
    var ci = (ctx.pc - 1) % 3;
    var c1 = COLORS[ci][0], c2 = COLORS[ci][1];
    var r = h * 0.055;
    var bx = x, by = y - r * 0.5;
    var hx = bx + r * 1.4, hy = by - r * 0.7;
    var s = '<g><defs><radialGradient id="ur' + id + '"><stop offset="0%" stop-color="' + c1 + '"/><stop offset="100%" stop-color="' + c2 + '"/></radialGradient></defs>';
    s += '<circle cx="' + bx + '" cy="' + by + '" r="' + (r * 1.8) + '" fill="url(#ur' + id + ')"/>';
    s += '<circle cx="' + hx + '" cy="' + hy + '" r="' + (r * 1.1) + '" fill="url(#ur' + id + ')"/>';
    s += '<circle cx="' + (hx + r * 0.2) + '" cy="' + (hy - r * 0.28) + '" r="' + (r * 0.15) + '" fill="#1a0808"/>';
    var legY = by + r * 1.5, legH = r * 1.0;
    [bx - r * 1.0, bx - r * 0.3, bx + r * 0.3, bx + r * 1.0].forEach(function (lx) {
      s += '<ellipse cx="' + lx + '" cy="' + (legY + legH * 0.5) + '" rx="' + (r * 0.4) + '" ry="' + (legH * 0.6) + '" fill="' + c2 + '"/>';
    });
    return s + '</g>';
  }, { editable: true, label: 'Urs', organism: true });

  HiR.registerActor('floare', function (x, y, parsed, h, action, ov, ctx) {
    var mood = (ov.mood_ov && ov.mood_ov !== 'auto') ? ov.mood_ov : (parsed.mood || 'liniste');
    var sc = ov.scale || 1;
    var r = h * 0.042 * sc;
    var col = mood === 'trist' ? '#7a7aaa' : mood === 'tensiune' ? '#aa2222' : mood === 'fericit' ? '#ff9940' : '#e84090';
    var breathe = HiR.laws.sens >= 0.28 && HiR.perf.mode !== 'eco';
    var s = '<g>';
    s += '<line x1="' + x + '" y1="' + y + '" x2="' + x + '" y2="' + (y + h * 0.14) + '" stroke="#2a7a1a" stroke-width="3" stroke-linecap="round"/>';
    for (var i = 0; i < 6; i++) {
      var a = i * 60 * Math.PI / 180;
      var px = x + Math.cos(a) * r * 1.7, py = y + Math.sin(a) * r * 1.7;
      if (breathe) {
        s += '<ellipse cx="' + px + '" cy="' + py + '" rx="' + (r * 0.75) + '" ry="' + (r * 0.5) + '" fill="' + col + '" transform="rotate(' + (i * 60) + ',' + px + ',' + py + ')" opacity=".9">' +
          '<animate attributeName="rx" values="' + (r * 0.75) + ';' + (r * 0.9) + ';' + (r * 0.75) + '" dur="' + (2.5 + i * 0.3) + 's" repeatCount="indefinite"/></ellipse>';
      } else {
        s += '<ellipse cx="' + px + '" cy="' + py + '" rx="' + (r * 0.75) + '" ry="' + (r * 0.5) + '" fill="' + col + '" transform="rotate(' + (i * 60) + ',' + px + ',' + py + ')" opacity=".9"/>';
      }
    }
    s += '<circle cx="' + x + '" cy="' + y + '" r="' + (r * 0.55) + '" fill="#f5d020"/>';
    return s + '</g>';
  }, { editable: true, label: 'Floare', organism: true });

  HiR.registerActor('padure', function (x, y, parsed, h, action, ov, ctx) {
    var w = ctx.w, season = parsed.season || 'vara';
    var pos = [0.06, 0.16, 0.27, 0.42, 0.56, 0.7, 0.82, 0.91];
    var s = '<g class="vv-organism" data-drift="0">';
    pos.forEach(function (frac, ti) {
      var tx = w * frac;
      var tScale = 0.55 + Math.abs((ti - 3.5) / 4) * 0.35;
      var ty = h * (0.88 - Math.abs((ti - 3.5) / 4) * 0.06);
      s += drawTree(tx, ty, h * tScale, season, ctx);
    });
    return s + '</g>';
  }, { editable: false, label: 'Pădure', organism: false });

  HiR.registerActor('stol', function (x, y, parsed, h, action, ov, ctx) {
    var w = ctx.w;
    var flock = [[0.15, 0.1], [0.23, 0.07], [0.32, 0.13], [0.4, 0.08], [0.5, 0.06], [0.58, 0.1], [0.67, 0.08], [0.75, 0.13], [0.82, 0.09], [0.9, 0.07]];
    var s = '<g class="vv-organism" data-drift="0">';
    flock.forEach(function (fp) {
      var bx = w * fp[0], by = h * fp[1], bh = h * 0.22;
      var r = bh * 0.028;
      s += '<ellipse cx="' + bx + '" cy="' + by + '" rx="' + (r * 1.6) + '" ry="' + (r * 0.72) + '" fill="#c83020"/>';
      if (HiR.perf.mode !== 'eco') {
        s += '<path d="M' + (bx - r * 1.8) + ' ' + by + ' Q' + bx + ' ' + (by - r * 2) + ' ' + (bx + r * 1.8) + ' ' + by + '" stroke="#601008" stroke-width="' + (r * 0.5) + '" fill="none"><animate attributeName="d" dur="0.7s" repeatCount="indefinite" values="M' + (bx - r * 1.8) + ' ' + by + ' Q' + bx + ' ' + (by - r * 2) + ' ' + (bx + r * 1.8) + ' ' + by + ';M' + (bx - r * 1.8) + ' ' + by + ' Q' + bx + ' ' + (by + r) + ' ' + (bx + r * 1.8) + ' ' + by + ';M' + (bx - r * 1.8) + ' ' + by + ' Q' + bx + ' ' + (by - r * 2) + ' ' + (bx + r * 1.8) + ' ' + by + '"/></path>';
      }
    });
    return s + '</g>';
  }, { editable: false, label: 'Stol păsări', organism: false });

  /* ── Helper: corp animal generic (corp eliptic + cap + picioare) ── */
  function drawAnimal(x, y, h, opts) {
    var bw = h * (opts.bw || 0.13), bh = h * (opts.bh || 0.07);
    var hw = h * (opts.hw || 0.06), hh = h * (opts.hh || 0.055);
    var col = opts.col || '#888';
    var neckLen = h * (opts.neckLen || 0.04);
    var legH = h * (opts.legH || 0.06), legW = h * 0.018;
    var headX = x + bw * (opts.headFwd || 0.7);
    var headY = y - bh * 0.5 - neckLen - hh;
    var s = '<g>';
    /* Trunchi */
    s += '<ellipse cx="' + x + '" cy="' + y + '" rx="' + bw + '" ry="' + bh + '" fill="' + col + '"/>';
    /* Gât */
    s += '<line x1="' + (x + bw * 0.5) + '" y1="' + (y - bh * 0.5) + '" x2="' + headX + '" y2="' + (headY + hh) + '" stroke="' + col + '" stroke-width="' + (h * 0.025) + '" stroke-linecap="round"/>';
    /* Cap */
    s += '<ellipse cx="' + headX + '" cy="' + headY + '" rx="' + hw + '" ry="' + hh + '" fill="' + col + '"/>';
    /* Ochi */
    s += '<circle cx="' + (headX + hw * 0.35) + '" cy="' + (headY - hh * 0.2) + '" r="' + (h * 0.008) + '" fill="#1a0808"/>';
    /* Picioare */
    [-bw * 0.55, -bw * 0.2, bw * 0.2, bw * 0.55].forEach(function (ox) {
      s += '<rect x="' + (x + ox - legW * 0.5) + '" y="' + (y + bh * 0.7) + '" width="' + legW + '" height="' + legH + '" rx="' + (legW * 0.4) + '" fill="' + (opts.legCol || col) + '"/>';
    });
    /* Coadă */
    if (opts.tail !== false) {
      s += '<path d="M' + (x - bw) + ',' + (y - bh * 0.1) + ' Q' + (x - bw * 1.35) + ',' + (y - bh * 0.9) + ' ' + (x - bw * 1.1) + ',' + (y - bh * 1.6) + '" stroke="' + col + '" stroke-width="' + (h * 0.018) + '" fill="none" stroke-linecap="round"/>';
    }
    if (opts.extra) s += opts.extra(x, y, h, bw, bh, headX, headY, hw, hh);
    return s + '</g>';
  }

  /* ── LEU ── */
  HiR.registerActor('leu', function (x, y, parsed, h, action, ov, ctx) {
    var col = '#c8880a', mane = '#6a3800';
    var r = h * 0.055;
    var headX = x + r * 2.2, headY = y - r * 1.2;
    return drawAnimal(x, y, h, {
      col: col, bw: 0.13, bh: 0.065, hw: 0.072, hh: 0.062, neckLen: 0.03, headFwd: 0.75,
      extra: function (x, y, h, bw, bh, hx, hy, hw, hh) {
        /* Coamă */
        return '<circle cx="' + hx + '" cy="' + hy + '" r="' + (hw * 1.5) + '" fill="' + mane + '" opacity=".7"/>';
      }
    });
  }, { editable: true, label: 'Leu', organism: true });

  /* ── TIGRU ── */
  HiR.registerActor('tigru', function (x, y, parsed, h, action, ov, ctx) {
    var id = nid(ctx, 'tg');
    var col = '#d06818', stripe = '#1a0a00';
    var s = drawAnimal(x, y, h, { col: col, bw: 0.12, bh: 0.058, hw: 0.065, hh: 0.055, neckLen: 0.025, headFwd: 0.72 });
    /* Dungi */
    var bw = h * 0.12;
    [-bw * 0.5, 0, bw * 0.5].forEach(function (ox) {
      s += '<line x1="' + (x + ox) + '" y1="' + (y - h * 0.055) + '" x2="' + (x + ox) + '" y2="' + (y + h * 0.02) + '" stroke="' + stripe + '" stroke-width="' + (h * 0.012) + '" opacity=".7"/>';
    });
    return s;
  }, { editable: true, label: 'Tigru', organism: true });

  /* ── PANDA ── */
  HiR.registerActor('panda', function (x, y, parsed, h, action, ov, ctx) {
    var white = '#e8e8e8', black = '#1a1a1a';
    var r = h * 0.065;
    var headY = y - r * 1.7;
    var s = '<g>';
    /* Corp */
    s += '<ellipse cx="' + x + '" cy="' + y + '" rx="' + (r * 1.8) + '" ry="' + (r * 1.15) + '" fill="' + white + '"/>';
    /* Cap */
    s += '<circle cx="' + x + '" cy="' + headY + '" r="' + (r * 1.1) + '" fill="' + white + '"/>';
    /* Urechi */
    [-1, 1].forEach(function (s2) {
      s += '<circle cx="' + (x + s2 * r * 0.85) + '" cy="' + (headY - r * 0.9) + '" r="' + (r * 0.35) + '" fill="' + black + '"/>';
    });
    /* Pete ochi */
    [-1, 1].forEach(function (s2) {
      s += '<ellipse cx="' + (x + s2 * r * 0.4) + '" cy="' + (headY - r * 0.1) + '" rx="' + (r * 0.3) + '" ry="' + (r * 0.22) + '" fill="' + black + '"/>';
      s += '<circle cx="' + (x + s2 * r * 0.38) + '" cy="' + (headY - r * 0.1) + '" r="' + (r * 0.1) + '" fill="white"/>';
    });
    /* Nas */
    s += '<ellipse cx="' + x + '" cy="' + (headY + r * 0.25) + '" rx="' + (r * 0.18) + '" ry="' + (r * 0.12) + '" fill="' + black + '"/>';
    /* Brațe negre */
    [-1, 1].forEach(function (s2) {
      s += '<ellipse cx="' + (x + s2 * r * 1.6) + '" cy="' + (y - r * 0.3) + '" rx="' + (r * 0.42) + '" ry="' + (r * 0.65) + '" fill="' + black + '"/>';
    });
    /* Picioare */
    [-0.7, 0.7].forEach(function (ox) {
      s += '<ellipse cx="' + (x + r * ox) + '" cy="' + (y + r * 1.3) + '" rx="' + (r * 0.52) + '" ry="' + (r * 0.42) + '" fill="' + black + '"/>';
    });
    return s + '</g>';
  }, { editable: true, label: 'Panda', organism: true });

  /* ── VULPE ── */
  HiR.registerActor('vulpe', function (x, y, parsed, h, action, ov, ctx) {
    var col = '#d05010', white = '#e8d8b0';
    var s = drawAnimal(x, y, h, { col: col, bw: 0.1, bh: 0.052, hw: 0.06, hh: 0.05, neckLen: 0.028, headFwd: 0.75,
      extra: function (x, y, h, bw, bh, hx, hy, hw, hh) {
        /* Urechi ascuțite */
        return '<polygon points="' + (hx - hw * 0.4) + ',' + (hy - hh) + ' ' + (hx - hw * 0.7) + ',' + (hy - hh * 2.2) + ' ' + (hx - hw * 0.05) + ',' + (hy - hh) + '" fill="' + col + '"/>' +
               '<polygon points="' + (hx + hw * 0.1) + ',' + (hy - hh) + ' ' + (hx + hw * 0.45) + ',' + (hy - hh * 2.1) + ' ' + (hx + hw * 0.65) + ',' + (hy - hh) + '" fill="' + col + '"/>' +
               '<ellipse cx="' + (hx + hw * 0.45) + '" cy="' + (hy + hh * 0.2) + '" rx="' + (hw * 0.45) + '" ry="' + (hh * 0.4) + '" fill="' + white + '"/>';
      }
    });
    return s;
  }, { editable: true, label: 'Vulpe', organism: true });

  /* ── LUP ── */
  HiR.registerActor('lup', function (x, y, parsed, h, action, ov, ctx) {
    return drawAnimal(x, y, h, { col: '#787878', legCol: '#555', bw: 0.115, bh: 0.058, hw: 0.068, hh: 0.056, neckLen: 0.032, headFwd: 0.75 });
  }, { editable: true, label: 'Lup', organism: true });

  /* ── CERB ── */
  HiR.registerActor('cerb', function (x, y, parsed, h, action, ov, ctx) {
    var col = '#a06030';
    var s = drawAnimal(x, y, h, { col: col, bw: 0.11, bh: 0.058, hw: 0.058, hh: 0.052, neckLen: 0.055, headFwd: 0.65,
      extra: function (x, y, h, bw, bh, hx, hy, hw, hh) {
        /* Coarne */
        var bx = hx, by = hy - hh;
        return '<path d="M' + bx + ',' + by + ' L' + (bx - 8) + ',' + (by - 22) + ' L' + (bx - 18) + ',' + (by - 15) + ' M' + (bx - 8) + ',' + (by - 22) + ' L' + (bx - 4) + ',' + (by - 32) + '" stroke="' + col + '" stroke-width="3" fill="none" stroke-linecap="round"/>' +
               '<path d="M' + (bx + 4) + ',' + by + ' L' + (bx + 12) + ',' + (by - 22) + ' L' + (bx + 22) + ',' + (by - 15) + ' M' + (bx + 12) + ',' + (by - 22) + ' L' + (bx + 8) + ',' + (by - 32) + '" stroke="' + col + '" stroke-width="3" fill="none" stroke-linecap="round"/>';
      }
    });
    return s;
  }, { editable: true, label: 'Cerb', organism: true });

  /* ── ZEBRA ── */
  HiR.registerActor('zebra', function (x, y, parsed, h, action, ov, ctx) {
    var s = drawAnimal(x, y, h, { col: '#e8e8e8', legCol: '#222', bw: 0.12, bh: 0.06, hw: 0.062, hh: 0.053, neckLen: 0.04, headFwd: 0.7 });
    var bw = h * 0.12;
    [-bw * 0.6, -bw * 0.2, bw * 0.2, bw * 0.6].forEach(function (ox) {
      s += '<line x1="' + (x + ox) + '" y1="' + (y - h * 0.06) + '" x2="' + (x + ox * 0.8) + '" y2="' + (y + h * 0.02) + '" stroke="#1a1a1a" stroke-width="' + (h * 0.013) + '" opacity=".8"/>';
    });
    return s;
  }, { editable: true, label: 'Zebra', organism: true });

  /* ── GAINA ── */
  HiR.registerActor('gaina', function (x, y, parsed, h, action, ov, ctx) {
    var col = '#e8d8a0', red = '#cc2200';
    var r = h * 0.04;
    var s = '<g>';
    s += '<ellipse cx="' + x + '" cy="' + y + '" rx="' + (r * 1.6) + '" ry="' + (r * 1.1) + '" fill="' + col + '"/>';
    s += '<circle cx="' + (x + r * 1.4) + '" cy="' + (y - r * 1.2) + '" r="' + (r * 0.75) + '" fill="' + col + '"/>';
    /* Creastă */
    s += '<ellipse cx="' + (x + r * 1.5) + '" cy="' + (y - r * 2.1) + '" rx="' + (r * 0.25) + '" ry="' + (r * 0.45) + '" fill="' + red + '"/>';
    /* Cioc */
    s += '<polygon points="' + (x + r * 2) + ',' + (y - r * 1.2) + ' ' + (x + r * 2.5) + ',' + (y - r * 1.0) + ' ' + (x + r * 2) + ',' + (y - r * 0.85) + '" fill="#d08010"/>';
    /* Ochi */
    s += '<circle cx="' + (x + r * 1.7) + '" cy="' + (y - r * 1.35) + '" r="' + (r * 0.15) + '" fill="#1a0808"/>';
    /* Picioare */
    [-0.5, 0.5].forEach(function (ox) {
      s += '<line x1="' + (x + r * ox) + '" y1="' + (y + r * 1.1) + '" x2="' + (x + r * ox) + '" y2="' + (y + r * 1.8) + '" stroke="#d08010" stroke-width="' + (h * 0.008) + '"/>';
      s += '<line x1="' + (x + r * ox) + '" y1="' + (y + r * 1.8) + '" x2="' + (x + r * (ox + 0.35)) + '" y2="' + (y + r * 2.1) + '" stroke="#d08010" stroke-width="' + (h * 0.007) + '"/>';
    });
    return s + '</g>';
  }, { editable: true, label: 'Găină', organism: true });

  /* ── FLUTURE ── */
  HiR.registerActor('fluture', function (x, y, parsed, h, action, ov, ctx) {
    var mood = parsed.mood || 'liniste';
    var col1 = mood === 'fericit' ? '#ff8840' : mood === 'trist' ? '#6080c0' : '#e040a0';
    var col2 = mood === 'fericit' ? '#ffcc20' : mood === 'trist' ? '#4060a0' : '#a02080';
    var r = h * 0.055;
    var anim = HiR.perf.mode !== 'eco' ? '<animateTransform attributeName="transform" type="scale" values="1 1;1.05 0.95;1 1" dur="0.6s" repeatCount="indefinite" additive="sum"/>' : '';
    var s = '<g>';
    /* Aripi sus */
    s += '<ellipse cx="' + (x - r * 1.1) + '" cy="' + (y - r * 0.5) + '" rx="' + (r * 1.2) + '" ry="' + (r * 0.75) + '" fill="' + col1 + '" opacity=".85" transform="rotate(-25,' + (x - r * 1.1) + ',' + (y - r * 0.5) + ')">' + anim + '</ellipse>';
    s += '<ellipse cx="' + (x + r * 1.1) + '" cy="' + (y - r * 0.5) + '" rx="' + (r * 1.2) + '" ry="' + (r * 0.75) + '" fill="' + col1 + '" opacity=".85" transform="rotate(25,' + (x + r * 1.1) + ',' + (y - r * 0.5) + ')">' + anim + '</ellipse>';
    /* Aripi jos */
    s += '<ellipse cx="' + (x - r * 0.85) + '" cy="' + (y + r * 0.5) + '" rx="' + (r * 0.8) + '" ry="' + (r * 0.55) + '" fill="' + col2 + '" opacity=".8"/>';
    s += '<ellipse cx="' + (x + r * 0.85) + '" cy="' + (y + r * 0.5) + '" rx="' + (r * 0.8) + '" ry="' + (r * 0.55) + '" fill="' + col2 + '" opacity=".8"/>';
    /* Corp */
    s += '<ellipse cx="' + x + '" cy="' + y + '" rx="' + (r * 0.14) + '" ry="' + (r * 0.85) + '" fill="#1a0820"/>';
    /* Antene */
    s += '<path d="M' + x + ',' + (y - r * 0.85) + ' Q' + (x - r * 0.6) + ',' + (y - r * 1.8) + ' ' + (x - r * 0.7) + ',' + (y - r * 2.1) + '" stroke="#1a0820" stroke-width="1.5" fill="none"/>';
    s += '<path d="M' + x + ',' + (y - r * 0.85) + ' Q' + (x + r * 0.6) + ',' + (y - r * 1.8) + ' ' + (x + r * 0.7) + ',' + (y - r * 2.1) + '" stroke="#1a0820" stroke-width="1.5" fill="none"/>';
    s += '<circle cx="' + (x - r * 0.7) + '" cy="' + (y - r * 2.1) + '" r="' + (r * 0.12) + '" fill="#1a0820"/>';
    s += '<circle cx="' + (x + r * 0.7) + '" cy="' + (y - r * 2.1) + '" r="' + (r * 0.12) + '" fill="#1a0820"/>';
    return s + '</g>';
  }, { editable: true, label: 'Fluture', organism: true });

  /* ── VACA ── */
  HiR.registerActor('vaca', function (x, y, parsed, h, action, ov, ctx) {
    var s = drawAnimal(x, y, h, { col: '#e8e0d0', legCol: '#888', bw: 0.14, bh: 0.072, hw: 0.072, hh: 0.058, neckLen: 0.035, headFwd: 0.7,
      extra: function (x, y, h, bw, bh, hx, hy, hw, hh) {
        return '<ellipse cx="' + (hx + hw * 0.5) + '" cy="' + (hy + hh * 0.4) + '" rx="' + (hw * 0.4) + '" ry="' + (hh * 0.28) + '" fill="#d08080"/>' +
               /* Pete negre */
               '<ellipse cx="' + (x - bw * 0.3) + '" cy="' + (y - bh * 0.3) + '" rx="' + (bw * 0.35) + '" ry="' + (bh * 0.55) + '" fill="#2a2a2a" opacity=".45"/>';
      }
    });
    return s;
  }, { editable: true, label: 'Vacă', organism: true });

  /* ── IEPURE ── */
  HiR.registerActor('iepure', function (x, y, parsed, h, action, ov, ctx) {
    var col = '#d8d0c8';
    var r = h * 0.045;
    var s = '<g>';
    s += '<ellipse cx="' + x + '" cy="' + y + '" rx="' + (r * 1.3) + '" ry="' + (r * 1.0) + '" fill="' + col + '"/>';
    s += '<circle cx="' + x + '" cy="' + (y - r * 1.35) + '" r="' + (r * 0.75) + '" fill="' + col + '"/>';
    /* Urechi lungi */
    [-0.35, 0.35].forEach(function (ox) {
      s += '<ellipse cx="' + (x + r * ox) + '" cy="' + (y - r * 2.5) + '" rx="' + (r * 0.2) + '" ry="' + (r * 0.7) + '" fill="' + col + '"/>';
      s += '<ellipse cx="' + (x + r * ox) + '" cy="' + (y - r * 2.5) + '" rx="' + (r * 0.1) + '" ry="' + (r * 0.5) + '" fill="#e88888" opacity=".5"/>';
    });
    s += '<circle cx="' + (x + r * 0.3) + '" cy="' + (y - r * 1.45) + '" r="' + (r * 0.12) + '" fill="#1a0808"/>';
    s += '<ellipse cx="' + (x + r * 0.52) + '" cy="' + (y - r * 1.25) + '" rx="' + (r * 0.22) + '" ry="' + (r * 0.1) + '" fill="#e88888" opacity=".6"/>';
    return s + '</g>';
  }, { editable: true, label: 'Iepure', organism: true });

  /* ── GORILA ── */
  HiR.registerActor('gorila', function (x, y, parsed, h, action, ov, ctx) {
    var col = '#2a2828';
    var r = h * 0.07;
    var s = '<g>';
    s += '<ellipse cx="' + x + '" cy="' + y + '" rx="' + (r * 2.0) + '" ry="' + (r * 1.4) + '" fill="' + col + '"/>';
    s += '<circle cx="' + x + '" cy="' + (y - r * 1.7) + '" r="' + (r * 1.1) + '" fill="' + col + '"/>';
    /* Brațe lungi */
    [-1, 1].forEach(function (s2) {
      s += '<ellipse cx="' + (x + s2 * r * 2.5) + '" cy="' + (y + r * 0.3) + '" rx="' + (r * 0.5) + '" ry="' + (r * 1.2) + '" fill="' + col + '" transform="rotate(' + (s2 * 20) + ',' + (x + s2 * r * 2.5) + ',' + (y + r * 0.3) + ')"/>';
    });
    s += '<ellipse cx="' + x + '" cy="' + (y - r * 1.6) + '" rx="' + (r * 0.65) + '" ry="' + (r * 0.5) + '" fill="#4a3828"/>';
    s += '<circle cx="' + (x - r * 0.32) + '" cy="' + (y - r * 1.72) + '" r="' + (r * 0.14) + '" fill="#1a0808"/>';
    s += '<circle cx="' + (x + r * 0.32) + '" cy="' + (y - r * 1.72) + '" r="' + (r * 0.14) + '" fill="#1a0808"/>';
    return s + '</g>';
  }, { editable: true, label: 'Gorilă', organism: true });

  /* ── DELFIN / PEȘTE ── */
  HiR.registerActor('peste', function (x, y, parsed, h, action, ov, ctx) {
    var col = '#3060c0';
    return '<g><ellipse cx="' + x + '" cy="' + y + '" rx="' + (h * 0.1) + '" ry="' + (h * 0.038) + '" fill="' + col + '"/>' +
      '<polygon points="' + (x + h * 0.1) + ',' + y + ' ' + (x + h * 0.16) + ',' + (y - h * 0.04) + ' ' + (x + h * 0.16) + ',' + (y + h * 0.04) + '" fill="' + col + '"/>' +
      '<circle cx="' + (x - h * 0.06) + '" cy="' + (y - h * 0.008) + '" r="' + (h * 0.01) + '" fill="white"/>' +
      '<line x1="' + (x - h * 0.04) + '" y1="' + (y - h * 0.035) + '" x2="' + (x + h * 0.06) + '" y2="' + (y - h * 0.038) + '" stroke="rgba(255,255,255,.2)" stroke-width="2"/>' +
      '</g>';
  }, { editable: true, label: 'Pește', organism: true });

  /* ── CACTUS ── */
  HiR.registerActor('cactus', function (x, y, parsed, h, action, ov, ctx) {
    var col = '#2a7a1a';
    var r = h * 0.035;
    return '<g>' +
      '<rect x="' + (x - r * 0.8) + '" y="' + (y - r * 3.5) + '" width="' + (r * 1.6) + '" height="' + (r * 3.5) + '" rx="' + (r * 0.6) + '" fill="' + col + '"/>' +
      '<rect x="' + (x - r * 2.2) + '" y="' + (y - r * 2.4) + '" width="' + (r * 1.4) + '" height="' + (r * 0.9) + '" rx="' + (r * 0.4) + '" fill="' + col + '"/>' +
      '<rect x="' + (x - r * 2.2) + '" y="' + (y - r * 3.1) + '" width="' + (r * 0.9) + '" height="' + (r * 1.5) + '" rx="' + (r * 0.4) + '" fill="' + col + '"/>' +
      '<rect x="' + (x + r * 0.8) + '" y="' + (y - r * 2.0) + '" width="' + (r * 1.4) + '" height="' + (r * 0.9) + '" rx="' + (r * 0.4) + '" fill="' + col + '"/>' +
      '<rect x="' + (x + r * 1.3) + '" y="' + (y - r * 2.8) + '" width="' + (r * 0.9) + '" height="' + (r * 1.4) + '" rx="' + (r * 0.4) + '" fill="' + col + '"/>' +
      '</g>';
  }, { editable: true, label: 'Cactus', organism: false });

  /* ── PALMIER ── */
  HiR.registerActor('palmier', function (x, y, parsed, h, action, ov, ctx) {
    var col = '#3a7020', trunk = '#a06820';
    var th = h * 0.38, tw = h * 0.018;
    var s = '<g>';
    /* Trunchi curbat */
    s += '<path d="M' + x + ',' + y + ' Q' + (x + h * 0.06) + ',' + (y - th * 0.5) + ' ' + (x + h * 0.04) + ',' + (y - th) + '" stroke="' + trunk + '" stroke-width="' + (tw * 2) + '" fill="none" stroke-linecap="round"/>';
    /* Frunze */
    var top = { x: x + h * 0.04, y: y - th };
    [[-50, 1.2], [-25, 1.1], [0, 1.0], [25, 1.1], [50, 1.2], [75, 1.15], [100, 1.1], [-75, 1.15], [-100, 1.1]].forEach(function (pair) {
      var ang = pair[0] * Math.PI / 180, len = h * 0.15 * pair[1];
      s += '<path d="M' + top.x + ',' + top.y + ' Q' + (top.x + Math.cos(ang) * len * 0.5) + ',' + (top.y + Math.sin(ang) * len * 0.5 - h * 0.03) + ' ' + (top.x + Math.cos(ang) * len) + ',' + (top.y + Math.sin(ang) * len) + '" stroke="' + col + '" stroke-width="' + (h * 0.012) + '" fill="none" stroke-linecap="round"/>';
    });
    return s + '</g>';
  }, { editable: true, label: 'Palmier', organism: false });

  /* ── CASA ── */
  HiR.registerActor('casa', function (x, y, parsed, h, action, ov, ctx) {
    var wc = '#c8c0b0', rc = '#b03010', ww = h * 0.18, wh = h * 0.14;
    var s = '<g>';
    s += '<rect x="' + (x - ww * 0.5) + '" y="' + (y - wh) + '" width="' + ww + '" height="' + wh + '" fill="' + wc + '" rx="2"/>';
    /* Acoperiș */
    s += '<polygon points="' + (x - ww * 0.58) + ',' + (y - wh) + ' ' + x + ',' + (y - wh * 1.5) + ' ' + (x + ww * 0.58) + ',' + (y - wh) + '" fill="' + rc + '"/>';
    /* Ușă */
    s += '<rect x="' + (x - ww * 0.1) + '" y="' + (y - wh * 0.5) + '" width="' + (ww * 0.2) + '" height="' + (wh * 0.5) + '" fill="#5a3010" rx="2"/>';
    /* Ferestre */
    [-0.3, 0.3].forEach(function (ox) {
      s += '<rect x="' + (x + ww * ox - ww * 0.09) + '" y="' + (y - wh * 0.82) + '" width="' + (ww * 0.18) + '" height="' + (wh * 0.22) + '" fill="#aaccee" rx="2"/>';
    });
    return s + '</g>';
  }, { editable: true, label: 'Casă', organism: false });

  /* ── VULCAN ── */
  HiR.registerActor('vulcan', function (x, y, parsed, h, action, ov, ctx) {
    var col = '#4a3020';
    var vw = h * 0.22, vh = h * 0.32;
    var s = '<g>';
    s += '<polygon points="' + (x - vw) + ',' + y + ' ' + x + ',' + (y - vh) + ' ' + (x + vw) + ',' + y + '" fill="' + col + '"/>';
    /* Lavă */
    s += '<ellipse cx="' + x + '" cy="' + (y - vh) + '" rx="' + (vw * 0.18) + '" ry="' + (vh * 0.06) + '" fill="#ff4400"/>';
    s += '<ellipse cx="' + x + '" cy="' + (y - vh + 2) + '" rx="' + (vw * 0.14) + '" ry="' + (vh * 0.04) + '" fill="#ff8800"/>';
    if (HiR.perf.mode !== 'eco') {
      s += '<animate attributeName="opacity" values="1;0.85;1" dur="1.2s" repeatCount="indefinite"/>';
    }
    return s + '</g>';
  }, { editable: true, label: 'Vulcan', organism: false });

})(typeof window !== 'undefined' ? window : this);
