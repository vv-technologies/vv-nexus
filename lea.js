// ── FIREBASE (opțional - Lea funcționează și fără) ────────────
var db = null;
function initFirebase() {
  try {
    if(typeof firebase !== 'undefined') {
      firebase.initializeApp({
        apiKey:"AIzaSyDGv4kEClO0RHCLvXVLOT-vyPHw6bsxYVc",
        authDomain:"vv-ep-beta.firebaseapp.com",
        projectId:"vv-ep-beta"
      });
      db = firebase.firestore();
    }
  } catch(e) { db = null; }
}
function fbAdd(col, data) {
  if(!db) return;
  try { db.collection(col).add(data); } catch(e) {}
}

// ── STATE ─────────────────────────────────────────────────────
var _u = null, _city = null, _hist = [], _obs = 0, _aerL = null;
var _ck = [false, false, false];
// ── CHEIA API ─────────────────────────────────────────────────
// Cheia NU e in cod. Se pune o singura data din setari (⚙)
// Se salveaza in localStorage — doar pe device-ul tau
// Zero GitHub. Zero hackeri. Zero risc.
var _gk = localStorage.getItem('lea_gk') || '';
var _ek = localStorage.getItem('lea_ek') || '';
var _vi = localStorage.getItem('lea_vi') || '';
var _audio = null, _rec = null;
var DAILY_LIMIT = 20;
var PREMIUM_LIMIT = 100;


// ── PROXY CEO ─────────────────────────────────────────────────
// CEO baga URL-ul o singura data aici
// Toti userii folosesc cheia CEO automat
// Ei nu vad nimic, nu introduc nimic
var VV_PROXY = localStorage.getItem('vv_proxy_url') || 'https://script.google.com/macros/s/AKfycbxk2t1vLAYshmMVwxww--uJo2haL2z8mI22xPoFTK49rV98r97ao0znb25GJdfcwKPY8w/exec';
// ──────────────────────────────────────────────────────────────

// ── NAME ONBOARDING ───────────────────────────────────────────
var _userName = '';

function onNameInput(val) {
  _userName = val.trim();
  var btn = document.getElementById('name-btn');
  if(btn) {
    btn.classList.toggle('on', _userName.length >= 2);
    btn.style.opacity = _userName.length >= 2 ? '1' : '0.35';
    btn.style.cursor = _userName.length >= 2 ? 'pointer' : 'not-allowed';
  }
}

function goToTerms() {
  if(_userName.length < 2) return;
  // Salveaza numele local
  localStorage.setItem('lea_name', _userName);
  // Anima tranzitia
  var stepName = document.getElementById('step-name');
  var stepTerms = document.getElementById('step-terms');
  var greeting = document.getElementById('terms-greeting');
  if(greeting) greeting.textContent = 'Bine ai venit, ' + _userName + '.';
  if(stepName) { stepName.style.opacity='0'; stepName.style.transform='translateX(-16px)'; stepName.style.transition='all .3s'; }
  setTimeout(function() {
    if(stepName) stepName.style.display='none';
    if(stepTerms) { stepTerms.style.display='flex'; stepTerms.style.opacity='0'; stepTerms.style.transform='translateX(16px)'; stepTerms.style.transition='all .3s'; }
    setTimeout(function() { if(stepTerms){ stepTerms.style.opacity='1'; stepTerms.style.transform='translateX(0)'; } }, 50);
  }, 300);
}


// ── VV VOICE SYNC ─────────────────────────────────────────────
// Spui codul VV cu vocea → Lea te recunoaște pe device nou
// Plus: Raft Vocal — Lea învață cum vorbești tu specific

var VOICE_SHELF_KEY = 'vv_voice_shelf';

// Raft Vocal — stochează pattern-uri vocale locale
function loadVoiceShelf() {
  try { return JSON.parse(localStorage.getItem(VOICE_SHELF_KEY)||'{}'); } catch(e) { return {}; }
}

function saveVoiceShelf(shelf) {
  try { localStorage.setItem(VOICE_SHELF_KEY, JSON.stringify(shelf)); } catch(e) {}
}

function learnVoicePattern(transcript, confidence) {
  var shelf = loadVoiceShelf();
  var h = new Date().getHours();
  var period = h<6?'noapte':h<12?'dimineata':h<17?'pranz':h<21?'seara':'noapte';
  
  if(!shelf.patterns) shelf.patterns = {};
  if(!shelf.patterns[period]) shelf.patterns[period] = {
    avgConfidence: 0, count: 0, wordCount: 0, samples: []
  };
  
  var p = shelf.patterns[period];
  var words = transcript.trim().split(' ').length;
  p.count++;
  p.avgConfidence = (p.avgConfidence * (p.count-1) + confidence) / p.count;
  p.wordCount = (p.wordCount * (p.count-1) + words) / p.count;
  
  // Pastreaza ultimele 5 sample-uri pentru pattern
  p.samples.push({t: transcript.substring(0,30), c: confidence, ts: Date.now()});
  if(p.samples.length > 5) p.samples.shift();
  
  // Detecteaza starea vocala
  if(confidence < 0.6) shelf.currentMood = 'obosit'; // recunoastere slaba = obosit/zgomot
  else if(confidence > 0.85) shelf.currentMood = 'energic';
  else shelf.currentMood = 'normal';
  
  shelf.lastVoice = {period, confidence, words, ts: Date.now()};
  saveVoiceShelf(shelf);
  return shelf;
}

function getVoiceContext() {
  var shelf = loadVoiceShelf();
  if(!shelf.lastVoice) return '';
  var mood = shelf.currentMood;
  if(mood === 'obosit') return 'Vocea utilizatorului sugerează oboseală — răspunsuri scurte și directe.';
  if(mood === 'energic') return 'Utilizatorul e activ — poți fi mai detaliat.';
  return '';
}

// Voice Sync — conectare prin voce pe device nou
function startVoiceSync() {
  var SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if(!SR) { showToast('Vocea nu e disponibilă în acest browser'); return; }
  
  var orb = document.getElementById('aer-orb');
  var msg = document.getElementById('aer-msg');
  var lbl = document.getElementById('aer-lbl');
  
  if(orb) orb.classList.add('go');
  if(lbl) lbl.textContent = 'Ascult...';
  if(msg) { msg.textContent = 'Spune codul tău VV cu vocea'; msg.className = 'aer-msg searching'; }
  
  // Ambient pulsează cu vocea
  document.getElementById('amb').className = 'aer';
  
  var sr = new SR();
  sr.lang = 'ro-RO';
  sr.continuous = false;
  sr.interimResults = false;
  
  sr.onresult = async function(e) {
    var said = e.results[0][0].transcript.toUpperCase().trim();
    var conf = e.results[0][0].confidence;
    
    if(orb) orb.classList.remove('go');
    if(msg) msg.textContent = 'Am auzit: "' + said + '" · Verific...';
    
    // Curata textul - extrage codul VV
    var codeMatch = said.match(/VV[\s·\-]?([A-Z0-9]{2,6})[\s·\-]?([A-Z0-9]{2,6})/i);
    var searchCode = null;
    
    if(codeMatch) {
      searchCode = 'VV·' + codeMatch[1].substring(0,3) + '·' + codeMatch[2].substring(0,3);
    } else if(said.includes('VV')) {
      // Incearca sa extraga orice dupa VV
      var parts = said.replace('VV','').trim().split(/[\s·\-]+/).filter(function(p){return p.length>=2;});
      if(parts.length >= 2) searchCode = 'VV·' + parts[0].substring(0,3) + '·' + parts[1].substring(0,3);
    }
    
    if(!searchCode) {
      if(msg) msg.textContent = 'Nu am înțeles codul. Spune "VV" urmat de codul tău.';
      document.getElementById('amb').className = '';
      setTimeout(function(){ if(orb)orb.classList.remove('go'); if(lbl)lbl.textContent='Apasă'; }, 2000);
      return;
    }
    
    // Cauta in Firebase
    if(!db) {
      // Fallback localStorage
      var localId = localStorage.getItem('lea_id') || localStorage.getItem('vv_citizen_code');
      if(localId && localId.toUpperCase().includes(searchCode.substring(3,6))) {
        voiceSyncSuccess(JSON.parse(localStorage.getItem('lea_u')||'{}'), conf);
        return;
      }
    }
    
    try {
      // Cauta token activ sau ID direct
      var snap = await db.collection('vv_aer')
        .where('claimed','==',false)
        .orderBy('ts','desc').limit(10).get();
      
      var found = null;
      snap.forEach(function(doc) {
        var d = doc.data();
        if(d.vvid && d.vvid.toUpperCase().includes(searchCode.replace('VV·','').replace('·',''))) {
          found = {doc: doc, data: d};
        }
      });
      
      if(found) {
        await db.collection('vv_aer').doc(found.doc.id).update({claimed:true});
        var user = JSON.parse(found.data.user||'{}');
        voiceSyncSuccess(user, conf);
      } else {
        if(msg) msg.textContent = 'Cod "' + searchCode + '" negăsit. Asigură-te că ai apăsat "Trimite" pe celălalt device.';
        document.getElementById('amb').className='';
        if(lbl) lbl.textContent = 'Apasă';
      }
    } catch(err) {
      if(msg) msg.textContent = 'Eroare conexiune. Încearcă din nou.';
      document.getElementById('amb').className='';
    }
  };
  
  sr.onerror = function() {
    if(orb) orb.classList.remove('go');
    if(msg) msg.textContent = 'Nu am înțeles. Mai încearcă.';
    if(lbl) lbl.textContent = 'Apasă';
    document.getElementById('amb').className='';
  };
  
  sr.start();
}

