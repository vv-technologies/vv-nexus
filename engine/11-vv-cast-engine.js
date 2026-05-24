/**
 * VV Cast Engine v1.0 — motor 3D personaje
 * Three.js · local-first · conectat la VV HiS / HiQ / HiR
 * VV HiR = scenă (SVG background) · VV Cast = personaje (WebGL overlay)
 * © VV Technologies · Cosmin Toma
 */
(function (global) {
  'use strict';

  if (!global.THREE) {
    console.warn('[VV Cast] Three.js lipsește — încarcă three.min.js înainte.');
    return;
  }

  var THREE = global.THREE;

  /* ════════════════════════════════════════
     MATERIALE
  ════════════════════════════════════════ */
  function matStd(col, rough, metal) {
    return new THREE.MeshStandardMaterial({ color: col, roughness: rough || 0.8, metalness: metal || 0 });
  }

  var SHIRT_COLORS = {
    albastru: 0x4a72b8, verde: 0x2a7a52, rosu: 0x9a2a18,
    portocaliu: 0xd48820, negru: 0x1a1a2a, alb: 0xc8c8dc,
    galben: 0xb8a010, mov: 0x6a2a8a
  };
  var MOOD_SHIRT = {
    fericit: 0xd48820, trist: 0x4a72b8, tensiune: 0x9a2a18,
    liniste: 0x2a7a52, furios: 0x8a1a08, neutru: 0x3a6a8a
  };

  /* ════════════════════════════════════════
     GEOMETRII HELPER
  ════════════════════════════════════════ */
  function mkSphere(r, mat) {
    return new THREE.Mesh(new THREE.SphereGeometry(r, 20, 14), mat);
  }
  function mkCapsule(r, h, mat) {
    return new THREE.Mesh(new THREE.CapsuleGeometry(r, h, 4, 10), mat);
  }
  function mkBox(w, h, d, mat) {
    return new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  }
  function mkCyl(rT, rB, h, mat, seg) {
    return new THREE.Mesh(new THREE.CylinderGeometry(rT, rB, h, seg || 10), mat);
  }

  /* ════════════════════════════════════════
     OM — personaj uman complet
  ════════════════════════════════════════ */
  function buildHuman(opts) {
    opts = opts || {};
    var mood   = opts.mood   || 'neutru';
    var action = opts.action || null;
    var ov     = opts.ov     || {};
    var s      = opts.scale  || 1;   // scală uniformă

    /* Proporții umane (head = 1/7.5 din înălțimea totală) */
    var HEAD  = 11  * s;
    var NECK  = 4   * s;
    var TORH  = 30  * s;  /* înălțime trunchi */
    var TORW  = 13  * s;  /* lățime trunchi */
    var TORD  = 8   * s;  /* adâncime trunchi */
    var UARMH = 15  * s;  /* braț superior */
    var FARMH = 13  * s;  /* braț inferior (antebraț) */
    var ARMR  = 3   * s;  /* raza braț */
    var HANDR = 3.8 * s;
    var ULEGR = 4.5 * s;
    var FLEGR = 3.8 * s;
    var ULEGH = 20  * s;
    var FLEGH = 18  * s;
    var FOOTW = 7   * s;

    var TOTAL = HEAD*2 + NECK + TORH + ULEGH + FLEGH;
    var GND   = -TOTAL * 0.5;   /* Y = picioarele pe sol */

    /* Culori */
    var SKIN_TONES = [0xe8b468, 0xd09050, 0xbf7840, 0xf0d8a0];
    var skinCol = SKIN_TONES[Math.floor((opts.pcIdx || 0) % 4)];

    var shirtCol = MOOD_SHIRT[mood] || MOOD_SHIRT.neutru;
    if (ov.shirt_ov && ov.shirt_ov !== 'auto' && SHIRT_COLORS[ov.shirt_ov])
      shirtCol = SHIRT_COLORS[ov.shirt_ov];

    var mSkin  = matStd(skinCol,  0.75);
    var mShirt = matStd(shirtCol, 0.85);
    var mPants = matStd(0x1a2838, 0.9);
    var mHair  = matStd(0x2e1c0a, 0.9);
    var mShoe  = matStd(0x14121e, 0.95);

    /* Rădăcină */
    var root = new THREE.Group();

    /* ── PICIOARE ── */
    function mkLeg(side) {
      var hipPivot = new THREE.Group();
      hipPivot.position.set(side * TORW * 0.24, GND + ULEGH + FLEGH, 0);

      var uLeg = mkCapsule(ULEGR, ULEGH - ULEGR*2, mPants);
      uLeg.position.y = -(ULEGH * 0.5);
      hipPivot.add(uLeg);

      var kneePivot = new THREE.Group();
      kneePivot.position.y = -ULEGH;

      var fLeg = mkCapsule(FLEGR, FLEGH - FLEGR*2, mPants);
      fLeg.position.y = -(FLEGH * 0.5);
      kneePivot.add(fLeg);

      var foot = mkBox(FOOTW, ULEGR * 0.6, FLEGR * 1.6, mShoe);
      foot.position.set(side * FOOTW * 0.05, -FLEGH - ULEGR*0.25, FLEGR * 0.3);
      kneePivot.add(foot);

      hipPivot.add(kneePivot);
      root.add(hipPivot);
      return { hip: hipPivot, knee: kneePivot };
    }
    var legL = mkLeg(-1);
    var legR = mkLeg( 1);

    /* ── TRUNCHI ── */
    var torsoGeo = new THREE.BoxGeometry(TORW, TORH, TORD);
    var torso = new THREE.Mesh(torsoGeo, mShirt);
    torso.position.y = GND + ULEGH + FLEGH + TORH * 0.5;
    torso.castShadow = true;
    root.add(torso);

    /* Reflexie lumină pe piept */
    var chest = mkBox(TORW * 0.5, TORH * 0.3, TORD * 0.15,
      matStd(shirtCol + 0x101010, 0.5));
    chest.position.set(-TORW * 0.05, TORH * 0.15, TORD * 0.6);
    torso.add(chest);

    /* ── BRAȚE ── */
    function mkArm(side) {
      var shoulderPivot = new THREE.Group();
      shoulderPivot.position.set(
        side * (TORW * 0.5 + ARMR),
        GND + ULEGH + FLEGH + TORH * 0.82,
        0
      );

      var uArm = mkCapsule(ARMR, UARMH - ARMR*2, mShirt);
      uArm.position.y = -(UARMH * 0.5);
      shoulderPivot.add(uArm);

      var elbowPivot = new THREE.Group();
      elbowPivot.position.y = -UARMH;

      var fArm = mkCapsule(ARMR * 0.85, FARMH - ARMR*2, mSkin);
      fArm.position.y = -(FARMH * 0.5);
      elbowPivot.add(fArm);

      /* Mână */
      var hand = mkSphere(HANDR, mSkin);
      hand.position.y = -FARMH - HANDR * 0.3;
      elbowPivot.add(hand);

      /* Degete (3 schematice) */
      [-1, 0, 1].forEach(function (fi) {
        var fg = mkCapsule(ARMR * 0.22, HANDR * 0.85, mSkin);
        fg.position.set(fi * HANDR * 0.28, -FARMH - HANDR * 1.5, HANDR * 0.18);
        elbowPivot.add(fg);
      });

      shoulderPivot.add(elbowPivot);
      root.add(shoulderPivot);
      return { shoulder: shoulderPivot, elbow: elbowPivot };
    }
    var armL = mkArm(-1);
    var armR = mkArm( 1);

    /* ── GÂT ── */
    var neck = mkCapsule(HEAD * 0.22, NECK, mSkin);
    neck.position.y = GND + ULEGH + FLEGH + TORH + NECK * 0.5;
    root.add(neck);

    /* ── CAP ── */
    var headPivot = new THREE.Group();
    headPivot.position.y = GND + ULEGH + FLEGH + TORH + NECK + HEAD;
    root.add(headPivot);

    var headMesh = mkSphere(HEAD, mSkin);
    headMesh.castShadow = true;
    headPivot.add(headMesh);

    /* Păr */
    var hairMesh = new THREE.Mesh(
      new THREE.SphereGeometry(HEAD * 1.03, 20, 10, 0, Math.PI*2, 0, Math.PI*0.52),
      mHair
    );
    hairMesh.position.y = HEAD * 0.08;
    headPivot.add(hairMesh);

    /* Ochi */
    var mEyeW = matStd(0xffffff, 0.4);
    var mIris  = matStd(0x1a3060, 0.3);
    var mPupil = matStd(0x060408, 0.2);
    [-1, 1].forEach(function (s2) {
      var ew = mkSphere(HEAD * 0.21, mEyeW);
      ew.position.set(s2 * HEAD * 0.33, HEAD * 0.1, HEAD * 0.9);
      headPivot.add(ew);
      var iris = mkSphere(HEAD * 0.13, mIris);
      iris.position.set(s2 * HEAD * 0.33, HEAD * 0.1, HEAD * 0.98);
      headPivot.add(iris);
      var pupil = mkSphere(HEAD * 0.07, mPupil);
      pupil.position.set(s2 * HEAD * 0.33, HEAD * 0.1, HEAD * 1.01);
      headPivot.add(pupil);
      /* Strălucire ochi */
      var shine = mkSphere(HEAD * 0.04, matStd(0xffffff, 0.1));
      shine.position.set(s2 * HEAD * 0.3, HEAD * 0.16, HEAD * 1.03);
      headPivot.add(shine);
    });

    /* Sprâncene */
    var mBrow = matStd(0x2a1a0a, 0.8);
    [-1, 1].forEach(function (s2) {
      var brow = mkBox(HEAD*0.32, HEAD*0.055, HEAD*0.04, mBrow);
      var browTilt = mood === 'furios' ? s2*0.4 :
                     mood === 'trist'  ? -s2*0.3 : 0;
      brow.rotation.z = browTilt;
      brow.position.set(s2 * HEAD * 0.33, HEAD * 0.46, HEAD * 0.9);
      headPivot.add(brow);
    });

    /* Nas */
    var mNose = matStd(skinCol - 0x181010, 0.85);
    var nosePivot = new THREE.Group();
    nosePivot.position.set(0, -HEAD*0.08, HEAD*0.88);
    var noseTip = mkSphere(HEAD * 0.095, mNose);
    var noseL   = mkSphere(HEAD * 0.068, mNose);
    var noseR   = mkSphere(HEAD * 0.068, mNose);
    noseL.position.set(-HEAD*0.1, -HEAD*0.04, HEAD*0.04);
    noseR.position.set( HEAD*0.1, -HEAD*0.04, HEAD*0.04);
    nosePivot.add(noseTip); nosePivot.add(noseL); nosePivot.add(noseR);
    headPivot.add(nosePivot);

    /* Gură */
    var mLip = matStd(mood === 'fericit' ? 0xc03040 : 0x904050, 0.5);
    if (mood === 'fericit') {
      /* Zâmbet = arc de tor */
      var smileGeo = new THREE.TorusGeometry(HEAD*0.2, HEAD*0.042, 5, 12, Math.PI);
      var smile = new THREE.Mesh(smileGeo, mLip);
      smile.rotation.z = Math.PI;
      smile.position.set(0, -HEAD*0.38, HEAD*0.88);
      headPivot.add(smile);
    } else if (mood === 'trist') {
      var sadGeo = new THREE.TorusGeometry(HEAD*0.18, HEAD*0.038, 5, 12, Math.PI);
      var sad = new THREE.Mesh(sadGeo, mLip);
      sad.position.set(0, -HEAD*0.45, HEAD*0.88);
      headPivot.add(sad);
    } else {
      var mouthBox = mkBox(HEAD*0.28, HEAD*0.055, HEAD*0.04, mLip);
      mouthBox.position.set(0, -HEAD*0.4, HEAD*0.92);
      headPivot.add(mouthBox);
    }

    /* Obraji (fericit) */
    if (mood === 'fericit') {
      var mCheek = matStd(0xff8080, 0.8);
      mCheek.transparent = true; mCheek.opacity = 0.3;
      [-1,1].forEach(function(s2){
        var c = mkSphere(HEAD*0.18, mCheek);
        c.position.set(s2*HEAD*0.56, -HEAD*0.15, HEAD*0.82);
        headPivot.add(c);
      });
    }

    /* ── POSTURĂ din action ── */
    applyHumanPose(armL, armR, legL, legR, headPivot, action, mood);

    /* Override arm_angle */
    if (ov.arm_angle) {
      var aa = ov.arm_angle * Math.PI / 180;
      armL.shoulder.rotation.z =  aa;
      armR.shoulder.rotation.z = -aa;
    }

    /* Override rotație */
    if (ov.rotation) root.rotation.y = ov.rotation * Math.PI / 180;

    /* ── ANIMAȚIE respirație ── */
    var doBreathe = (ov.breathe_ov !== 'off');
    var breathSpeed = ov.breathe_speed ? (1 / +ov.breathe_speed) : 0.35;

    function tick(t) {
      if (!doBreathe) return;
      var b = Math.sin(t * breathSpeed * Math.PI * 2) * 0.009;
      torso.scale.set(1 + b, 1 - b*0.3, 1 + b*0.5);
    }

    return {
      root: root,
      headPivot: headPivot,
      armL: armL, armR: armR,
      legL: legL, legR: legR,
      torso: torso,
      tick: tick,
      dispose: function () {
        root.traverse(function (o) {
          if (o.geometry) o.geometry.dispose();
          if (o.material) { if (Array.isArray(o.material)) o.material.forEach(function(m){m.dispose();}); else o.material.dispose(); }
        });
      }
    };
  }

  function applyHumanPose(aL, aR, lL, lR, head, action, mood) {
    /* Reset */
    aL.shoulder.rotation.set(0,0,-0.12);
    aR.shoulder.rotation.set(0,0, 0.12);
    lL.hip.rotation.set(0,0,0);
    lR.hip.rotation.set(0,0,0);

    if (action === 'sare') {
      aL.shoulder.rotation.z = -Math.PI * 0.72;
      aR.shoulder.rotation.z =  Math.PI * 0.72;
      lL.hip.rotation.x =  0.45;
      lR.hip.rotation.x = -0.45;
    } else if (action === 'danseaza') {
      aL.shoulder.rotation.z = -Math.PI * 0.55;
      aL.shoulder.rotation.x = -0.2;
      aR.shoulder.rotation.x =  0.35;
      aR.shoulder.rotation.z =  Math.PI * 0.2;
      lR.hip.rotation.z = -0.28;
    } else if (action === 'alergare') {
      aL.shoulder.rotation.x = -0.65;
      aR.shoulder.rotation.x =  0.65;
      lL.hip.rotation.x =  0.55;
      lR.hip.rotation.x = -0.42;
      lL.knee.rotation.x = -0.4;
    } else if (action === 'doarme') {
      aL.shoulder.rotation.z = -0.25;
      aR.shoulder.rotation.z =  0.25;
      head.rotation.z =  0.28;
      head.rotation.x =  0.15;
      lL.hip.rotation.x = 0.08;
      lR.hip.rotation.x = 0.08;
    } else if (action === 'plange') {
      head.rotation.x =  0.45;
      aL.shoulder.rotation.z = -0.18;
      aR.shoulder.rotation.z =  0.18;
    } else if (action === 'rade') {
      head.rotation.x = -0.18;
      aL.shoulder.rotation.z = -0.42;
      aR.shoulder.rotation.z =  0.42;
    } else if (action === 'lupta') {
      aL.shoulder.rotation.z = -Math.PI * 0.4;
      aL.shoulder.rotation.x = -0.3;
      aR.shoulder.rotation.x =  0.5;
      aR.elbow.rotation.x    = -0.8;
    } else if (action === 'mediteaza') {
      aL.shoulder.rotation.z = -0.5;
      aL.shoulder.rotation.x =  0.3;
      aL.elbow.rotation.x    = -0.6;
      aR.shoulder.rotation.z =  0.5;
      aR.shoulder.rotation.x =  0.3;
      aR.elbow.rotation.x    = -0.6;
    }

    /* Cap înclinat după mood */
    if (mood === 'trist')     head.rotation.x =  0.32;
    else if (mood === 'fericit')   head.rotation.x = -0.1;
    else if (mood === 'tensiune')  head.rotation.x = -0.18;
    else if (mood === 'surprins')  head.rotation.x = -0.25;
  }

  /* ════════════════════════════════════════
     VV CAST ENGINE
  ════════════════════════════════════════ */
  var Cast = {
    version: '1.0.0',
    name: 'VV Cast',
    active: false,
    renderer: null,
    scene: null,
    camera: null,
    canvas: null,
    lights: {},
    _chars: [],
    _animId: null,
    _W: 700,
    _H: 400
  };

  Cast.init = function (container) {
    if (Cast.renderer) return; /* deja inițializat */

    Cast.canvas = document.createElement('canvas');
    Cast.canvas.id = 'cast-canvas';
    Cast.canvas.style.cssText = [
      'position:absolute', 'top:0', 'left:0', 'width:100%', 'height:100%',
      'pointer-events:none', 'z-index:15', 'display:none'
    ].join(';');
    container.appendChild(Cast.canvas);

    Cast.renderer = new THREE.WebGLRenderer({ canvas: Cast.canvas, alpha: true, antialias: true });
    Cast.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    Cast.renderer.shadowMap.enabled = true;
    Cast.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    Cast.renderer.outputColorSpace = THREE.SRGBColorSpace;

    Cast.scene = new THREE.Scene();

    /* Cameră perspectivă calibrată pe coordonate SVG 700×400 */
    Cast.camera = new THREE.PerspectiveCamera(42, Cast._W / Cast._H, 1, 5000);
    Cast.camera.position.set(0, 0, 520);
    Cast.camera.lookAt(0, 0, 0);

    Cast._setupLights();
    Cast._startLoop();
    Cast._onResize(container);
    window.addEventListener('resize', function () { Cast._onResize(container); });

    Cast.active = true;
    console.log('[VV Cast] v1.0 inițializat — Three.js r' + THREE.REVISION);
  };

  Cast._setupLights = function () {
    Cast.lights.ambient = new THREE.AmbientLight(0x40405a, 0.5);
    Cast.scene.add(Cast.lights.ambient);

    Cast.lights.key = new THREE.DirectionalLight(0xfff5e0, 1.0);
    Cast.lights.key.position.set(200, 300, 400);
    Cast.lights.key.castShadow = true;
    Cast.lights.key.shadow.mapSize.set(1024, 1024);
    Cast.scene.add(Cast.lights.key);

    Cast.lights.fill = new THREE.DirectionalLight(0x8090c0, 0.28);
    Cast.lights.fill.position.set(-200, 100, 200);
    Cast.scene.add(Cast.lights.fill);

    Cast.lights.rim = new THREE.DirectionalLight(0x4060a0, 0.18);
    Cast.lights.rim.position.set(0, -200, -300);
    Cast.scene.add(Cast.lights.rim);
  };

  Cast.updateLighting = function (hiq) {
    if (!hiq) return;
    var TEMPS = { cald: 0xffd070, portocaliu: 0xff8830, rece: 0xb0c8ff, neutru: 0xfff5e0 };
    if (Cast.lights.key) {
      Cast.lights.key.intensity = Math.max(0.3, hiq.lumina * 1.1);
      Cast.lights.key.color.setHex(TEMPS[hiq.temp] || TEMPS.neutru);
    }
    if (Cast.lights.ambient) {
      Cast.lights.ambient.intensity = 0.2 + hiq.lumina * 0.35;
    }
    if (Cast.lights.fill) {
      Cast.lights.fill.intensity = 0.15 + hiq.ritm * 0.18;
    }
  };

  Cast._onResize = function (container) {
    var w = container.offsetWidth  || Cast._W;
    var h = container.offsetHeight || Cast._H;
    Cast.renderer.setSize(w, h, false);
    Cast.camera.aspect = w / h;
    Cast.camera.updateProjectionMatrix();
  };

  Cast._startLoop = function () {
    var loop = function () {
      Cast._animId = requestAnimationFrame(loop);
      var t = Date.now() * 0.001;
      Cast._chars.forEach(function (ch) { if (ch.tick) ch.tick(t); });
      Cast.renderer.render(Cast.scene, Cast.camera);
    };
    loop();
  };

  /* Convertește coordonatele SVG (0..700, 0..400) în spațiu Three.js */
  Cast._svgToWorld = function (svgX, svgY) {
    /* Cameră la z=520, FOV=42 → la z=0 planul are ~±350 pe X, ±197 pe Y */
    return {
      x:  (svgX - 350),
      y: -(svgY - 200)
    };
  };

  Cast.clear = function () {
    Cast._chars.forEach(function (ch) { Cast.scene.remove(ch.root); ch.dispose(); });
    Cast._chars = [];
  };

  Cast.addCharacter = function (subj, svgX, svgY, svgH, parsed, ov, pcIdx) {
    /* svgX, svgY = centrul/baza personajului în coord SVG (0..700, 0..400) */
    /* svgH = înălțimea scenei SVG (tipic 400) */
    var CHAR_H_3JS = 94; /* înălțimea personajului în unități Three.js la scale=1 */
    var sc = (svgH * 0.40) / CHAR_H_3JS; /* personajul = 40% din înălțimea scenei */
    var HALF_H = 47 * sc; /* jumătate din înălțimea personajului (root la centru) */
    var wx = svgX - 350;
    var wFeetY = -(svgY - 200); /* Y picioare în world coords */
    var ch = null;

    if (subj === 'om') {
      ch = buildHuman({
        mood:   ov.mood_ov && ov.mood_ov !== 'auto' ? ov.mood_ov : (parsed && parsed.mood) || 'neutru',
        action: ov.action_ov && ov.action_ov !== 'auto' ? ov.action_ov : (parsed && parsed.action),
        ov:     ov,
        scale:  sc,
        pcIdx:  pcIdx || 0
      });
    }
    /* Alți actori — viitor: pisica, caine, etc. */

    if (ch) {
      ch.root.position.set(wx, wFeetY + HALF_H, 0);
      Cast.scene.add(ch.root);
      Cast._chars.push(ch);
    }
    return ch;
  };

  /* ── Pointer control: rotire cu drag ── */
  Cast.enableDrag = function (canvasEl) {
    var dragging = false, lastX = 0, lastY = 0, target = null;

    canvasEl.style.pointerEvents = 'all';

    canvasEl.addEventListener('pointerdown', function (e) {
      dragging = true; lastX = e.clientX; lastY = e.clientY;
      /* Găsește personajul cel mai apropiat de click */
      target = Cast._chars.length === 1 ? Cast._chars[0] : null;
    });
    canvasEl.addEventListener('pointermove', function (e) {
      if (!dragging || !target) return;
      var dx = e.clientX - lastX;
      var dy = e.clientY - lastY;
      target.root.rotation.y += dx * 0.012;
      target.root.rotation.x += dy * 0.012;
      lastX = e.clientX; lastY = e.clientY;
    });
    canvasEl.addEventListener('pointerup', function () { dragging = false; target = null; });
  };

  /* ── Show / Hide ── */
  Cast.show = function () {
    if (Cast.canvas) Cast.canvas.style.display = 'block';
  };
  Cast.hide = function () {
    if (Cast.canvas) Cast.canvas.style.display = 'none';
  };

  global.VVCast = Cast;
  console.log('[VV Cast] v1.0 — engine încărcat, asteaptă init()');

})(typeof window !== 'undefined' ? window : this);