function voiceSyncSuccess(user, confidence) {
  _u = user;
  localStorage.setItem('lea_id', user.vvid||'');
  localStorage.setItem('lea_u', JSON.stringify(user));
  localStorage.setItem('lea_had_aer','1');
  
  // Salveaza pattern vocal la succes
  learnVoicePattern(user.vvid||'sync', confidence);
  
  var msg = document.getElementById('aer-msg');
  var lbl = document.getElementById('aer-lbl');
  if(msg) { msg.className='aer-msg ok'; msg.textContent='✓ Recunoscut prin voce! Identitate sincronizată.'; }
  if(lbl) lbl.textContent='✓';
  
  document.getElementById('amb').className='';
  
  setTimeout(function(){
    hideAll();
    enterApp();
    showToast('VV Voice Sync ✓');
  }, 1500);
}

// ── BOOT ──────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', function() {
  initFirebase();
  detectCity();
  updateClock();
  setInterval(updateClock, 60000);
  bootLea();
});

function bootLea() {
  loadShelves();
  // Restaureaza numele salvat
  var savedName = localStorage.getItem('lea_name');
  if(savedName) {
    _userName = savedName;
    var inp = document.getElementById('name-input');
    if(inp) inp.value = savedName;
  }
  // 1. Deja logat?
  var sid = localStorage.getItem('lea_id');
  var su = localStorage.getItem('lea_u');
  if(sid && su) {
    try {
      _u = JSON.parse(su);
      showRec();
      return;
    } catch(e) {
      localStorage.removeItem('lea_id');
      localStorage.removeItem('lea_u');
    }
  }
  // 2. Vine din vv-entry?
  var cc = localStorage.getItem('vv_citizen_code');
  var as = localStorage.getItem('vv_accord_signed');
  if(cc && as) {
    _u = {vvid:cc, type:'citizen', city:localStorage.getItem('vvme_home_city'), newUser:false};
    localStorage.setItem('lea_id', cc);
    localStorage.setItem('lea_u', JSON.stringify(_u));
    showRec();
    return;
  }
  // 3. Prima vizita - acord
  sc('s-accord');
}

// ── SCREENS ───────────────────────────────────────────────────
function sc(id) {
  document.querySelectorAll('.sc').forEach(function(s){ s.classList.remove('on'); });
  var el = document.getElementById(id);
  if(el) el.classList.add('on');
}
function hideAll() {
  document.querySelectorAll('.sc').forEach(function(s){ s.classList.remove('on'); });
}

// ── CHECKBOXES ────────────────────────────────────────────────
function ck(i) {
  _ck[i] = !_ck[i];
  var el = document.getElementById('ck' + i);
  var box = document.getElementById('ckb' + i);
  if(el) el.classList.toggle('on', _ck[i]);
  if(box) {
    box.style.background = _ck[i] ? 'var(--gold)' : 'rgba(245,240,232,.06)';
    box.style.borderColor = _ck[i] ? 'var(--gold)' : 'rgba(245,240,232,.2)';
    box.style.color = _ck[i] ? '#000' : 'transparent';
  }
  var btn = document.getElementById('a-btn');
  var all = _ck[0] && _ck[1] && _ck[2];
  if(btn) {
    btn.classList.toggle('on', all);
    btn.style.opacity = all ? '1' : '0.35';
    btn.style.cursor = all ? 'pointer' : 'not-allowed';
  }
}

// ── ACCORD ────────────────────────────────────────────────────
async function acceptAccord() {
  if(!_ck[0] || !_ck[1] || !_ck[2]) { showToast('Bifează toate cele 3'); return; }
  var name = localStorage.getItem('lea_name') || _userName || 'Anonim';
  var id = genId();
  _u = {vvid:id, type:'citizen', city:_city, name:name, newUser:true};
  localStorage.setItem('lea_id', id);
  localStorage.setItem('lea_u', JSON.stringify(_u));
  localStorage.setItem('vv_accord_signed', '1');
  localStorage.setItem('vv_citizen_code', id);
  // Stocam DOAR ID-ul anonim — numele ramane local pe device
  fbAdd('vv_accords', {citizenCode:id, city:_city||null, device:navigator.userAgent.includes('Mobile')?'mobile':'desktop', ts:Date.now()});
  // VV Aer sau onboarding
  if(!localStorage.getItem('lea_had_aer')) {
    sc('s-aer');
    setTimeout(function(){ if(document.getElementById('s-aer').classList.contains('on')) skipAer(); }, 7000);
  } else { startOb(); }
}

function genId() {
  var ch = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  var a='',b='';
  for(var i=0;i<3;i++){a+=ch[Math.floor(Math.random()*ch.length)];}
  for(var i=0;i<3;i++){b+=ch[Math.floor(Math.random()*ch.length)];}
  return 'VV·'+a+'·'+b;
}

// ── RECOGNITION ───────────────────────────────────────────────
function showRec() {
  sc('s-rec');
  document.getElementById('amb').className = 'think';
  var s = document.getElementById('r-s');
  var n = document.getElementById('r-n');
  setTimeout(function(){ if(s) s.textContent = 'Identitate recunoscută.'; }, 500);
  setTimeout(function(){
    var name = displayName();
    if(n) n.textContent = name;
    if(s) s.textContent = (_u && _u.newUser) ? 'Bine ai venit.' : 'Bine ai revenit.';
  }, 1100);
  setTimeout(function(){
    document.getElementById('amb').className = '';
    hideAll();
    var firstTime = !localStorage.getItem('lea_ob_done');
    if(firstTime && _u && _u.newUser) startOb();
    else enterApp();
  }, 2200);
}

function displayName() {
  if(!_u) return '';
  if(_u.type === 'ceo') return 'CEO · Fondator';
  // Numele e stocat local — il citim din localStorage
  var localName = localStorage.getItem('lea_name');
  if(localName) return localName;
  if(_u.name) return _u.name;
  return '';
}

// ── VV AER ────────────────────────────────────────────────────
function showAer() { closeSett(); sc('s-aer'); document.getElementById('amb').className = 'aer'; }
function skipAer() {
  if(_aerL){ _aerL(); _aerL = null; }
  document.getElementById('amb').className = '';
  startOb();
}

async function aerSend() {
  if(!db) { showToast('Firebase offline'); return; }
  var id = _u ? _u.vvid : localStorage.getItem('lea_id');
  var orb = document.getElementById('aer-orb');
  var msg = document.getElementById('aer-msg');
  var lbl = document.getElementById('aer-lbl');
  orb.classList.add('go'); lbl.textContent = 'Activ'; msg.textContent = 'Aștept alt device...'; msg.className = 'aer-msg';
  try {
    var ref = await db.collection('vv_aer').add({vvid:id,user:JSON.stringify(_u),ts:Date.now(),claimed:false});
    _aerL = db.collection('vv_aer').doc(ref.id).onSnapshot(function(d){
      if(d.data() && d.data().claimed) {
        orb.classList.remove('go'); msg.className='aer-msg ok'; msg.textContent='✓ Sincronizat!'; lbl.textContent='✓';
        if(_aerL) _aerL(); localStorage.setItem('lea_had_aer','1');
        setTimeout(skipAer, 1800);
      }
    });
    setTimeout(function(){
      if(_aerL){_aerL();_aerL=null;}
      orb.classList.remove('go'); msg.textContent='Timeout. Încearcă din nou.'; lbl.textContent='Apasă';
      try{db.collection('vv_aer').doc(ref.id).delete();}catch(e){}
    }, 5*60*1000);
  } catch(e) { orb.classList.remove('go'); msg.textContent='Eroare conexiune.'; }
}

async function aerRecv() {
  if(!db) { showToast('Firebase offline'); return; }
  var orb = document.getElementById('aer-orb');
  var msg = document.getElementById('aer-msg');
  var lbl = document.getElementById('aer-lbl');
  orb.classList.add('go'); lbl.textContent='Caută...'; msg.textContent='Caut identitate VV...'; msg.className='aer-msg';
  try {
    // Cauta cele mai recente tokene neclamate (fara filtru timestamp - evita index issues)
    var snap = await db.collection('vv_aer')
      .where('claimed','==',false)
      .orderBy('ts','desc')
      .limit(5).get();
    // Filtreaza local pe 5 minute
    var t5 = Date.now() - 5*60*1000;
    var validDocs = [];
    snap.forEach(function(d){ if(d.data().ts >= t5) validDocs.push(d); });
    if(validDocs.length === 0) snap = {empty:true, docs:[]};
    else snap = {empty:false, docs:validDocs};
    if(snap.empty){
      orb.classList.remove('go'); msg.textContent='Nu am găsit niciun device activ. Apasă "Trimite" pe celălalt device.'; lbl.textContent='Apasă'; return;
    }
    var doc = snap.docs[0], data = doc.data ? doc.data() : doc.data;
    await db.collection('vv_aer').doc(doc.id).update({claimed:true});
    _u = JSON.parse(data.user);
    localStorage.setItem('lea_id', data.vvid); localStorage.setItem('lea_u', JSON.stringify(_u)); localStorage.setItem('lea_had_aer','1');
    orb.classList.remove('go'); msg.className='aer-msg ok'; msg.textContent='✓ VV Aer conectat!'; lbl.textContent='✓';
    setTimeout(function(){ hideAll(); document.getElementById('amb').className=''; enterApp(); showToast('VV Aer ✓'); }, 1500);
  } catch(e) { orb.classList.remove('go'); msg.textContent='Eroare.'; lbl.textContent='Apasă'; }
}

// ── ONBOARDING ────────────────────────────────────────────────
function startOb() { _obs=0; updateOb(); sc('s-ob'); }
function nextOb() { _obs++; if(_obs>=3){finishOb();return;} updateOb(); }
function updateOb() {
  [0,1,2].forEach(function(i){
    var s=document.getElementById('ob'+i), d=document.getElementById('od'+i);
    if(s){s.classList.toggle('on',i===_obs);s.classList.toggle('prev',i<_obs);}
    if(d) d.classList.toggle('on',i===_obs);
  });
  var b=document.getElementById('ob-nx');
  if(b) b.textContent = _obs===2?'Intru în Lea →':'Continuă →';
}
function finishOb() { localStorage.setItem('lea_ob_done','1'); hideAll(); enterApp(); }

// ── ENTER APP ─────────────────────────────────────────────────
function enterApp() {
  hideAll();
  init();
  // Card VV nu mai apare automat — user il vede din setari
  // Prima data: salut simplu
  setTimeout(function(){
    var h = new Date().getHours();
    var g = h<12?'Bună dimineața':h<18?'Bună ziua':h<22?'Bună seara':'Noapte bună';
    var name = displayName();
    var city = _city || 'România';
    var msg = g + (name ? ', ' + name : '') + '. ';
    if(city && city !== 'România') msg += 'Ești în ' + city + '. ';
    msg += 'Ce vrei să știi?';
    document.getElementById('idle').classList.add('off');
    addMsg('l', msg);
  }, 400);
}

function init() {
  var h = new Date().getHours();
  var g = h<12?'Bună dimineața':h<18?'Bună ziua':h<22?'Bună seara':'Noapte bună';
  if(_u && _u.city && !_city) { _city = _u.city; localStorage.setItem('vvme_home_city',_city); }
  var el = document.getElementById('idle-t');
  if(el) el.innerHTML = g + (displayName()?', <strong style="color:var(--w)">'+displayName()+'</strong>':'') + '.' + (_city?' Ești în <strong style="color:var(--w)">'+_city+'</strong>.':'') + '<br>Ce vrei să știi?';
  updateCityDisp(_city);
  updateLimitBar();
  buildSugs();
  loadAndShowHistory();
}

// ── IDENTITY CARD ─────────────────────────────────────────────
function showCard() {
  if(!_u) return;
  document.getElementById('idle').classList.add('off');
  var conv = document.getElementById('conv');
  var rankMap = {ceo:'💎 CEO · Fondator',founder:'💎 Fondator',citizen:'⬡ Cetățean VV'};
  var rank = rankMap[_u.type]||'⬡ VV';
  var city = _city||'—';
  var name = displayName();
  var xp = (_u.type==='ceo'||_u.type==='founder')?'XP: ∞':'XP: 1';
  var w = document.createElement('div');
  w.className='msg l'; w.style.cssText='align-self:center;width:100%;max-width:260px;';
  w.innerHTML='<div class="id-card"><div class="id-top"><div class="id-logo">Lea</div><div class="id-rank">'+rank+'</div></div><div class="id-code">'+_u.vvid+'</div>'+(name?'<div class="id-name">'+name+'</div>':'')+'<div class="id-bot"><div class="id-city">📍 '+city+'</div><div class="id-xp">'+xp+'</div></div></div><div class="msg-meta">Lea · Identitatea ta · <span style="color:var(--blue);cursor:pointer" onclick="showAer()">◎ VV Aer</span></div>';
  conv.appendChild(w);
  conv.scrollTo({top:conv.scrollHeight,behavior:'smooth'});
  setTimeout(function(){
    var h=new Date().getHours(),g=h<12?'Bună dimineața':h<18?'Bună ziua':h<22?'Bună seara':'Noapte bună';
    var wm=g+'. ';
    if(_u.type==='ceo') wm+='Fondator. Ecosistemul te așteaptă.';
    else if(name) wm+=name+'. Ce vrei să știi?';
    else wm+='Ce vrei să știi'+(_city?' despre '+_city:''+'?');
    addMsg('l', wm);
  }, 400);
}

// ── HISTORY 24H ───────────────────────────────────────────────
var HKEY = 'lea_hist_v2';
function saveHistory() {
  try {
    localStorage.setItem(HKEY, JSON.stringify({msgs:_hist.slice(-30),date:new Date().toDateString(),city:_city}));
  } catch(e) {}
}
function loadAndShowHistory() {
  try {
    var raw = localStorage.getItem(HKEY);
    if(!raw) return;
    var data = JSON.parse(raw);
    if(data.date !== new Date().toDateString()) { localStorage.removeItem(HKEY); return; }
    if(!data.msgs || data.msgs.length === 0) return;
    _hist = data.msgs;
    var conv = document.getElementById('conv');
    document.getElementById('idle').classList.add('off');
    var badge = document.createElement('div');
    badge.style.cssText='align-self:center;font-size:10px;color:var(--w15);padding:4px 12px;background:var(--w04);border:0.5px solid var(--border);border-radius:100px;';
    badge.textContent='↑ Conversație din azi · ' + data.msgs.filter(function(m){return m.r==='u';}).length + ' mesaje';
    conv.appendChild(badge);
    data.msgs.slice(-4).forEach(function(m){
      var msg=document.createElement('div');msg.className='msg '+(m.r==='u'?'u':'l');
      var bub=document.createElement('div');bub.className='msg-b';bub.textContent=m.t;bub.style.opacity='.5';
      msg.appendChild(bub);conv.appendChild(msg);
    });
    conv.scrollTo({top:conv.scrollHeight,behavior:'smooth'});
  } catch(e) {}
}

// ── CHAT ──────────────────────────────────────────────────────
function send() {
  var b=document.getElementById('ibox'),t=b.value.trim();
  if(!t) return;
  if(!canSend()) { showDonate(); return; }
  b.value='';b.style.height='auto';
  addMsg('u',t);
  document.getElementById('idle').classList.add('off');
  incCount(); updateLimitBar();
  processLea(t);
}

function addMsg(role, text, isTk) {
  var conv=document.getElementById('conv');
  var msg=document.createElement('div');msg.className='msg '+role;
  if(isTk) msg.id='tk-msg';
  var bub=document.createElement('div');bub.className='msg-b'+(isTk?' tk':'');
  if(isTk) bub.innerHTML='<div class="td"></div><div class="td"></div><div class="td"></div>';
  else bub.textContent=text;
  msg.appendChild(bub);
  if(role==='l'&&!isTk){
    var meta=document.createElement('div');meta.className='msg-meta';meta.innerHTML='<span>Lea</span>';
    if(_ek&&_vi){var pb=document.createElement('button');pb.className='play-btn';pb.textContent='▶';pb.onclick=function(){playVoice(text,pb);};meta.appendChild(pb);}
    msg.appendChild(meta);
  }
  conv.appendChild(msg);conv.scrollTo({top:conv.scrollHeight,behavior:'smooth'});
  return msg;
}


// ── VV PATTERN SCORE SYSTEM ───────────────────────────────────
// Înlocuiește recenziile cu starea reală în timp real

async function getPatternScore(locationName, city) {
  if(!db || !locationName) return null;
  try {
    var cityL = (city||_city||'').toLowerCase();
    var nameL = locationName.toLowerCase();
    var since24h = new Date(Date.now() - 24*60*60*1000);

    // Cauta VV Proof pentru aceasta locatie
    var snap = await db.collection('missions')
      .where('status','==','completed')
      .limit(20)
      .limit(20).get();

    var matches = [];
    snap.forEach(function(doc) {
      var d = doc.data();
      var mLoc = (d.location||d.address||d.description||'').toLowerCase();
      var mCity = (d.city||'').toLowerCase();
      if(mLoc.includes(nameL.split(' ')[0]) || nameL.includes(mLoc.split(' ')[0])) {
        if(!cityL || mCity.includes(cityL) || cityL.includes(mCity)) {
          matches.push(d);
        }
      }
    });

    if(matches.length === 0) return {score:0, label:'◌◌◌', text:'Nevalidat VV', age:null};

    // Calculeaza scorul
    var score = Math.min(3, matches.length);
    var latest = matches.reduce(function(a,b){
      var at = a.createdAt ? a.createdAt.toDate() : new Date(0);
      var bt = b.createdAt ? b.createdAt.toDate() : new Date(0);
      return at > bt ? a : b;
    });
    var ageMs = Date.now() - (latest.createdAt ? latest.createdAt.toDate().getTime() : 0);
    var ageText = getHumanAge(ageMs);

    var labels = ['◌◌◌','⬡◌◌','⬡⬡◌','⬡⬡⬡'];
    var texts = ['Nevalidat','Confirmare slabă','Confirmare bună','Confirmare puternică'];

    return {
      score: score,
      label: labels[score],
      text: texts[score],
      age: ageText,
      count: matches.length,
      status: latest.status || null
    };
  } catch(e) { return null; }
}

function getHumanAge(ms) {
  var min = Math.floor(ms/60000);
  var h = Math.floor(ms/3600000);
  var d = Math.floor(ms/86400000);
  if(min < 2) return 'acum';
  if(min < 60) return 'acum ' + min + ' min';
  if(h < 24) return 'acum ' + h + (h===1?' oră':' ore');
  return 'acum ' + d + (d===1?' zi':' zile');
}

function renderPatternBadge(pattern) {
  if(!pattern) return '';
  var colors = ['rgba(255,255,255,.1)','rgba(255,159,10,.15)','rgba(200,169,110,.2)','rgba(45,184,122,.2)'];
  var textColors = ['var(--w30)','#FF9F0A','var(--gold)','var(--green)'];
  var bg = colors[pattern.score] || colors[0];
  var tc = textColors[pattern.score] || textColors[0];
  return '<div style="display:inline-flex;align-items:center;gap:6px;padding:4px 10px;' +
    'background:'+bg+';border-radius:100px;font-size:10px;color:'+tc+';margin-top:6px;letter-spacing:.5px;">' +
    pattern.label + ' ' + pattern.text +
    (pattern.age ? ' · ' + pattern.age : '') +
    (pattern.count > 0 ? ' · ' + pattern.count + ' Insider' + (pattern.count>1?'i':'') : '') +
    '</div>';
}

// Lanseaza misiune automata daca nu e validata
function autoLaunchMission(locationName, city) {
  if(!db || !locationName) return;
  try {
    var missionText = 'Verifică dacă ' + locationName + ' e deschis acum · ' + (city||_city||'');
    fbAdd('missions', {
      title: missionText,
      location: locationName,
      city: (city||_city||'').toLowerCase(),
      type: 'VERIFY',
      status: 'open',
      autoLaunched: true,
      reward: 15,
      ts: Date.now()
    });
  } catch(e) {}
}


// ── VV RAFTURI PERSONALE ─────────────────────────────────────
// Local pe device. Zero server. Zero GDPR.
// Fiecare raft e un obiect mic in localStorage.

var SHELVES = {
  // Raft 1 — Familie & Context
  family: {
    hasKids: false,        // are copii
    kidsAge: null,         // varsta copiilor
    hasCar: false,         // merge cu masina
    petFriendly: false,    // are animale
    mobilityNeeds: false   // nevoi speciale mobilitate
  },
  // Raft 2 — Preferinte & Gusturi
  prefs: {
    foodTypes: [],         // pizza, sushi, shaorma etc
    avoidFood: [],         // ce evita
    cafeStyle: null,       // linistit, animat, coworking
    budget: null,          // economic, mediu, premium
    seatingPref: null      // terasa, interior, bar
  },
  // Raft 3 — Obiceiuri & Timing
  habits: {
    morningRitual: null,   // cafea, sport, etc
    lunchPattern: null,    // la birou, iesit, acasa
    eveningPattern: null,  // iesit, acasa, sport
    weekendStyle: null,    // activ, relaxat, familie
    peakHours: {}          // ce cauta la ce ora
  },
  // Raft 4 — Emotii & Stari
  mood: {
    lastMood: null,        // obosit, energic, stresat
    moodHistory: [],       // ultimele 7 stari
    stressIndicators: 0    // nr de cautari urgente
  },
  // Raft 5 — Locuri & Pini
  places: {
    favorites: [],         // locuri vizitate des
    avoided: [],           // locuri evitate
    ghostPins: [],         // pini temporari activi
    homeZone: null,        // zona de acasa
    workZone: null         // zona de munca
  }
};

function loadShelves() {
  try {
    var saved = localStorage.getItem('vv_shelves');
    if(saved) SHELVES = Object.assign({}, SHELVES, JSON.parse(saved));
  } catch(e) {}
}

function saveShelves() {
  try { localStorage.setItem('vv_shelves', JSON.stringify(SHELVES)); } catch(e) {}
}

// Invata din fiecare interactiune
function learnFromInteraction(q, intent, ans, city) {
  var l = q.toLowerCase();
  var h = new Date().getHours();

  // Invata preferinte mancare
  if(intent === 'mancare') {
    var foods = ['pizza','sushi','shaorma','burger','kebab','paste','salata','grill'];
    foods.forEach(function(f) {
      if(l.includes(f) && !SHELVES.prefs.foodTypes.includes(f)) {
        SHELVES.prefs.foodTypes.push(f);
        if(SHELVES.prefs.foodTypes.length > 8) SHELVES.prefs.foodTypes.shift();
      }
    });
  }

  // Invata pattern temporal
  var period = h<6?'noapte':h<12?'dimineata':h<17?'pranz':h<21?'seara':'noapte_tarziu';
  if(!SHELVES.habits.peakHours[period]) SHELVES.habits.peakHours[period] = {};
  SHELVES.habits.peakHours[period][intent] = (SHELVES.habits.peakHours[period][intent]||0) + 1;

  // Detecteaza context familie din query
  if(/copil|copii|bebe|scaun copil|loc joaca/i.test(l)) SHELVES.family.hasKids = true;
  if(/parcare|masina|mașina|loc parcare/i.test(l)) SHELVES.family.hasCar = true;
  if(/catel|pisica|animal|pet/i.test(l)) SHELVES.family.petFriendly = true;

  // Detecteaza stres/oboseala
  if(/urgent|repede|rapid|acum|imediat/i.test(l)) SHELVES.mood.stressIndicators++;
  if(/obosit|oboseala|stres|relaxa/i.test(l)) {
    SHELVES.mood.lastMood = 'obosit';
    SHELVES.mood.moodHistory.push({mood:'obosit',h,date:new Date().toDateString()});
    if(SHELVES.mood.moodHistory.length > 7) SHELVES.mood.moodHistory.shift();
  }

  // Invata locuri favorite
  if(ans && city) {
    var nameMatch = ans.match(/✓[^·\n]+/);
    if(nameMatch) {
      var placeName = nameMatch[0].replace('✓','').trim();
      if(placeName && !SHELVES.places.favorites.find(function(p){return p.name===placeName;})) {
        SHELVES.places.favorites.push({name:placeName,city,intent,count:1,lastSeen:Date.now()});
        if(SHELVES.places.favorites.length > 20) SHELVES.places.favorites.shift();
      }
    }
  }

  saveShelves();
}

// Construieste context personal pentru Gemini
function buildPersonalContext() {
  loadShelves();
  var ctx = [];

  if(SHELVES.family.hasKids) ctx.push('Are copii — filtrează locuri cu facilități pentru copii.');
  if(SHELVES.family.hasCar) ctx.push('Merge cu mașina — menționează disponibilitatea parcării când e relevant.');
  if(SHELVES.family.petFriendly) ctx.push('Are animale — preferă locuri pet-friendly.');

  if(SHELVES.prefs.foodTypes.length > 0) {
    ctx.push('Preferințe culinare: ' + SHELVES.prefs.foodTypes.join(', ') + '.');
  }

  if(SHELVES.mood.lastMood === 'obosit') {
    ctx.push('Utilizatorul pare obosit — sugerează opțiuni liniștite, fără cozi.');
  }

  var h = new Date().getHours();
  var period = h<6?'noapte':h<12?'dimineata':h<17?'pranz':h<21?'seara':'noapte_tarziu';
  var topIntent = null, topCount = 0;
  if(SHELVES.habits.peakHours[period]) {
    Object.keys(SHELVES.habits.peakHours[period]).forEach(function(k) {
      if(SHELVES.habits.peakHours[period][k] > topCount) {
        topCount = SHELVES.habits.peakHours[period][k];
        topIntent = k;
      }
    });
    if(topCount >= 2 && topIntent) {
      ctx.push('La această oră de obicei caută ' + topIntent + ' — anticipează nevoia.');
    }
  }

  return ctx.length > 0 ? 'Context personal: ' + ctx.join(' ') : '';
}

// ── GHOST PIN SYSTEM ──────────────────────────────────────────
function addGhostPin(name, address, autoDeleteH) {
  loadShelves();
  autoDeleteH = autoDeleteH || 2; // default 2 ore
  var pin = {
    id: Date.now(),
    name: name,
    address: address,
    createdAt: Date.now(),
    expiresAt: Date.now() + autoDeleteH * 3600000
  };
  SHELVES.places.ghostPins.push(pin);
  // Curata pinii expirate
  SHELVES.places.ghostPins = SHELVES.places.ghostPins.filter(function(p) {
    return p.expiresAt > Date.now();
  });
  saveShelves();
  showToast('📍 Pin adăugat · Se șterge în ' + autoDeleteH + 'h');
  return pin;
}

function getActiveGhostPins() {
  loadShelves();
  return SHELVES.places.ghostPins.filter(function(p) { return p.expiresAt > Date.now(); });
}

function checkAndOfferPin(ans, locationName) {
  if(!locationName) return;
  // Daca Lea da o adresa, ofera pin
  if(/stradă|strada|bd\.|bulevard|nr\.|sector/i.test(ans)) {
    setTimeout(function() {
      var conv = document.getElementById('conv');
      var pinOffer = document.createElement('div');
      pinOffer.style.cssText = 'align-self:flex-start;margin-top:-8px;';
      var safeName = (locationName||'').replace(/'/g,'').replace(/"/g,'');
      pinOffer.innerHTML = '<button onclick="addGhostPin(\''+safeName+'\',\'\',2);this.parentElement.remove();" style="padding:5px 12px;background:rgba(41,151,255,.1);border:0.5px solid rgba(41,151,255,.2);border-radius:100px;color:var(--blue);font-family:var(--mono);font-size:10px;cursor:pointer;">📍 Pin · 2h</button>';
      conv.appendChild(pinOffer);
      conv.scrollTo({top:conv.scrollHeight,behavior:'smooth'});
    }, 800);
  }
}


// Cautare de urgenta — Lea nu tace niciodata

// Refresh cache la cerere
async function processLeaFresh(q, intent) {
  // Sterge cache-ul pentru aceasta intentie si ruleaza din nou
  try {
    var cache = JSON.parse(localStorage.getItem(CACHE_KEY) || '{}');
    var bucket = getCacheBucket(intent, _city||'');
    delete cache[bucket];
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch(e) {}
  processLea(q);
}

async function emergencySearch(q, intent, city) {
  var gk = localStorage.getItem('lea_gk') || '';
  var proxy = VV_PROXY || '';
  if(!proxy && !gk) {
    return 'Nu am date pentru ' + city + ' acum. Lansez o misiune VV pentru confirmare fizică?';
  }
  var h = new Date().getHours();
  var urgentPrompt = 'Ești Lea, asistentul urban VV. Context: ' + city + ', ora ' + h + ':00. ' +
    'Întrebarea e: "' + q + '". ' +
    'Nu ai date verificate din teren. ' +
    'Răspunde UTIL și SCURT (2 propoziții max) bazat pe ce știi despre ' + city + '. ' +
    'Fii specific pentru ' + city + ' dacă poți. ' +
    'La final adaugă: "Nu am confirmare fizică VV încă." ' +
    'Răspunde DOAR în română.';
  try {
    var result = null;
    if(proxy) {
      var ep = new URLSearchParams({action:'gemini',system:urgentPrompt,q:q,city:city,userKey:gk||''});
      var r = await fetch(proxy + '?' + ep.toString(), {method:'GET'});
      var d = await r.json();
      if(d.candidates && d.candidates[0] && d.candidates[0].content) result = d.candidates[0].content.parts[0].text;
    } else if(gk) {
      var r2 = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key='+gk, {
        method:'POST', headers:{'Content-Type':'application/json'},
        body:JSON.stringify({system_instruction:{parts:[{text:urgentPrompt}]}, contents:[{role:'user',parts:[{text:q}]}], generationConfig:{maxOutputTokens:150,temperature:0.7}})
      });
      var d2 = await r2.json();
      if(d2.candidates && d2.candidates[0] && d2.candidates[0].content) result = d2.candidates[0].content.parts[0].text;
    }
    return result || 'Nu am date pentru ' + city + ' acum. Lansez o misiune VV?';
  } catch(e) {
    return 'Conexiune slabă acum. Încearcă din nou sau lansez o misiune fizică în ' + city + '?';
  }
}

// ── NEXUS INTELLIGENCE ────────────────────────────────────────
function detectIntent(q) {
  var l=q.toLowerCase();
  if(/112|ambulan|pompier|accident|urgență|urgenț|ajutor/i.test(l)) return 'urgenta';
  if(/foame|mânânc|mananc|pizza|burger|shaorma|kebab|mâncare|mancare|livrare|comand|restaurant|food/i.test(l)) return 'mancare';
  if(/cafea|cafenea|coffee|cappuccino|latte|bere|bar|pub/i.test(l)) return 'cafea';
  if(/farmacie|medicament|pastil|doctor|medic|spital|bolnav/i.test(l)) return 'sanatate';
  if(/taxi|uber|bolt|autobuz|metrou|tren|transport|cum ajung/i.test(l)) return 'transport';
  if(/film|cinema|concert|teatru|muzeu|parc/i.test(l)) return 'divertisment';
  if(/cumpăr|magazin|mall|supermarket|lidl|kaufland/i.test(l)) return 'cumparaturi';
  if(/vreme|ploaie|soare|temperatură|meteo/i.test(l)) return 'vreme';
  if(/cât e ceasul|ce ora|ce oră|ora exacta|cat e ceasul/i.test(l)) return 'ceas';
  if(/bună|buna|salut|hello|hey|ce mai/i.test(l)) return 'salut';
  return 'general';
}

async function searchVVNodes(q, intent) {
  if(!_city || !db) return [];
  try {
    var cityL=_city.toLowerCase().trim();
    var variants=[cityL];
    if(cityL.includes('bucuresti')||cityL.includes('bucurești')) variants=['bucurești','bucuresti','bucharest'];
    else if(cityL.includes('cluj')) variants=['cluj-napoca','cluj'];
    else if(cityL.includes('timisoara')||cityL.includes('timișoara')) variants=['timișoara','timisoara'];
    else if(cityL.includes('iasi')||cityL.includes('iași')) variants=['iași','iasi'];
    var [ns,ss]=await Promise.all([
      db.collection('verified_nodes').where('status','==','active').limit(15).get().catch(function(){return{forEach:function(){}}}),
      db.collection('vv_static_data').where('visible','==',true).limit(20).get().catch(function(){return{forEach:function(){}}}),
    ]);
    var results=[];
    var l=q.toLowerCase();
    function isRel(d){
      var dc=(d.city||'').toLowerCase();
      if(!variants.some(function(v){return dc.includes(v)||v.includes(dc);})) return false;
      var n=(d.name||'').toLowerCase(),t=(d.type||'').toLowerCase(),kw=(d.keywords||'').toLowerCase(),info=(d.description||d.info||'').toLowerCase();
      if(intent==='mancare'&&/pizza|restaurant|mancare|livrare|fast|food|shaorma|burger|kebab|kfc|mcd/.test(t+n+kw)) return true;
      if(intent==='cafea'&&/cafea|cafenea|coffee|bar|pub/.test(t+n+kw)) return true;
      if(intent==='sanatate'&&/farmacie|medical|clinica|spital/.test(t+n+kw)) return true;
      if(intent==='cumparaturi'&&/magazin|market|mall/.test(t+n+kw)) return true;
      return l.split(' ').filter(function(w){return w.length>3;}).some(function(w){return n.includes(w)||kw.includes(w);});
    }
    ns.forEach&&ns.forEach(function(doc){var d=doc.data();if(isRel(d))results.push(d);});
    ss.forEach&&ss.forEach(function(doc){var d=doc.data();if(isRel(d))results.push(d);});
    var seen={};
    return results.filter(function(r){var k=(r.name||'').toLowerCase();if(seen[k])return false;seen[k]=true;return true;}).slice(0,3);
  } catch(e){return[];}
}


// ── VV SMART CACHE ───────────────────────────────────────────
// Stocheaza raspunsuri 48h dupa INTENTIE + ORAS + PERIOD
// "pizza buna" si "unde mananc pizza" = acelasi cache
// Dimineata si seara = cache-uri diferite (contextul se schimba)

var CACHE_KEY = 'vv_smart_cache';
var CACHE_TTL = 48 * 3600000; // 48 ore

function getCacheBucket(intent, city) {
  // Bucket = intentie + oras + perioada zilei
  // Nu conteza textul exact al intrebarii
  var h = new Date().getHours();
  var period = h<6?'n':h<12?'d':h<18?'a':h<22?'s':'n'; // noapte/dimineata/amiaza/seara
  return (intent + '_' + (city||'').toLowerCase().substring(0,10) + '_' + period)
    .replace(/[^a-z0-9_]/g,'');
}

function saveCache(intent, city, response) {
  try {
    var cache = JSON.parse(localStorage.getItem(CACHE_KEY) || '{}');
    var bucket = getCacheBucket(intent, city);
    cache[bucket] = {
      r: response,
      t: Date.now(),
      city: city,
      intent: intent,
      age: 0
    };
    // Max 80 intrari — sterge cele mai vechi
    var keys = Object.keys(cache);
    if(keys.length > 80) {
      keys.sort(function(a,b){return (cache[a]||{t:0}).t-(cache[b]||{t:0}).t;});
      keys.slice(0,keys.length-80).forEach(function(k){delete cache[k];});
    }
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch(e) {}
}

function getCache(intent, city) {
  try {
    var cache = JSON.parse(localStorage.getItem(CACHE_KEY) || '{}');
    var bucket = getCacheBucket(intent, city);
    var entry = cache[bucket];
    if(!entry) return null;
    var age = Date.now() - entry.t;
    if(age > CACHE_TTL) { delete cache[bucket]; localStorage.setItem(CACHE_KEY, JSON.stringify(cache)); return null; }
    if(entry.city && city && entry.city.toLowerCase() !== city.toLowerCase()) return null;
    return {response: entry.r, ageMs: age};
  } catch(e) { return null; }
}

function formatCacheAge(ms) {
  var min = Math.floor(ms/60000);
  var h = Math.floor(ms/3600000);
  if(min < 60) return min + ' min';
  if(h < 24) return h + (h===1?' oră':' ore');
  return Math.floor(h/24) + ' zile';
}

function getCacheSize() {
  try {
    var cache = JSON.parse(localStorage.getItem(CACHE_KEY) || '{}');
    return Object.keys(cache).length;
  } catch(e) { return 0; }
}

async function processLea(q) {
  var activeKey = localStorage.getItem('lea_gk') || '';
  _gk = activeKey;
  var intent=detectIntent(q);
  // Raspunde direct la intrebari despre ceas - zero API
  if(intent==='ceas') {
    var now = new Date();
    var hh = now.getHours().toString().padStart(2,'0');
    var mm = now.getMinutes().toString().padStart(2,'0');
    addMsg('l', 'E ' + hh + ':' + mm + '.');
    return;
  }

  if(intent==='urgenta'){
    var em='Sună 112 ACUM dacă e urgență reală. Lea e cu tine — ce s-a întâmplat?';
    addMsg('l',em);_hist.push({r:'u',t:q});_hist.push({r:'l',t:em});saveHistory();
    if(_ek&&_vi)playVoice(em,null);return;
  }
  var tk=addMsg('l','',true);document.getElementById('amb').className='think';
  var h=new Date().getHours(),p=h<6?'noaptea':h<12?'dimineața':h<17?'după-amiaza':h<21?'seara':'noaptea';
  var city=_city||localStorage.getItem('vvme_home_city')||'zona ta';
  // Thinking message după 2s
  var thinkTimer=setTimeout(function(){var bub=document.querySelector('#tk-msg .msg-b');if(bub){bub.className='msg-b';bub.style.cssText='font-size:12px;color:var(--w30);font-style:italic;padding:11px 15px;';bub.textContent='Caut în '+city+'...';} },2000);
  // Hybrid search
  var vvP=searchVVNodes(q,intent);
  var personalCtx = buildPersonalContext() + ' ' + getVoiceContext();
var sysP='Ești Lea, asistentul urban VV. Caldă, directă, umană. MAX 3 propoziții. '+
    'Context: Oraș='+city+', Ora='+h+':00 ('+p+'). '+
    (displayName()?'User='+displayName()+'. ':'')+
    personalCtx+
    (h>=22||h<6?'NOAPTEA — majorit. locuri sunt închise. Menționează asta. ':'')+
    (intent==='mancare'&&h>=12&&h<=14?'ORA DE PRÂNZ — posibilă coadă. Avertizează. ':'')+
    'Nu spune "ca model AI". Dacă nu știi: spune "nu știu sigur, verificăm?". '+
    'Urgență=112 PRIMUL. Răspunde DOAR în română.';
  var contents=_hist.slice(-6).map(function(m){return{role:m.r==='l'?'model':'user',parts:[{text:m.t}]};});
  contents.push({role:'user',parts:[{text:q}]});
  // Proxy CEO — cheia e la Google, userii nu stiu ca exista
  var activeProxy = VV_PROXY !== 'PUNE_URL_APPS_SCRIPT_AICI' ? VV_PROXY : 
                    localStorage.getItem('vv_proxy_url') || '';
  var userKey = localStorage.getItem('lea_gk') || ''; // cheia personala optional
  
  var gemP;
  if(activeProxy) {
    // Prin proxy — CEO key in spate
    // GET in loc de POST — evita CORS complet
    var proxyParams = new URLSearchParams({
      action: 'gemini',
      system: sysP,
      q: q,
      city: city,
      userKey: userKey || '',
      h: String(h)
    });
    gemP = fetch(activeProxy + '?' + proxyParams.toString(), {
      method: 'GET'
    }).then(function(r){ return r.json(); })
      .then(function(d){
        if(d && d.status==='rateLimit') return {_rateLimit:true};
        if(d && d.status==='authError') return {_authError:true};
        return d;
      }).catch(function(){ return null; });
  } else if(userKey) {
    // Fallback — cheia personala a userului
    gemP = fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key='+userKey,{
      method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({system_instruction:{parts:[{text:sysP}]},contents:contents,generationConfig:{maxOutputTokens:200,temperature:0.75}})
    }).then(function(r){
      if(r.status===429) return {_rateLimit:true};
      if(r.status===403) return {_authError:true};
      return r.json();
    }).catch(function(){return null;});
  } else {
    // Nimic configurat
    if(tk) tk.remove();
    document.getElementById('amb').className='';
    addMsg('l','Lea se configurează. Revin în curând.');
    return;
  }
  var res=await Promise.all([vvP,gemP]);
  clearTimeout(thinkTimer);
  var vvNodes=res[0]||[],gemData=res[1];
  if(tk)tk.remove();document.getElementById('amb').className='';
  // Rate limit check
  if(gemData && gemData._rateLimit) {
    if(tk) tk.remove();
    document.getElementById('amb').className='';
    // Pulsatie lenta - Lea "respira"
    document.getElementById('amb').style.background='radial-gradient(circle,rgba(200,169,110,.06) 0%,transparent 65%)';
    document.getElementById('amb').style.animation='ap 3s ease-in-out infinite';
    var rlMsg='Sunt solicitată intens acum. Îmi trag sufletul 30 de secunde și revenim. Rămâi în ecosistem.';
    addMsg('l', rlMsg);
    if(_ek&&_vi) playVoice(rlMsg, null);
    // Countdown discret
    var cdEl=document.createElement('div');
    cdEl.style.cssText='align-self:center;font-size:10px;color:var(--w15);margin-top:-8px;';
    cdEl.id='cd-el';
    document.getElementById('conv').appendChild(cdEl);
    var cd=30;
    var cdInt=setInterval(function(){
      cd--;
      var el=document.getElementById('cd-el');
      if(el) el.textContent='Revin în '+cd+' secunde...';
      if(cd<=0){
        clearInterval(cdInt);
        document.getElementById('amb').style.animation='';
        if(el) el.textContent='Lea e din nou pregătită.';
        setTimeout(function(){if(el)el.remove();},2000);
      }
    },1000);
    return;
  }

  if(gemData && gemData._authError) {
    if(tk) tk.remove();
    document.getElementById('amb').className='';
    addMsg('l','Cheia API nu e validă. CEO-ul rezolvă în curând.');
    return;
  }

  var netAns=null;
  try{if(gemData&&gemData.candidates&&gemData.candidates[0]&&gemData.candidates[0].content)netAns=gemData.candidates[0].content.parts[0].text;}catch(e){}
  var ans='';
  if(vvNodes.length>0 && netAns){
    // CEL MAI BUN: date VV + context net
    var np='';
    vvNodes.slice(0,1).forEach(function(n){
      np+=(n.name||'')+(n.hours?' · '+n.hours:'')+(n.address?' · '+n.address:'')+'. ';
    });
    ans = np ? '✓ ' + np + '\n' + netAns : netAns;
  } else if(vvNodes.length>0){
    // Date VV fara net
    var nodeText='';
    vvNodes.slice(0,2).forEach(function(n){nodeText+=(n.name||'')+(n.hours?' · '+n.hours:'')+'. ';});
    ans='✓ În '+city+': '+nodeText+'Date confirmate VV.';
  } else if(netAns){
    // Doar net — marcheaza clar dar da raspuns util
    ans = netAns;
    if(['mancare','cafea','cumparaturi','divertisment'].includes(intent)){
      ans += '\n\n⚠ Date internet — neverificate fizic. Trimit un Insider să confirme?';
    }
  } else {
    // Nimic — Lea face o cautare de urgenta prin Gemini cu context mai specific
    ans = await emergencySearch(q, intent, city);
  }
  addMsg('l',ans);_hist.push({r:'u',t:q});_hist.push({r:'l',t:ans});
  if(ans && intent !== 'urgenta' && intent !== 'salut') saveCache(intent, city, ans);
  if(_hist.length>40)_hist=_hist.slice(-40);saveHistory();
  if(_ek&&_vi)playVoice(ans,null);
  fbAdd('vvhi_dataset',{action:'LEA_CHAT',context:{city,intent,hasVV:vvNodes.length>0},ts:Date.now()});
}

// ── VOICE ─────────────────────────────────────────────────────
async function playVoice(text,btn){
  if(!_ek||!_vi)return;
  if(btn){btn.textContent='⏳';btn.disabled=true;}
  if(_audio){_audio.pause();_audio=null;}
  try{
    var r=await fetch('https://api.elevenlabs.io/v1/text-to-speech/'+_vi,{method:'POST',headers:{'xi-api-key':_ek,'Content-Type':'application/json'},body:JSON.stringify({text,model_id:'eleven_multilingual_v2',voice_settings:{stability:.68,similarity_boost:.82,style:.38,use_speaker_boost:true}})});
    if(!r.ok){if(btn){btn.textContent='▶';btn.disabled=false;}return;}
    var blob=await r.blob();_audio=new Audio(URL.createObjectURL(blob));_audio.play();
    if(btn){btn.textContent='⏸';btn.disabled=false;btn.onclick=function(){_audio.pause();btn.textContent='▶';btn.onclick=function(){playVoice(text,btn);};};_audio.onended=function(){btn.textContent='▶';btn.onclick=function(){playVoice(text,btn);};};}
  }catch(e){if(btn){btn.textContent='▶';btn.disabled=false;}}
}
var _micActive = false;
var _audioCtx = null;

// Deblocheaza audio pe iOS la prima interactiune
function unlockAudio() {
  if(_audioCtx) return;
  try {
    _audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    var buf = _audioCtx.createBuffer(1,1,22050);
    var src = _audioCtx.createBufferSource();
    src.buffer = buf; src.connect(_audioCtx.destination); src.start(0);
  } catch(e) {}
}

function startMic(e) {
  if(e) { e.preventDefault(); e.stopPropagation(); }
  unlockAudio();
  if(_micActive) { stopMic(); return; }
  var SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if(!SR) {
    // Fallback: deschide tastatura
    document.getElementById('ibox').focus();
    showToast('Scrie mesajul tău');
    return;
  }
  _micActive = true;
  var m = document.getElementById('mic-b');
  var vv = document.getElementById('vvis');
  if(m) { m.classList.add('on'); m.textContent = '⏹'; }
  if(vv) vv.classList.add('on');
  document.getElementById('amb').className = 'listen';
  try {
    _rec = new SR();
    _rec.lang = 'ro-RO';
    _rec.continuous = false;
    _rec.interimResults = false;
    _rec.maxAlternatives = 1;
    _rec.onresult = function(ev) {
      var txt = ev.results[0][0].transcript;
      var conf = ev.results[0][0].confidence || 0.8;
      // Invata pattern vocal
      learnVoicePattern(txt, conf);
      document.getElementById('ibox').value = txt;
      stopMic(null);
      setTimeout(send, 300);
    };
    _rec.onerror = function(ev) {
      stopMic(null);
      if(ev.error !== 'aborted') showToast('Nu am înțeles. Mai încearcă.');
    };
    _rec.onend = function() { stopMic(null); };
    _rec.start();
  } catch(err) {
    stopMic(null);
    showToast('Microfonul nu e disponibil pe acest browser.');
  }
}

function stopMic(e) {
  if(e) { e.preventDefault(); e.stopPropagation(); }
  _micActive = false;
  var m = document.getElementById('mic-b');
  var vv = document.getElementById('vvis');
  if(m) { m.classList.remove('on'); m.textContent = '🎙'; }
  if(vv) vv.classList.remove('on');
  document.getElementById('amb').className = '';
  if(_rec) { try { _rec.stop(); } catch(err) {} _rec = null; }
}

// Voce playback cu iOS unlock
async function playVoiceUnlocked(text, btn) {
  unlockAudio();
  await playVoice(text, btn);
}

// ── LIMIT & DONATE ────────────────────────────────────────────
function getTodayKey(){var d=new Date();return'lea_m_'+d.getFullYear()+'_'+(d.getMonth()+1)+'_'+d.getDate();}
function getCount(){return parseInt(localStorage.getItem(getTodayKey())||'0');}
function incCount(){localStorage.setItem(getTodayKey(),(getCount()+1).toString());}
function getLimit(){var p=localStorage.getItem('lea_prem_until');return(p&&new Date(p)>new Date())?PREMIUM_LIMIT:DAILY_LIMIT;}
function canSend(){return getCount()<getLimit();}
function updateLimitBar(){
  var c=getCount(),lim=getLimit(),pct=Math.min(100,c/lim*100);
  var f=document.getElementById('lim-fill');if(f){f.style.width=pct+'%';f.className='lim-fill'+(pct>=80?' warn':'');}
  var l=document.getElementById('lim-lbl');if(l)l.textContent=c+'/'+lim+' azi';
}
function showDonate(){
  var conv=document.getElementById('conv');
  var ex=document.getElementById('donate-card');if(ex){conv.scrollTo({top:conv.scrollHeight,behavior:'smooth'});return;}
  var d=document.createElement('div');d.id='donate-card';d.className='donate';
  d.innerHTML='<div class="donate-t">'+getCount()+' mesaje azi.</div><div class="donate-s">Beta: '+DAILY_LIMIT+' mesaje/zi gratuit.<br>Donează 5€ → 100 mesaje/zi · 30 zile.</div><button class="donate-btn" onclick="window.open(\'https://revolut.me/vv\',\'_blank\')">Susțin Lea · 5€ →</button>';
  conv.appendChild(d);conv.scrollTo({top:conv.scrollHeight,behavior:'smooth'});
}

// ── SUGGESTIONS ───────────────────────────────────────────────
function buildSugs(){
  var h=new Date().getHours(),city=_city||'zonă';
  var items;
  if(h<6) items=['Farmacie gardă?','Taxi acum?','Ce livrează noaptea?','Urgență?'];
  else if(h<11) items=['Mi-e foame, ce e deschis?','Cafea în '+city+'?','Trafic acum?','Farmacie?'];
  else if(h<15) items=['Pizza în '+city+'?','Restaurant cu loc?','Livrare rapidă?','E coadă undeva?'];
  else if(h<19) items=['Cafenea cu loc?','Ce e deschis după 18?','Transport?','Magazin deschis?'];
  else items=['Ce livrează seara?','Bar deschis?','Farmacie nonstop?','Taxi spre casă?'];
  var s=document.getElementById('sugs');
  if(s)s.innerHTML=items.map(function(i){return'<div class="sug" onclick="useSug(\''+i.replace(/'/g,"\\'")+'\')">'+ i+'</div>';}).join('');
}
function useSug(t){document.getElementById('ibox').value=t;send();}

// ── CITY ──────────────────────────────────────────────────────
function detectCity(){
  var s=localStorage.getItem('vvme_current_city')||localStorage.getItem('vvme_home_city');
  if(s){_city=s;updateCityDisp(s);return;}
  if(!navigator.geolocation)return;
  navigator.geolocation.getCurrentPosition(function(p){
    fetch('https://nominatim.openstreetmap.org/reverse?format=json&lat='+p.coords.latitude+'&lon='+p.coords.longitude+'&accept-language=ro')
      .then(function(r){return r.json();}).then(function(d){
        var addr = d.address || {};
        var city = addr.city || addr.town || addr.village || addr.county || addr.state || 'zona ta';
        // Nu folosi "Romania" ca oras — e prea generic
        if(city === 'România' || city === 'Romania') city = addr.county || addr.state || 'zona ta';
        _city=city;localStorage.setItem('vvme_current_city',city);if(!localStorage.getItem('vvme_home_city'))localStorage.setItem('vvme_home_city',city);
        updateCityDisp(city);buildSugs();if(_u&&!_u.city){_u.city=city;localStorage.setItem('lea_u',JSON.stringify(_u));}
      }).catch(function(){});
  },function(){},{timeout:8000,enableHighAccuracy:true});
}
function updateCityDisp(c){var e=document.getElementById('tb-city');if(e&&c)e.textContent=c;}
function updateClock(){var n=new Date(),e=document.getElementById('idle-c');if(e)e.textContent=n.getHours().toString().padStart(2,'0')+':'+n.getMinutes().toString().padStart(2,'0');}

// ── SETTINGS ──────────────────────────────────────────────────
function openSett(){
  if(_u){
    var i=document.getElementById('ss-id'),r=document.getElementById('ss-rang'),c=document.getElementById('ss-city');
    if(i)i.textContent=_u.vvid||'—';
    var rm={ceo:'💎 CEO',founder:'💎 Fondator',citizen:'⬡ Cetățean VV'};
    if(r)r.textContent=rm[_u.type]||'Standard';
    if(c)c.textContent=_city||'—';
  }
  document.getElementById('sett').classList.add('on');
}
function closeSett(){document.getElementById('sett').classList.remove('on');}
function cfgVoice(){
  closeSett();
  // Schimbare nume
  var currentName = localStorage.getItem('lea_name') || '';
  var newName = prompt('Numele tău în Lea:\n(actual: ' + (currentName||'Anonim') + ')', currentName);
  if(newName && newName.trim().length >= 2) {
    var trimmed = newName.trim();
    localStorage.setItem('lea_name', trimmed);
    _userName = trimmed;
    if(_u) { _u.name = trimmed; localStorage.setItem('lea_u', JSON.stringify(_u)); }
    showToast('Numele actualizat: ' + trimmed);
  }
  // Proxy URL
  var p=prompt('URL Google Apps Script · opțional\n(lasă gol dacă nu ai):');
  if(p&&p.includes('script.google.com')){localStorage.setItem('vv_proxy_url',p);showToast('Proxy activat ✓');}
  // Cheia personala
  var g=prompt('Gemini API Key personală · opțional:');
  if(g&&g.startsWith('AIza')){localStorage.setItem('lea_gk',g);_gk=g;}
  var e=prompt('ElevenLabs API Key · opțional:');
  if(e&&e.length>10){localStorage.setItem('lea_ek',e);_ek=e;}
  var v=prompt('ElevenLabs Voice ID · opțional:');
  if(v&&v.length>5){localStorage.setItem('lea_vi',v);_vi=v;}
  showToast('Salvat ✓');
}
function logout(){
  if(!confirm('Resetezi identitatea VV pe acest device?'))return;
  ['lea_id','lea_u','lea_ob_done','lea_had_aer','lea_gk','lea_ek','lea_vi','vv_accord_signed','vv_citizen_code','vv_persona','vvme_home_city','vvme_current_city','vv_lea_profile',HKEY].forEach(function(k){localStorage.removeItem(k);});
  location.reload();
}

function showCardManual() {
  if(!_u) return;
  var conv = document.getElementById('conv');
  document.getElementById('idle').classList.add('off');
  var rankMap = {ceo:'💎 CEO · Fondator',founder:'💎 Fondator',citizen:'⬡ Cetățean VV'};
  var rank = rankMap[_u.type]||'⬡ VV';
  var city = _city||'—';
  var name = displayName();
  var xp = (_u.type==='ceo'||_u.type==='founder')?'XP: ∞':'XP: 1';
  var w = document.createElement('div');
  w.className='msg l';
  w.style.cssText='align-self:center;width:100%;max-width:260px;';
  w.innerHTML='<div class="id-card"><div class="id-top"><div class="id-logo">Lea</div><div class="id-rank">'+rank+'</div></div><div class="id-code">'+_u.vvid+'</div>'+(name?'<div class="id-name">'+name+'</div>':'')+'<div class="id-bot"><div class="id-city">📍 '+city+'</div><div class="id-xp">'+xp+'</div></div></div><div class="msg-meta">Lea · Identitatea ta</div>';
  conv.appendChild(w);
  conv.scrollTo({top:conv.scrollHeight,behavior:'smooth'});
}

function showToast(m){var t=document.getElementById('toast');t.textContent=m;t.classList.add('on');clearTimeout(t._t);t._t=setTimeout(function(){t.classList.remove('on');},3000);}
