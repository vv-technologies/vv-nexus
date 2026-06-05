var FORMSPREE = 'https://formspree.io/f/meepavqj';

// ── FIREBASE SYNC ─────────────────────────────────────────────
var _fbReady = false;

window.addEventListener('firebase-ready', function() {
  _fbReady = true;
  if (localStorage.getItem('vnex_uid')) fbSyncOnLoad();
  fbLoadFeed();
});

function generateUID() {
  return 'uid_' + Date.now() + '_' + Math.random().toString(36).slice(2, 9);
}

var PHRASE_WORDS = [
  'silver','forest','signal','ocean','tiger','stone','river','cloud','ember','blade',
  'echo','frost','amber','cedar','delta','flint','grove','haven','iris','jade',
  'kite','lumen','maple','north','orbit','pine','quest','raven','storm','terra',
  'ultra','valor','whale','xenon','yield','zenith','arc','bolt','cave','drift',
  'eagle','flame','glow','hawk','iron','jump','keen','lake','mist','noble'
];

function generatePhrase() {
  var words = PHRASE_WORDS.slice();
  var result = [];
  for (var i = 0; i < 3; i++) {
    var idx = Math.floor(Math.random() * words.length);
    result.push(words.splice(idx, 1)[0]);
  }
  return result.join('-');
}

function getPhrase() {
  return localStorage.getItem('vnex_phrase') || '';
}

function getUID() {
  var uid = localStorage.getItem('vnex_uid');
  if (!uid) {
    uid = generateUID();
    localStorage.setItem('vnex_uid', uid);
  }
  return uid;
}

async function fbSaveProfile() {
  if (!_fbReady) return;
  var uid  = getUID();
  var name = localStorage.getItem('vnex_builder_name') || '';
  if (!name) return;
  try {
    var db = window.VDB;
    var f  = window.VFire;
    await f.setDoc(f.doc(db, 'builders', uid), {
      name:          name,
      uid:           uid,
      phrase:        getPhrase(),
      projects:      getMyProjects(),
      log:           getLog(),
      universeName:  _vnexSettings['universe-name'] || '',
      about:         _vnexSettings.about || '',
      tags:          _vnexSettings.tags || [],
      updatedAt:     Date.now()
    });
  } catch(e){ console.log('fbSaveProfile error', e); }
}

async function fbSyncOnLoad() {
  if (!_fbReady) return;
  var uid = localStorage.getItem('vnex_uid');
  if (!uid) return;
  try {
    var db   = window.VDB;
    var f    = window.VFire;
    var snap = await f.getDoc(f.doc(db, 'builders', uid));
    if (!snap.exists()) return;
    var data = snap.data();
    if (data.projects && data.projects.length)
      localStorage.setItem('vnex_my_projects', JSON.stringify(data.projects));
    if (data.log && data.log.length)
      localStorage.setItem('vnex_builder_log', JSON.stringify(data.log));
    refreshMyCard();
    updateHeroStats();
  } catch(e){ console.log('fbSyncOnLoad error', e); }
}

async function fbRecoverByName(name, phrase) {
  if (!_fbReady) { toast('Connecting... try again in a second.'); return; }
  if (!name || !phrase) { toast('Enter both your name and recovery phrase.'); return; }
  try {
    var db   = window.VDB;
    var f    = window.VFire;
    var q    = f.query(f.collection(db, 'builders'), f.where('name', '==', name.trim()), f.where('phrase', '==', phrase.trim()));
    var snap = await f.getDocs(q);
    if (snap.empty) { toast('Name or phrase incorrect. Try again.'); return; }
    var data = snap.docs[0].data();
    var uid  = data.uid;
    localStorage.setItem('vnex_uid',          uid);
    localStorage.setItem('vnex_builder_name', data.name);
    localStorage.setItem('vnex_phrase',       data.phrase || '');
    localStorage.setItem('vnex_welcomed',     '1');
    if (data.projects) localStorage.setItem('vnex_my_projects', JSON.stringify(data.projects));
    if (data.log)      localStorage.setItem('vnex_builder_log', JSON.stringify(data.log));
    document.getElementById('welcome-modal').style.display = 'none';
    updateBuilderBadge();
    refreshMyCard();
    updateHeroStats();
    toast('✓ Welcome back, ' + data.name + '!');
  } catch(e){ toast('Error recovering account.'); console.log(e); }
}

// ── MY PROJECTS (localStorage) ───────────────────────────────
function getMyProjects() {
  try { return JSON.parse(localStorage.getItem('vnex_my_projects') || '[]'); } catch(e){ return []; }
}

function saveMyProject(p) {
  var list = getMyProjects();
  p.id = Date.now();
  p.createdAt = Date.now();
  list.unshift(p);
  localStorage.setItem('vnex_my_projects', JSON.stringify(list));
  fbSaveProfile();
}

function daysAgo(timestamp) {
  return Math.floor((Date.now() - timestamp) / 86400000) + 1;
}

function deleteMyProject(id) {
  var list = getMyProjects().filter(function(p){ return p.id !== id; });
  localStorage.setItem('vnex_my_projects', JSON.stringify(list));
}

var _spEditId = null;

function openEditProject(id) {
  var p = getMyProjects().find(function(x){ return x.id === id; });
  if (!p) return;
  _wsFromMySpace = true;
  spReset();
  _spEditId = id;

  // Pre-fill type
  document.querySelectorAll('.share-type-btn').forEach(function(btn){
    if (btn.getAttribute('onclick') && btn.getAttribute('onclick').includes("'" + p.type + "'")) {
      btn.classList.add('sel'); _spType = p.type;
    }
  });

  // Pre-fill stage
  document.querySelectorAll('.share-stage').forEach(function(btn){
    if (btn.getAttribute('onclick') && btn.getAttribute('onclick').includes("'" + p.stage + "'")) {
      btn.classList.add('sel'); _spStage = p.stage;
    }
  });

  // Pre-fill needs
  _spNeeds = (p.needs || []).slice();
  document.querySelectorAll('.share-need').forEach(function(btn){
    var onclick = btn.getAttribute('onclick') || '';
    _spNeeds.forEach(function(n){
      if (onclick.includes("'" + n + "'")) btn.classList.add('sel');
    });
  });

  // Pre-fill fields
  setTimeout(function(){
    var nameEl = document.getElementById('sp-name');
    var descEl = document.getElementById('sp-desc');
    var linkEl = document.getElementById('sp-link');
    var ghEl   = document.getElementById('sp-github');
    var vidEl  = document.getElementById('sp-video');
    var imgEl  = document.getElementById('sp-image');
    if (nameEl) nameEl.value = p.name   || '';
    if (descEl) descEl.value = p.desc   || '';
    if (linkEl) linkEl.value = p.link   || '';
    if (ghEl)   ghEl.value   = p.github || '';
    if (vidEl)  vidEl.value  = p.video  || '';
    if (imgEl)  { imgEl.value = p.image || ''; spPreviewImage(p.image || ''); }
    if (p.showDays) spToggleDays();
    if (p.lang) spSelLang(document.getElementById('sp-lang-' + p.lang) || document.getElementById('sp-lang-ro'), p.lang);
    var pwTitle = document.getElementById('pw-title'); if (pwTitle) pwTitle.textContent = 'Edit Project';
    var pwBtn = document.getElementById('pw-save-btn'); if (pwBtn) pwBtn.textContent = 'Save changes →';
  }, 50);

  document.getElementById('share-modal').style.display = 'flex';
}

function confirmDeleteProject(id) {
  var project = getMyProjects().find(function(p){ return p.id === id; });
  var name = project ? project.name : 'this project';
  if (!confirm('Delete "' + name + '"? This cannot be undone.')) return;
  deleteMyProject(id);
  refreshMyCard();
  updateHeroStats();
  openMyWorkspace();
  toast('✓ ' + name + ' deleted.');
}

// ── BUILDER INBOX ────────────────────────────────────────────
function getInbox() {
  try { return JSON.parse(localStorage.getItem('vnex_inbox') || '[]'); } catch(e){ return []; }
}

function saveInboxItem(item) {
  var inbox = getInbox();
  item.id       = Date.now();
  item.received = new Date().toLocaleDateString('en-GB', {day:'numeric', month:'short', year:'numeric'});
  item.read     = false;
  inbox.unshift(item);
  localStorage.setItem('vnex_inbox', JSON.stringify(inbox));
}

function deleteInboxItem(id) {
  var inbox = getInbox().filter(function(i){ return i.id !== id; });
  localStorage.setItem('vnex_inbox', JSON.stringify(inbox));
}

function generateFeedbackToken(type, text, project) {
  var data = { t: type, m: text, p: project || '', ts: Date.now() };
  try {
    return 'FBT:' + btoa(unescape(encodeURIComponent(JSON.stringify(data))));
  } catch(e){ return null; }
}

function decodeFeedbackToken(token) {
  try {
    if (!token.startsWith('FBT:')) return null;
    var json = decodeURIComponent(escape(atob(token.slice(4))));
    return JSON.parse(json);
  } catch(e){ return null; }
}

function importFeedbackToken() {
  var input = (document.getElementById('inbox-token-input') || {}).value || '';
  var token = input.trim();
  if (!token) return;
  var data = decodeFeedbackToken(token);
  if (!data) { toast('Invalid token.'); return; }
  var typeLabels = { idea:'💡 Idea', bug:'🐛 Bug', test:'🧪 Test Result', help:'🆘 Help' };
  saveInboxItem({ type: data.t, typeLabel: typeLabels[data.t] || data.t, text: data.m, project: data.p });
  document.getElementById('inbox-token-input').value = '';
  renderBuilderInbox();
  toast('✓ Feedback added to your inbox!');
}

function renderBuilderInbox() {
  var existing = document.getElementById('inbox-section');
  if (existing) existing.remove();

  var inbox = getInbox();
  var unread = inbox.filter(function(i){ return !i.read; }).length;

  var typeColors = {
    idea: 'rgba(99,102,241,.15)',
    bug:  'rgba(239,68,68,.15)',
    test: 'rgba(34,197,94,.15)',
    help: 'rgba(234,179,8,.15)'
  };

  var itemsHtml = inbox.length === 0
    ? '<div style="font-size:13px;color:var(--muted);padding:16px 0">No feedback yet. Share your feedback token with testers.</div>'
    : inbox.map(function(item){
        return '<div class="inbox-item">' +
          '<div class="inbox-type-badge" style="background:' + (typeColors[item.type]||'rgba(99,102,241,.15)') + '">' +
            ({idea:'💡',bug:'🐛',test:'🧪',help:'🆘'}[item.type]||'📬') +
          '</div>' +
          '<div class="inbox-body">' +
            (item.project ? '<div class="inbox-project">' + item.project + '</div>' : '') +
            '<div class="inbox-text">' + item.text + '</div>' +
            '<div class="inbox-time">' + item.received + '</div>' +
          '</div>' +
          '<button class="inbox-del" onclick="deleteInboxItem(' + item.id + ');renderBuilderInbox()" title="Dismiss">×</button>' +
        '</div>';
      }).join('');

  var section = document.createElement('div');
  section.id = 'inbox-section';
  section.style.cssText = 'margin-top:32px;border-top:1px solid var(--border);padding-top:24px';
  section.innerHTML =
    '<div style="font-size:10px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:var(--muted);margin-bottom:16px">' +
      '📬 Builder Inbox' + (unread ? ' <span style="background:var(--accent);color:#fff;border-radius:100px;padding:1px 7px;font-size:9px;margin-left:4px">' + unread + '</span>' : '') +
    '</div>' +
    '<div style="background:rgba(255,255,255,.03);border:1px solid var(--border);border-radius:14px;padding:14px;margin-bottom:16px;display:flex;gap:8px">' +
      '<input id="inbox-token-input" placeholder="Paste feedback token here... FBT:..." style="flex:1;background:none;border:none;outline:none;color:var(--text);font-size:13px;font-family:\'Courier New\',monospace">' +
      '<button onclick="importFeedbackToken()" style="background:var(--accent);color:#fff;border:none;border-radius:8px;padding:7px 16px;font-size:12px;font-weight:700;cursor:pointer;font-family:inherit;white-space:nowrap">Import →</button>' +
    '</div>' +
    '<div id="inbox-items">' + itemsHtml + '</div>';

  document.querySelector('.workspace-page').appendChild(section);
}

// ── BUILDER LOG ───────────────────────────────────────────────
function getLog() {
  try { return JSON.parse(localStorage.getItem('vnex_builder_log') || '[]'); } catch(e){ return []; }
}

function addLogEntry(text, link, project) {
  var log = getLog();
  log.unshift({
    id:      Date.now(),
    text:    text,
    link:    link  || '',
    project: project || '',
    date:    new Date().toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' }),
    ts:      Date.now()
  });
  localStorage.setItem('vnex_builder_log', JSON.stringify(log));
  fbSaveProfile();
}

function deleteLogEntry(id) {
  var log = getLog().filter(function(e){ return e.id !== id; });
  localStorage.setItem('vnex_builder_log', JSON.stringify(log));
}

// ── GALLERY ──────────────────────────────────────────────────
function getGallery() {
  try { return JSON.parse(localStorage.getItem('vnex_gallery') || '[]'); } catch(e){ return []; }
}
function addGalleryItem(title, url, project, mood) {
  var g = getGallery();
  g.unshift({ id:Date.now(), title:title, url:url, project:project||'', mood:mood||'', date:new Date().toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'}) });
  localStorage.setItem('vnex_gallery', JSON.stringify(g));
}
function deleteGalleryItem(id) {
  var g = getGallery().filter(function(i){ return i.id !== id; });
  localStorage.setItem('vnex_gallery', JSON.stringify(g));
}

// ── TIMELINE ─────────────────────────────────────────────────
function getTimeline() {
  try { return JSON.parse(localStorage.getItem('vnex_timeline') || '[]'); } catch(e){ return []; }
}
function addTimelineEntry(date, text, project) {
  var tl = getTimeline();
  tl.unshift({ id:Date.now(), date:date, text:text, project:project||'' });
  tl.sort(function(a,b){ return new Date(b.date) - new Date(a.date); });
  localStorage.setItem('vnex_timeline', JSON.stringify(tl));
}
function deleteTimelineEntry(id) {
  var tl = getTimeline().filter(function(e){ return e.id !== id; });
  localStorage.setItem('vnex_timeline', JSON.stringify(tl));
}

// ── TABS ─────────────────────────────────────────────────────
function scrollFeed(){ document.getElementById('feed-anchor').scrollIntoView({behavior:'smooth'}); }

function setTab(el){
  document.querySelectorAll('.tab').forEach(function(t){ t.classList.remove('active'); });
  el.classList.add('active');
  var txt = el.textContent.toLowerCase();
  var filter = 'all';
  if (txt.indexOf('testers') !== -1) filter = 'testers';
  else if (txt.indexOf('help') !== -1) filter = 'help';
  else if (txt.indexOf('ideas') !== -1) filter = 'ideas';
  else if (txt.indexOf('launched') !== -1) filter = 'launched';
  renderFeed(filter);
}
function setTabByName(name){
  document.querySelectorAll('.tab').forEach(function(t){
    if (t.textContent.indexOf(name) !== -1) { t.click(); t.scrollIntoView({behavior:'smooth',block:'center'}); }
  });
}

// ── MODALS ───────────────────────────────────────────────────
function openModal(id){ document.getElementById(id).style.display='flex'; }
function closeModal(id){ document.getElementById(id).style.display='none'; }

// ── FEEDBACK ─────────────────────────────────────────────────
var _currentProject = '';
var _currentType = '';

function openFeedback(project, type) {
  _currentProject = project;
  _currentType = type;
  document.getElementById('fb-modal-title').textContent = 'Feedback for ' + project;
  document.getElementById('fb-modal-sub').textContent = 'Your feedback helps the builder improve.';
  var typeMap = { suggest: 0, bug: 1, test: 2, help: 3, vote: 0 };
  var idx = typeMap[type] || 0;
  document.querySelectorAll('.ft-option').forEach(function(o, i){ o.classList.toggle('sel', i === idx); });
  var name = getBuilderName();
  var senderEl = document.getElementById('fb-sender');
  if (senderEl) senderEl.textContent = name ? 'Sending as ' + name + ' · ' + getBuilderRank(getBuilderXP()).label : '';
  openModal('feedback-modal');
}

function selFT(el, icon, name) {
  document.querySelectorAll('.ft-option').forEach(function(o){ o.classList.remove('sel'); });
  el.classList.add('sel');
}

function vote(el, project, idx) {
  addStat('vote');
  var xp = addXP(10);
  var name = getBuilderName();
  toast((name ? name + ' voted! ' : 'Vote recorded! ') + '+10 XP · ' + getBuilderRank(xp).label);
}

function predict(el, choice) {
  addStat('predict');
  var xp = addXP(20);
  var name = getBuilderName();
  toast(choice === 'yes'
    ? '✓ ' + (name || 'You') + ' bet: Will ship! +20 XP'
    : '✗ ' + (name || 'You') + ' bet: Won\'t ship. +20 XP');
}

function addStat(type) {
  var s = {};
  try { s = JSON.parse(localStorage.getItem('vnex_stats') || '{}'); } catch(e){}
  s[type] = (s[type] || 0) + 1;
  localStorage.setItem('vnex_stats', JSON.stringify(s));
}

function getStats() {
  try { return JSON.parse(localStorage.getItem('vnex_stats') || '{}'); } catch(e){ return {}; }
}

function submitFeedback(e) {
  e.preventDefault();
  var text = (document.getElementById('fb-text') || {}).value || '';
  if (!text.trim()) { toast('Write something first.'); return; }

  var token = generateFeedbackToken(_currentType, text.trim(), _currentProject);
  addStat(_currentType);
  var xp   = addXP(50);
  var rank = getBuilderRank(xp);

  // Arată token-ul în modal
  var form = e.target;
  form.style.display = 'none';
  var tokenDiv = document.createElement('div');
  tokenDiv.className = 'token-reveal';
  tokenDiv.innerHTML =
    '<div style="font-size:13px;font-weight:700;color:var(--text);margin-bottom:6px">✓ Feedback created! +' + 50 + ' XP</div>' +
    '<div style="font-size:12px;color:var(--muted2);margin-bottom:10px">Copy this token and give it to the builder to import in their inbox:</div>' +
    '<div class="token-code">' + token + '</div>' +
    '<button onclick="navigator.clipboard.writeText(\'' + token + '\').then(function(){document.getElementById(\'copy-token-btn\').textContent=\'✓ Copied!\'}).catch(function(){})" id="copy-token-btn" style="background:var(--accent);color:#fff;border:none;border-radius:8px;padding:8px 20px;font-size:12px;font-weight:700;cursor:pointer;font-family:inherit;margin-top:4px">📋 Copy token</button>';
  form.parentNode.insertBefore(tokenDiv, form.nextSibling);

  setTimeout(function(){
    tokenDiv.remove();
    form.style.display = '';
    closeModal('feedback-modal');
    form.reset();
  }, 8000);
}

function submitPost(e) {
  e.preventDefault();
  fetch(FORMSPREE, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ type:'project-submit', source:'vnex' }) });
  closeModal('post-modal');
  toast('✓ Project submitted! We\'ll add it within 24h.');
  e.target.reset();
}

function submitWL(e) {
  e.preventDefault();
  var email = document.getElementById('wl-email') || document.getElementById('wl-modal-email');
  fetch(FORMSPREE, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ email: email ? email.value:'', type:'vnex-waitlist', source:'vnex' }) });
  closeModal('waitlist-modal');
  toast('✓ You\'re on the waitlist!');
  e.target.reset();
}

function toast(msg){
  var el = document.getElementById('toast');
  el.textContent = msg; el.classList.add('show');
  setTimeout(function(){ el.classList.remove('show'); }, 2800);
}

// ── BUILDER IDENTITY + XP ────────────────────────────────────
var RANKS = [
  { min:0,   label:'Visitor'      },
  { min:10,  label:'Tester'       },
  { min:50,  label:'Contributor'  },
  { min:100, label:'Core Builder' }
];

function getBuilderName() {
  return localStorage.getItem('vnex_builder_name') || null;
}

function getBuilderXP() {
  return parseInt(localStorage.getItem('vnex_xp') || '0');
}

function getBuilderRank(xp) {
  var rank = RANKS[0];
  for (var i = 0; i < RANKS.length; i++) {
    if (xp >= RANKS[i].min) rank = RANKS[i];
  }
  return rank;
}

function addXP(amount) {
  var xp = getBuilderXP() + amount;
  localStorage.setItem('vnex_xp', xp);
  updateBuilderBadge();
  return xp;
}

function updateBuilderBadge() {
  var name = getBuilderName();
  if (!name) return;
  var xp   = getBuilderXP();
  var rank = getBuilderRank(xp);

  var badge = document.getElementById('builder-badge');
  if (badge) {
    badge.style.display = 'flex';
    document.getElementById('builder-badge-name').textContent = name;
    document.getElementById('builder-badge-rank').textContent = ' · ' + rank.label;
  }

  var senderEl = document.getElementById('fb-sender');
  if (senderEl) senderEl.textContent = 'Sending as ' + name + ' · ' + rank.label;

  // Inițializează cardul userului în feed
  var myCard = document.getElementById('my-builder-card');
  var emptyCard = document.getElementById('empty-state-card');
  if (myCard) {
    myCard.style.display = '';
    document.getElementById('my-card-avatar').textContent = name.charAt(0).toUpperCase();
    document.getElementById('my-card-name').textContent   = name;
  }
  if (emptyCard) emptyCard.style.display = 'none';
  refreshMyCard();
}

var _pickedName = '';

function pickName(el) {
  document.querySelectorAll('.name-sug').forEach(function(n){ n.classList.remove('sel'); });
  el.classList.add('sel');
  _pickedName = el.textContent;
  document.getElementById('builder-name-input').value = '';
}

function clearNameSug() {
  document.querySelectorAll('.name-sug').forEach(function(n){ n.classList.remove('sel'); });
  _pickedName = '';
}

function generateUserCode() {
  var chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  var part = function(n){ var s=''; for(var i=0;i<n;i++) s+=chars[Math.floor(Math.random()*chars.length)]; return s; };
  return 'VNEX-' + part(4) + '-' + part(4) + '-' + part(4);
}

function setBuilderName() {
  var input = document.getElementById('builder-name-input').value.trim();
  var name  = input || _pickedName;
  if (!name) { toast('Choose a name first.'); return; }
  getUID();
  var phrase = generatePhrase();
  localStorage.setItem('vnex_builder_name', name);
  localStorage.setItem('vnex_phrase', phrase);
  localStorage.setItem('vnex_welcomed', '1');
  showPhraseReveal(name, phrase);
  setTimeout(fbSaveProfile, 500);
}

function showPhraseReveal(name, phrase) {
  var wrap = document.querySelector('#welcome-modal .welcome-wrap');
  wrap.innerHTML =
    '<div style="font-size:28px;margin-bottom:12px">🔐</div>' +
    '<div style="font-size:18px;font-weight:900;margin-bottom:6px">Save your recovery phrase</div>' +
    '<div style="font-size:13px;color:var(--muted2);margin-bottom:20px;line-height:1.6">If you switch devices or lose access, you\'ll need your <strong style="color:var(--text)">name + these 3 words</strong>. We don\'t store this.</div>' +
    '<div style="background:rgba(99,102,241,.1);border:2px solid rgba(99,102,241,.3);border-radius:14px;padding:20px;margin-bottom:16px;text-align:center">' +
      '<div style="font-size:11px;color:var(--muted);font-weight:700;letter-spacing:1px;text-transform:uppercase;margin-bottom:10px">Recovery Phrase</div>' +
      '<div style="font-size:11px;color:var(--muted2);margin-bottom:6px">' + name + '</div>' +
      '<div style="font-size:22px;font-weight:900;color:var(--accent2);letter-spacing:2px">' + phrase + '</div>' +
      '<div style="font-size:11px;color:var(--muted);margin-top:10px">Write these 3 words down. Screenshot them.</div>' +
    '</div>' +
    '<button onclick="navigator.clipboard.writeText(\'' + name + ' / ' + phrase + '\').then(function(){toast(\'✓ Copied!\')}).catch(function(){})" style="width:100%;background:rgba(99,102,241,.1);border:1px solid rgba(99,102,241,.2);border-radius:10px;padding:11px;font-size:13px;font-weight:600;color:var(--accent2);cursor:pointer;font-family:inherit;margin-bottom:10px">📋 Copy phrase</button>' +
    '<button onclick="enterVNEX()" style="width:100%;background:var(--accent);color:#fff;border:none;border-radius:12px;padding:14px;font-size:14px;font-weight:700;cursor:pointer;font-family:inherit">I saved it — Enter VNEX →</button>';
}

function showCodeReveal(name, code) {
  var modal = document.getElementById('welcome-modal');
  var wrap  = modal.querySelector('.welcome-wrap');
  wrap.innerHTML =
    '<div style="font-size:28px;margin-bottom:12px">🔐</div>' +
    '<div style="font-size:18px;font-weight:900;margin-bottom:6px">Save your access code</div>' +
    '<div style="font-size:13px;color:var(--muted2);margin-bottom:20px;line-height:1.6">This is the only way to recover your space if you switch browsers or clear your cache. <strong style="color:#f87171">We don\'t store it anywhere.</strong></div>' +
    '<div style="background:rgba(99,102,241,.1);border:2px solid rgba(99,102,241,.3);border-radius:14px;padding:20px;margin-bottom:20px;text-align:center">' +
      '<div style="font-size:11px;color:var(--muted);font-weight:700;letter-spacing:1px;text-transform:uppercase;margin-bottom:8px">Your VNEX Code</div>' +
      '<div style="font-size:22px;font-weight:900;color:var(--accent2);letter-spacing:3px;font-family:\'Courier New\',monospace">' + code + '</div>' +
      '<div style="font-size:11px;color:var(--muted);margin-top:8px">Write it down or screenshot it now.</div>' +
    '</div>' +
    '<button onclick="copyCode(\'' + code + '\')" style="width:100%;background:rgba(99,102,241,.1);border:1px solid rgba(99,102,241,.2);border-radius:10px;padding:11px;font-size:13px;font-weight:600;color:var(--accent2);cursor:pointer;font-family:inherit;margin-bottom:10px">📋 Copy code</button>' +
    '<button onclick="enterVNEX()" style="width:100%;background:var(--accent);color:#fff;border:none;border-radius:12px;padding:14px;font-size:14px;font-weight:700;cursor:pointer;font-family:inherit">I saved it — Enter VNEX →</button>';
}

function copyCode(code) {
  navigator.clipboard.writeText(code).then(function(){ toast('✓ Code copied!'); }).catch(function(){ toast(code); });
}

function enterVNEX() {
  document.getElementById('welcome-modal').style.display = 'none';
  updateBuilderBadge();
}

function restoreWithCode() {
  var input = (document.getElementById('restore-code-input')||{}).value||'';
  var code  = input.trim().toUpperCase();
  if (!code.startsWith('VNEX-') || code.length < 17) {
    toast('Invalid code. Format: VNEX-XXXX-XXXX-XXXX'); return;
  }
  // Codul e valid — restaurăm identitatea
  localStorage.setItem('vnex_user_code', code);
  localStorage.setItem('vnex_welcomed', '1');
  // Dacă nu are nume salvat, îi cerem
  if (!localStorage.getItem('vnex_builder_name')) {
    toast('Code accepted. Now choose your builder name.');
    return;
  }
  document.getElementById('welcome-modal').style.display = 'none';
  updateBuilderBadge();
  toast('✓ Welcome back!');
}

function deleteAccount() {
  if (!confirm('Delete everything? This cannot be undone.')) return;
  var keys = ['vnex_builder_name','vnex_user_code','vnex_welcomed','vnex_xp','vnex_stats',
              'vnex_settings','vnex_my_projects','vnex_builder_log','vnex_gallery','vnex_timeline'];
  keys.forEach(function(k){ localStorage.removeItem(k); });
  closeSettings();
  location.reload();
}

function generateCodeForExisting() {
  var code = generateUserCode();
  localStorage.setItem('vnex_user_code', code);
  var codeEl = document.getElementById('settings-code-display');
  var genBtn  = document.getElementById('btn-generate-code');
  if (codeEl) codeEl.textContent = code;
  if (genBtn) genBtn.style.display = 'none';
  navigator.clipboard.writeText(code).then(function(){ toast('✓ Code generated & copied! Save it.'); }).catch(function(){ toast('Code: ' + code + ' — save it!'); });
}

function copyCodeFromSettings() {
  var code = localStorage.getItem('vnex_user_code') || '';
  if (!code) { toast('No code found.'); return; }
  navigator.clipboard.writeText(code).then(function(){ toast('✓ Code copied!'); }).catch(function(){ toast(code); });
}

function updateHeroStats() {
  var projects = getMyProjects().length;
  var logs     = getLog().length;
  var bEl = document.getElementById('hs-builders');
  var pEl = document.getElementById('hs-projects');
  var lEl = document.getElementById('hs-logs');
  var total = _allBuilders.length + (getBuilderName() ? 1 : 0);
  if (bEl) bEl.textContent = total || (getBuilderName() ? 1 : 0);
  if (pEl) pEl.textContent = projects;
  if (lEl) lEl.textContent = logs;
}

// ── FEED — LOAD & FILTER ─────────────────────────────────────
var _allBuilders = [];
var _activeFilter = 'all';

async function fbLoadFeed() {
  if (!_fbReady) return;
  try {
    var db = window.VDB, f = window.VFire;
    var myUid = localStorage.getItem('vnex_uid') || '';
    var snap = await f.getDocs(f.collection(db, 'builders'));
    _allBuilders = [];
    snap.forEach(function(doc) {
      var d = doc.data();
      if (d.uid !== myUid && d.name) _allBuilders.push(d);
    });
    renderFeed(_activeFilter);
    updateHeroStats();
  } catch(e) { console.log('fbLoadFeed error', e); }
}

function renderFeed(filter) {
  _activeFilter = filter || 'all';
  var feed = document.getElementById('builders-feed');
  feed.querySelectorAll('.bcard.dynamic').forEach(function(c){ c.remove(); });

  var myCard = document.getElementById('my-builder-card');
  var emptyCard = document.getElementById('empty-state-card');

  var ICONS = { game:'🎮', app:'📱', ai:'🧠', tool:'🛠', website:'🌐', experiment:'🧪' };
  var STAGE = { idea:'💡 Idea', building:'🔨 Building', testing:'🧪 Testing', earlyaccess:'🔓 Early Access', live:'🚀 Live' };
  var NEED_LABELS = { testers:'🧪 Testers', feedback:'💬 Feedback', ideas:'💡 Ideas', bugs:'🐛 Bugs', help:'🆘 Help' };

  var visible = 0;
  _allBuilders.forEach(function(b) {
    // Filter
    var needs = [];
    (b.projects || []).forEach(function(p){ (p.needs||[]).forEach(function(n){ if(needs.indexOf(n)===-1)needs.push(n); }); });
    var stage = (b.projects||[]).some(function(p){ return p.stage==='live'||p.stage==='earlyaccess'; });

    if (filter === 'testers' && needs.indexOf('testers') === -1) return;
    if (filter === 'help'    && needs.indexOf('help') === -1)    return;
    if (filter === 'ideas'   && needs.indexOf('ideas') === -1)   return;
    if (filter === 'launched' && !stage)                          return;

    visible++;
    var displayName = b.universeName || b.name;
    var avatar = displayName.charAt(0).toUpperCase();
    var projHtml = (b.projects||[]).slice(0,4).map(function(p){
      return '<span class="bcard-proj">' + (ICONS[p.type]||'📦') + ' ' + p.name + '</span>';
    }).join('') || '<span style="font-size:11px;color:var(--muted)">No projects yet</span>';

    var needHtml = needs.slice(0,3).map(function(n){
      return '<span class="bcard-need">' + (NEED_LABELS[n]||n) + '</span>';
    }).join('');

    var lastProj = b.projects && b.projects[0];
    var updateTxt = lastProj
      ? 'Building: ' + lastProj.name + ' · ' + (STAGE[lastProj.stage]||lastProj.stage)
      : (b.about || 'Active builder');

    var card = document.createElement('div');
    card.className = 'bcard dynamic';
    card.setAttribute('data-uid', b.uid);
    card.setAttribute('data-needs', needs.join(','));
    card.innerHTML =
      '<div class="bcard-top">' +
        '<div class="bcard-avatar" style="background:linear-gradient(135deg,#818cf8,#6366f1)">' + avatar + '</div>' +
        '<div>' +
          '<div class="bcard-name">' + displayName + '</div>' +
          '<div class="bcard-rank">' + (b.projects||[]).length + ' projects' + (b.about ? '' : '') + '</div>' +
        '</div>' +
      '</div>' +
      (b.about ? '<div style="font-size:12px;color:var(--muted2);margin-bottom:8px;line-height:1.5">' + b.about + '</div>' : '') +
      '<div class="bcard-projects">' + projHtml + '</div>' +
      '<div class="bcard-update">' + updateTxt + '</div>' +
      '<div class="bcard-footer">' +
        '<span>' + needHtml + '</span>' +
        '<button class="bcard-btn" onclick="openVisitorSpace(\'' + b.uid + '\')">Enter Universe →</button>' +
      '</div>';

    feed.insertBefore(card, emptyCard || null);
  });

  if (emptyCard) emptyCard.style.display = visible === 0 && !getBuilderName() ? '' : 'none';
}

// ── VISITOR UNIVERSE VIEW ─────────────────────────────────────
function openVisitorSpace(uid) {
  var b = _allBuilders.find(function(x){ return x.uid === uid; });
  if (!b) { toast('Universe not found.'); return; }

  var displayName = b.universeName || b.name;
  var avatar = displayName.charAt(0).toUpperCase();

  document.getElementById('ws-avatar').textContent = avatar;
  document.getElementById('ws-avatar').style.background = 'linear-gradient(135deg,#818cf8,#6366f1)';
  document.getElementById('ws-name').textContent = displayName + ' Universe';
  document.getElementById('ws-sub').textContent  = b.about || 'Builder on VNEX';

  var projects = b.projects || [];
  var logs     = b.log || [];

  document.getElementById('ws-stats-grid').innerHTML =
    '<div class="ws-stat"><div class="ws-stat-val">' + projects.length + '</div><div class="ws-stat-lbl">Projects</div></div>' +
    '<div class="ws-stat"><div class="ws-stat-val">' + logs.length + '</div><div class="ws-stat-lbl">Logs</div></div>' +
    '<div class="ws-stat"><div class="ws-stat-val">' + (b.tags||[]).length + '</div><div class="ws-stat-lbl">Tags</div></div>';

  var ICONS  = { game:'🎮', app:'📱', ai:'🧠', tool:'🛠', website:'🌐', experiment:'🧪' };
  var STAGES = { idea:'💡 Idea', building:'🔨 Building', testing:'🧪 Testing', earlyaccess:'🔓 Early Access', live:'🚀 Live' };
  var NEED_L = { testers:'🧪 Testers', feedback:'💬 Feedback', ideas:'💡 Ideas', bugs:'🐛 Bugs', help:'🆘 Help' };

  var feed = document.getElementById('ws-feed');
  if (!projects.length) {
    feed.innerHTML = '<div style="text-align:center;padding:40px;color:var(--muted);font-size:13px">No projects shared yet.</div>';
  } else {
    feed.innerHTML = projects.map(function(p) {
      var needHtml = (p.needs||[]).map(function(n){
        return '<button class="fb-btn test" onclick="openFeedback(\'' + p.name + '\',\'test\')">' + (NEED_L[n]||n) + '</button>';
      }).join('');
      var linkBtn = p.link ? '<a href="' + p.link + '" target="_blank" style="display:inline-flex;align-items:center;gap:5px;background:rgba(34,197,94,.1);border:1px solid rgba(34,197,94,.25);border-radius:8px;padding:5px 12px;font-size:11px;font-weight:700;color:#4ade80;text-decoration:none">▶ Open</a>' : '';
      return '<div class="pcard" style="margin-bottom:14px">' +
        '<div class="pcard-img" style="background:linear-gradient(135deg,#0d0d20,#1a1a35)">' +
          '<div class="pcard-img-emoji">' + (ICONS[p.type]||'📦') + '</div>' +
          '<div class="pcard-img-overlay"></div>' +
          '<div class="pcard-status-pin"><span class="status-badge s-building">' + (STAGES[p.stage]||p.stage) + '</span></div>' +
        '</div>' +
        '<div class="pcard-body">' +
          '<div class="pcard-head"><div><div class="pcard-name">' + p.name + '</div>' +
          '<div class="pcard-by">by ' + b.name + (p.lang ? ' · ' + (p.lang==='ro'?'🇷🇴':p.lang==='en'?'🇬🇧':'🌐') : '') + '</div></div></div>' +
          (p.desc ? '<div class="pcard-desc">' + p.desc + '</div>' : '') +
          '<div class="feedback-board"><div class="fb-actions">' + needHtml +
            '<button class="fb-btn suggest" onclick="openFeedback(\'' + p.name + '\',\'suggest\')">💡 Suggest</button>' +
            '<button class="fb-btn bug" onclick="openFeedback(\'' + p.name + '\',\'bug\')">🐛 Bug</button>' +
            linkBtn +
          '</div></div>' +
        '</div>' +
      '</div>';
    }).join('');
  }

  document.getElementById('ws-tabs').innerHTML = '';
  document.getElementById('workspace-modal').style.display = 'block';
  window.scrollTo(0, 0);
}

// ── WELCOME ──────────────────────────────────────────────────
(function(){
  if (!localStorage.getItem('vnex_welcomed')) {
    document.getElementById('welcome-modal').style.display = 'flex';
  } else {
    updateBuilderBadge();
  }
  updateHeroStats();
})();

function acceptWelcome() {
  document.getElementById('welcome-btn-accept').style.display = 'none';
  document.querySelectorAll('.welcome-rules,.welcome-disclaimer').forEach(function(el){ el.style.display='none'; });
  document.getElementById('welcome-step2').style.display = '';
}

// ── SETTINGS ─────────────────────────────────────────────────
var _vnexSettings = {};
try { _vnexSettings = JSON.parse(localStorage.getItem('vnex_settings') || '{}'); } catch(e){}
if (_vnexSettings.theme) applyTheme(_vnexSettings.theme);

function openSettings() {
  var uname = document.getElementById('s-universe-name');
  var about = document.getElementById('s-about');
  if (uname && _vnexSettings['universe-name']) uname.value = _vnexSettings['universe-name'];
  if (about && _vnexSettings.about) about.value = _vnexSettings.about;
  var savedTags = _vnexSettings.tags || [];
  document.querySelectorAll('#s-tags-group .tag-opt').forEach(function(el) {
    el.classList.toggle('sel', savedTags.indexOf(el.getAttribute('data-tag') || el.textContent.toLowerCase()) > -1);
  });
  var savedVis = _vnexSettings.visibility || 'hybrid';
  document.querySelectorAll('.vis-opt').forEach(function(el) {
    el.classList.toggle('sel', el.getAttribute('data-vis') === savedVis);
  });
  document.getElementById('settings-modal').style.display = 'flex';
}
function closeSettings() { document.getElementById('settings-modal').style.display = 'none'; }

function showSettingsTab(el, tab) {
  document.querySelectorAll('.settings-tab').forEach(function(t){ t.classList.remove('active'); });
  el.classList.add('active');
  ['profile','appearance','notifications','privacy'].forEach(function(t){
    var el = document.getElementById('stab-' + t);
    if (el) el.style.display = t === tab ? '' : 'none';
  });
}

function selSetting(el, group, val) {
  el.closest('.theme-opts,.lang-opts').querySelectorAll('.theme-opt,.lang-opt').forEach(function(o){ o.classList.remove('sel'); });
  el.classList.add('sel');
  _vnexSettings[group] = val;
  if (group === 'theme') applyTheme(val);
}

function applyTheme(theme) {
  var prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  var useDark = theme === 'dark' || (theme === 'system' && prefersDark);
  if (useDark) {
    document.documentElement.style.setProperty('--bg','#07070f');
    document.documentElement.style.setProperty('--s1','#0d0d18');
    document.documentElement.style.setProperty('--text','#eeeeff');
    document.documentElement.style.setProperty('--muted','#5a587a');
  } else {
    document.documentElement.style.setProperty('--bg','#f4f4f8');
    document.documentElement.style.setProperty('--s1','#ffffff');
    document.documentElement.style.setProperty('--text','#1a1a2e');
    document.documentElement.style.setProperty('--muted','#6b7280');
  }
}

function toggleNotif(el) { el.classList.toggle('on'); }

function saveSettings() {
  var uname = document.getElementById('s-universe-name');
  var about = document.getElementById('s-about');
  if (uname) _vnexSettings['universe-name'] = uname.value.trim();
  if (about) _vnexSettings.about = about.value.trim();
  var selTags = [];
  document.querySelectorAll('#s-tags-group .tag-opt.sel').forEach(function(el) {
    selTags.push(el.getAttribute('data-tag') || el.textContent.toLowerCase());
  });
  _vnexSettings.tags = selTags;
  var visEl = document.querySelector('.vis-opt.sel');
  if (visEl) _vnexSettings.visibility = visEl.getAttribute('data-vis') || 'public';
  localStorage.setItem('vnex_settings', JSON.stringify(_vnexSettings));
  closeSettings();
  toast('✓ Saved.');
}

function toggleTag(el, val) {
  el.setAttribute('data-tag', val);
  el.classList.toggle('sel');
}

function selVisibility(el, val) {
  el.setAttribute('data-vis', val);
  el.closest('.visibility-opts').querySelectorAll('.vis-opt').forEach(function(o) { o.classList.remove('sel'); });
  el.classList.add('sel');
  _vnexSettings.visibility = val;
}

// ── SHARE FLOW ───────────────────────────────────────────────
var _spType  = '';
var _spStage = '';
var _spNeeds = [];
var _spLang  = 'ro';

function openShareProject() {
  spReset();
  document.getElementById('share-modal').style.display = 'flex';
}
function closeShareProject() { document.getElementById('share-modal').style.display = 'none'; }

function spSelLang(el, lang) {
  _spLang = lang;
  ['sp-lang-ro','sp-lang-en','sp-lang-both'].forEach(function(id){
    var e = document.getElementById(id); if (e) e.classList.remove('sel');
  });
  el.classList.add('sel');
}

function spReset() {
  _spType = ''; _spStage = ''; _spNeeds = []; _spLang = 'ro'; _spEditId = null;
  document.querySelectorAll('.share-type-btn,.pw-type-btn,.share-stage,.share-need').forEach(function(el){ el.classList.remove('sel'); });
  var roEl = document.getElementById('sp-lang-ro');
  if (roEl) { ['sp-lang-ro','sp-lang-en','sp-lang-both'].forEach(function(id){var e=document.getElementById(id);if(e)e.classList.remove('sel');}); roEl.classList.add('sel'); }
  var imgEl = document.getElementById('sp-image'); if (imgEl) imgEl.value = '';
  var prev = document.getElementById('sp-image-preview'); if (prev) prev.innerHTML = '';
  var pwTitle = document.getElementById('pw-title'); if (pwTitle) pwTitle.textContent = 'Add Project';
  var pwBtn = document.getElementById('pw-save-btn'); if (pwBtn) pwBtn.textContent = 'Publică →';
  var cb = document.getElementById('sp-days');
  var dot = document.getElementById('sp-days-dot');
  var tog = document.getElementById('sp-days-toggle');
  if (cb) cb.checked = false;
  if (dot) { dot.textContent=''; dot.style.background='transparent'; dot.style.borderColor='var(--muted)'; }
  if (tog) { tog.style.borderColor='var(--border)'; tog.style.background='transparent'; }
  ['sp-name','sp-desc','sp-link','sp-github','sp-video'].forEach(function(id){
    var el = document.getElementById(id); if (el) el.value = '';
  });
  spGoTo(1);
}

function spToggleDays() {
  var cb     = document.getElementById('sp-days');
  var dot    = document.getElementById('sp-days-dot');
  var toggle = document.getElementById('sp-days-toggle');
  cb.checked = !cb.checked;
  if (cb.checked) {
    dot.textContent    = '✓';
    dot.style.background    = 'var(--accent)';
    dot.style.borderColor   = 'var(--accent)';
    dot.style.color         = '#fff';
    toggle.style.borderColor = 'rgba(99,102,241,.4)';
    toggle.style.background  = 'rgba(99,102,241,.07)';
  } else {
    dot.textContent    = '';
    dot.style.background    = 'transparent';
    dot.style.borderColor   = 'var(--muted)';
    toggle.style.borderColor = 'var(--border)';
    toggle.style.background  = 'transparent';
  }
}

function spGoTo(step) {
  for (var i = 1; i <= 4; i++) {
    var s = document.getElementById('sp-step-' + i);
    var d = document.getElementById('sp-dot-' + i);
    if (s) s.classList.toggle('active', i === step);
    if (d) d.classList.toggle('done', i <= step);
  }
}

function spNext(step) { spGoTo(step); }

function spSelectType(el, type) {
  document.querySelectorAll('.share-type-btn,.pw-type-btn').forEach(function(b){ b.classList.remove('sel'); });
  el.classList.add('sel');
  _spType = type;
}

function spPreviewImage(url) {
  var el = document.getElementById('sp-image-preview');
  if (!el) return;
  if (url && url.trim()) {
    el.className = 'pw-img-preview';
    el.innerHTML = '<img src="' + url.trim() + '" onerror="this.parentElement.innerHTML=\'\';">';
  } else {
    el.innerHTML = '';
  }
}

function spSelectStage(el, stage) {
  document.querySelectorAll('.share-stage').forEach(function(s){ s.classList.remove('sel'); });
  el.classList.add('sel');
  _spStage = stage;
}

function spToggleNeed(el, need) {
  el.classList.toggle('sel');
  var idx = _spNeeds.indexOf(need);
  if (idx === -1) _spNeeds.push(need);
  else _spNeeds.splice(idx, 1);
}

function spPublish() {
  var name = (document.getElementById('sp-name') || {}).value || '';
  if (!name.trim()) { toast('Add a project name first.'); return; }
  var p = {
    name:   name,
    desc:   (document.getElementById('sp-desc')   || {}).value || '',
    type:   _spType   || 'app',
    stage:  _spStage  || 'building',
    needs:  _spNeeds.slice(),
    link:   (document.getElementById('sp-link')   || {}).value || '',
    github: (document.getElementById('sp-github') || {}).value || '',
    video:  (document.getElementById('sp-video')  || {}).value || '',
    showDays: !!(document.getElementById('sp-days') && document.getElementById('sp-days').checked),
    lang:  _spLang || 'ro',
    image: (document.getElementById('sp-image') || {}).value || ''
  };
  if (_spEditId) {
    var list = getMyProjects().map(function(existing){
      if (existing.id === _spEditId) {
        p.id        = existing.id;
        p.createdAt = existing.createdAt;
        return p;
      }
      return existing;
    });
    localStorage.setItem('vnex_my_projects', JSON.stringify(list));
    _spEditId = null;
    closeShareProject();
    refreshMyCard();
    if (_wsFromMySpace) openMyWorkspace();
    toast('✓ ' + name + ' updated!');
  } else {
    saveMyProject(p);
    closeShareProject();
    refreshMyCard();
    updateHeroStats();
    if (_wsFromMySpace) openMyWorkspace();
    toast('✓ ' + name + ' added to your space!');
  }
}

// ── BUILDER SPACE ────────────────────────────────────────────
var BUILDERS = {};

var _wsActiveBuilder = null;
var _wsActiveFilter  = 'all';

function openWorkspace(key) {
  var d = BUILDERS[key];
  if (!d) { toast('Workspace coming soon!'); return; }
  _wsActiveBuilder = key;
  _wsActiveFilter  = 'all';

  document.getElementById('ws-avatar').textContent = d.avatar;
  document.getElementById('ws-avatar').style.background = d.color;
  document.getElementById('ws-name').textContent = d.name;
  document.getElementById('ws-sub').textContent  = d.sub;

  // Stats
  document.getElementById('ws-stats-grid').innerHTML = d.stats.map(function(s){
    return '<div class="ws-stat"><div class="ws-stat-val">' + s.val + '</div><div class="ws-stat-lbl">' + s.lbl + '</div></div>';
  }).join('');

  // Filter tabs — collect unique types
  var types = ['all'];
  d.projects.forEach(function(p){ if (types.indexOf(p.type) === -1) types.push(p.type); });
  var typeLabels = { all:'All', game:'Games', app:'Apps', ai:'AI', tool:'Tools' };
  document.getElementById('ws-tabs').innerHTML = types.map(function(t){
    return '<button class="ws-tab' + (t === 'all' ? ' active' : '') + '" onclick="wsFilter(\'' + key + '\',\'' + t + '\',this)">' +
      (typeLabels[t] || t) + '</button>';
  }).join('');

  renderWsFeed(d, 'all');
  document.getElementById('workspace-modal').style.display = 'block';
  window.scrollTo(0,0);
}

function wsFilter(key, type, el) {
  document.querySelectorAll('.ws-tab').forEach(function(t){ t.classList.remove('active'); });
  el.classList.add('active');
  _wsActiveFilter = type;
  renderWsFeed(BUILDERS[key], type);
}

function renderWsFeed(d, filter) {
  var projects = filter === 'all' ? d.projects : d.projects.filter(function(p){ return p.type === filter; });
  var feed = document.getElementById('ws-feed');

  if (!projects.length) {
    feed.innerHTML = '<div class="ws-empty">No ' + filter + ' projects yet.</div>';
    return;
  }

  feed.innerHTML = projects.map(function(p){
    var stuckBlock = p.stuck
      ? '<div class="stuck-block"><div class="stuck-block-title">🔴 Builder is stuck — can you help?</div><div class="stuck-block-text">' + p.stuck + '</div></div>'
      : '';

    var updateBlock = '<div class="last-update"><div class="lu-label">Latest update</div><div class="lu-text">' + p.update + '</div></div>';

    var voteBlock = '';
    if (p.vote) {
      voteBlock = '<div class="vote-block"><div class="vote-question">💬 ' + p.vote.q + '</div><div class="vote-options">' +
        p.vote.opts.map(function(o, i){
          return '<div class="vote-opt" onclick="vote(this,\'' + p.name + '\',' + i + ')">' +
            '<span class="vote-opt-text">' + o.t + '</span>' +
            '<div class="vote-bar"><div class="vote-bar-fill" style="width:' + o.p + '%;background:var(--accent)"></div></div>' +
            '<span class="vote-pct">' + o.p + '%</span></div>';
        }).join('') +
      '</div></div>';
    }

    var predBlock = '';
    if (p.pred) {
      predBlock = '<div class="pred-block"><div class="pred-label">🔮 Prediction — vote now</div>' +
        '<div class="pred-text">' + p.pred.q + '</div>' +
        '<div class="pred-btns">' +
        '<button class="pred-btn pred-yes" onclick="predict(this,\'yes\')">✓ Will ship · ' + p.pred.yes + '%</button>' +
        '<button class="pred-btn pred-no" onclick="predict(this,\'no\')">✗ Won\'t ship · ' + p.pred.no + '%</button>' +
        '</div></div>';
    }

    var tryBtn = p.link
      ? '<a href="' + p.link + '" target="_blank" style="display:inline-flex;align-items:center;gap:5px;background:rgba(34,197,94,.1);border:1px solid rgba(34,197,94,.25);border-radius:8px;padding:5px 12px;font-size:11px;font-weight:700;color:#4ade80;text-decoration:none;transition:all .2s" onmouseover="this.style.background=\'rgba(34,197,94,.18)\'" onmouseout="this.style.background=\'rgba(34,197,94,.1)\'">' + p.linkLabel + '</a>'
      : '';

    var needsHtml = p.needs.map(function(n){
      var type = n.indexOf('Bug') !== -1 ? 'bug' : n.indexOf('Help') !== -1 ? 'help' : n.indexOf('Ideas') !== -1 ? 'suggest' : 'test';
      return '<button class="fb-btn ' + type + '" onclick="openFeedback(\'' + p.name + '\',\'' + type + '\')">' + n + '</button>';
    }).join('');

    return '<div class="pcard">' +
      '<div class="pcard-img" style="background:linear-gradient(135deg,#0d0d20,#1a1a35)">' +
        '<div class="pcard-img-emoji">' + p.emoji + '</div>' +
        '<div class="pcard-img-overlay"></div>' +
        '<div class="pcard-status-pin"><span class="status-badge ' + p.sc + '">' + p.status + '</span></div>' +
      '</div>' +
      '<div class="pcard-body">' +
        '<div class="pcard-head"><div><div class="pcard-name">' + p.name + '</div>' +
        '<div class="pcard-by">by ' + d.name + ' · ' + p.type + '</div></div></div>' +
        '<div class="pcard-desc">' + p.desc + '</div>' +
        updateBlock + stuckBlock + voteBlock + predBlock +
        '<div class="feedback-board">' +
          '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">' +
            '<div class="fb-label" style="margin-bottom:0">Give feedback</div>' + tryBtn +
          '</div>' +
          '<div class="fb-actions">' + needsHtml +
            '<button class="fb-btn suggest" onclick="openFeedback(\'' + p.name + '\',\'suggest\')">💡 Suggest</button>' +
            '<button class="fb-btn bug" onclick="openFeedback(\'' + p.name + '\',\'bug\')">🐛 Bug</button>' +
          '</div>' +
        '</div>' +
      '</div>' +
    '</div>';
  }).join('');
}

function closeWorkspace() {
  document.getElementById('workspace-modal').style.display = 'none';
  _wsFromMySpace = false;
}

function openProjectDetail(id) {
  var p = getMyProjects().find(function(x){ return x.id === id; });
  if (!p) return;

  var stageMap  = { idea:'💡 Idea', building:'🔨 Building', testing:'🧪 Testing', earlyaccess:'🔓 Early Access', live:'🚀 Live' };
  var typeIcons = { game:'🎮', app:'📱', ai:'🧠', tool:'🛠', website:'🌐', experiment:'🧪' };
  var scMap     = { idea:'s-idea', building:'s-building', testing:'s-launched', earlyaccess:'s-launched', live:'s-launched' };

  var icon  = typeIcons[p.type] || '📦';
  var stage = stageMap[p.stage] || p.stage;
  var sc    = scMap[p.stage] || 's-building';
  var days  = daysAgo(p.createdAt);

  var projectLogs = getLog().filter(function(e){ return e.project === p.name; });
  var logsHtml = projectLogs.length
    ? projectLogs.map(function(e){
        return '<div class="pd-log-entry">' +
          '<div class="pd-log-date">' + e.date + '</div>' +
          '<div class="pd-log-text">' + e.text + '</div>' +
          (e.link ? '<a href="' + e.link + '" target="_blank" class="pd-log-link">↗ ' + e.link + '</a>' : '') +
        '</div>';
      }).join('')
    : '<div style="font-size:13px;color:var(--muted);padding:8px 0">No log entries yet for this project.</div>';

  var needsHtml = (p.needs || []).map(function(n){
    var t = n === 'testers' ? 'test' : n === 'ideas' ? 'suggest' : n === 'feedback' ? 'suggest' : 'help';
    var icons = { testers:'🧪', ideas:'💡', feedback:'💬', bugs:'🐛', help:'🆘' };
    return '<button class="fb-btn ' + t + '" onclick="openFeedback(\'' + p.name + '\',\'' + t + '\')">' + (icons[n]||'') + ' ' + n + '</button>';
  }).join('');

  var linksHtml = '';
  if (p.link)   linksHtml += '<a href="' + p.link   + '" target="_blank" class="pd-link-btn">🌐 Open</a>';
  if (p.github) linksHtml += '<a href="' + p.github + '" target="_blank" class="pd-link-btn">🐙 GitHub</a>';
  if (p.video)  linksHtml += '<a href="' + p.video  + '" target="_blank" class="pd-link-btn">▶ Video</a>';

  document.getElementById('pd-content').innerHTML =
    '<div class="pd-header">' +
      '<div class="pd-emoji">' + icon + '</div>' +
      '<div class="pd-meta">' +
        '<div class="pd-name">' + p.name + '</div>' +
        '<div class="pd-badges">' +
          '<span class="status-badge ' + sc + '">' + stage + '</span>' +
          (p.showDays ? '<span class="pd-days">Day ' + days + '</span>' : '') +
        '</div>' +
      '</div>' +
    '</div>' +
    (p.desc ? '<div class="pd-desc">' + p.desc + '</div>' : '') +
    (linksHtml ? '<div class="pd-links">' + linksHtml + '</div>' : '') +
    '<div class="pd-section-title">Right now</div>' +
    '<div class="fb-actions" style="margin-bottom:4px">' + needsHtml +
      '<button class="fb-btn suggest" onclick="openFeedback(\'' + p.name + '\',\'suggest\')">💡 Suggest</button>' +
      '<button class="fb-btn bug" onclick="openFeedback(\'' + p.name + '\',\'bug\')">🐛 Bug</button>' +
    '</div>' +
    '<div class="pd-section-title">Builder Log</div>' +
    '<div class="pd-logs">' + logsHtml + '</div>';

  document.getElementById('project-detail-modal').style.display = 'block';
  window.scrollTo(0, 0);
}

function closeProjectDetail() {
  document.getElementById('project-detail-modal').style.display = 'none';
}

// ── MY WORKSPACE ─────────────────────────────────────────────
var _wsFromMySpace = false;

function openMyWorkspace() {
  var name = getBuilderName() || 'Anonymous';
  var xp   = getBuilderXP();
  var rank = getBuilderRank(xp);
  var projects = getMyProjects();

  _wsFromMySpace = true;

  document.getElementById('ws-avatar').textContent = name.charAt(0).toUpperCase();
  document.getElementById('ws-avatar').style.background = 'linear-gradient(135deg,#6366f1,#818cf8)';
  document.getElementById('ws-name').textContent = 'My Space';
  var logCount = getLog().length;
  var firstProject = projects.length ? projects[projects.length - 1] : null;
  var daysSince = firstProject ? daysAgo(firstProject.createdAt) : 1;

  document.getElementById('ws-sub').textContent = 'Building since Day ' + daysSince;

  document.getElementById('ws-stats-grid').innerHTML =
    '<div class="ws-stat"><div class="ws-stat-val">' + projects.length + '</div><div class="ws-stat-lbl">Projects</div></div>' +
    '<div class="ws-stat"><div class="ws-stat-val">' + daysSince + '</div><div class="ws-stat-lbl">Days Building</div></div>' +
    '<div class="ws-stat"><div class="ws-stat-val">' + logCount + '</div><div class="ws-stat-lbl">Logs</div></div>';

  // Filter tabs based on types
  var types = ['all'];
  projects.forEach(function(p){ if (types.indexOf(p.type) === -1) types.push(p.type); });
  var typeLabels = { all:'All', game:'Games', app:'Apps', ai:'AI', tool:'Tools', website:'Websites', experiment:'Experiments' };
  document.getElementById('ws-tabs').innerHTML = types.map(function(t){
    return '<button class="ws-tab' + (t === 'all' ? ' active' : '') + '" onclick="wsMyFilter(\'' + t + '\',this)">' + (typeLabels[t] || t) + '</button>';
  }).join('') +
  '<button class="ws-tab" style="background:rgba(99,102,241,.15);color:var(--accent2);margin-left:8px" onclick="openShareFromWorkspace()">+ Add Project</button>';

  renderMyFeed(projects, 'all');
  renderBuilderInbox();
  renderBuilderLog();
  renderGallery();
  renderTimeline();
  document.getElementById('workspace-modal').style.display = 'block';
  window.scrollTo(0, 0);
}

function renderBuilderLog() {
  var existing = document.getElementById('builder-log-section');
  if (existing) existing.remove();

  var log = getLog();
  var projects = getMyProjects();

  var projectOptions = '<option value="">No specific project</option>' +
    projects.map(function(p){ return '<option value="' + p.name + '">' + p.name + '</option>'; }).join('');

  var entriesHtml = log.length === 0
    ? '<div style="font-size:13px;color:var(--muted);padding:16px 0">No entries yet. Start your construction journal.</div>'
    : log.map(function(e){
        return '<div style="padding:14px 0;border-bottom:1px solid var(--border);display:flex;gap:12px;align-items:flex-start">' +
          '<div style="flex-shrink:0;text-align:right;min-width:70px">' +
            '<div style="font-size:11px;color:var(--muted)">' + e.date + '</div>' +
            (e.project ? '<div style="font-size:10px;color:var(--accent2);margin-top:2px;font-weight:600">' + e.project + '</div>' : '') +
          '</div>' +
          '<div style="flex:1">' +
            '<div style="font-size:14px;color:var(--text);line-height:1.5">' + e.text + '</div>' +
            (e.link ? '<a href="' + e.link + '" target="_blank" style="font-size:11px;color:var(--accent2);text-decoration:none;margin-top:4px;display:inline-block">↗ ' + e.link + '</a>' : '') +
          '</div>' +
          '<button onclick="deleteLogEntry(' + e.id + ');renderBuilderLog()" style="background:none;border:none;color:var(--muted);cursor:pointer;font-size:16px;flex-shrink:0;padding:0" title="Delete">×</button>' +
        '</div>';
      }).join('');

  var section = document.createElement('div');
  section.id = 'builder-log-section';
  section.style.cssText = 'margin-top:32px;border-top:1px solid var(--border);padding-top:24px';
  section.innerHTML =
    '<div style="font-size:10px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:var(--muted);margin-bottom:16px">📋 Builder Log</div>' +
    '<div style="background:rgba(255,255,255,.03);border:1px solid var(--border);border-radius:14px;padding:16px;margin-bottom:20px">' +
      '<textarea id="log-text" placeholder="What did you build, test, or start today?" style="width:100%;background:none;border:none;outline:none;color:var(--text);font-size:14px;font-family:inherit;resize:none;min-height:60px;line-height:1.6"></textarea>' +
      '<div style="display:flex;gap:8px;margin-top:10px;flex-wrap:wrap">' +
        '<input id="log-link" placeholder="↗ Link (optional)" style="flex:1;background:rgba(255,255,255,.04);border:1px solid var(--border);border-radius:8px;padding:7px 12px;color:var(--text);font-size:12px;font-family:inherit;outline:none;min-width:120px">' +
        '<select id="log-project" style="background:rgba(255,255,255,.04);border:1px solid var(--border);border-radius:8px;padding:7px 12px;color:var(--text);font-size:12px;font-family:inherit;outline:none">' + projectOptions + '</select>' +
        '<button onclick="submitLogEntry()" style="background:var(--accent);color:#fff;border:none;border-radius:8px;padding:7px 18px;font-size:12px;font-weight:700;cursor:pointer;font-family:inherit">Post →</button>' +
      '</div>' +
    '</div>' +
    '<div id="log-entries">' + entriesHtml + '</div>';

  document.querySelector('.workspace-page').appendChild(section);
}

function renderGallery() {
  var existing = document.getElementById('gallery-section');
  if (existing) existing.remove();
  var gallery  = getGallery();
  var projects = getMyProjects();
  var projOpts = '<option value="">No project</option>' + projects.map(function(p){ return '<option value="'+p.name+'">'+p.name+'</option>'; }).join('');
  var MOODS = ['flow','breakthrough','stuck','chaotic','focused','exploring','shipping'];

  var itemsHtml = gallery.length === 0
    ? '<div style="font-size:13px;color:var(--muted);padding:8px 0">No images yet. Add sketches, mockups, or screenshots.</div>'
    : '<div class="gallery-grid">' + gallery.map(function(item){
        var img = item.url
          ? '<img class="gallery-img" src="'+item.url+'" onerror="this.style.display=\'none\';this.nextSibling.style.display=\'flex\'">' +
            '<div class="gallery-no-img" style="display:none">🖼</div>'
          : '<div class="gallery-no-img">🖼</div>';
        return '<div class="gallery-item">' +
          img +
          '<div class="gallery-overlay">' +
            '<div class="gallery-title">'+item.title+'</div>' +
            '<div class="gallery-meta">' +
              (item.project?'<span class="gallery-project">'+item.project+'</span>':'') +
              (item.mood?'<span class="gallery-mood">'+item.mood+'</span>':'') +
            '</div>' +
          '</div>' +
          '<button class="gallery-del" onclick="deleteGalleryItem('+item.id+');renderGallery()" title="Remove">×</button>' +
        '</div>';
      }).join('') + '</div>';

  var moodOpts = MOODS.map(function(m){ return '<option value="'+m+'">'+m+'</option>'; }).join('');

  var section = document.createElement('div');
  section.id = 'gallery-section';
  section.style.cssText = 'margin-top:32px;border-top:1px solid var(--border);padding-top:24px';
  section.innerHTML =
    '<div style="font-size:10px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:var(--muted);margin-bottom:16px">🖼 Gallery</div>' +
    '<div style="background:rgba(255,255,255,.03);border:1px solid var(--border);border-radius:14px;padding:16px;margin-bottom:16px">' +
      '<input id="gal-title" placeholder="Title — what is this?" style="width:100%;background:none;border:none;outline:none;color:var(--text);font-size:14px;font-family:inherit;margin-bottom:10px">' +
      '<input id="gal-url" placeholder="Image URL (imgur, github, anywhere...)" style="width:100%;background:rgba(255,255,255,.04);border:1px solid var(--border);border-radius:8px;padding:7px 12px;color:var(--text);font-size:12px;font-family:inherit;outline:none;margin-bottom:10px">' +
      '<div style="display:flex;gap:8px;flex-wrap:wrap">' +
        '<select id="gal-project" style="background:rgba(255,255,255,.04);border:1px solid var(--border);border-radius:8px;padding:7px 12px;color:var(--text);font-size:12px;font-family:inherit;outline:none">'+projOpts+'</select>' +
        '<select id="gal-mood" style="background:rgba(255,255,255,.04);border:1px solid var(--border);border-radius:8px;padding:7px 12px;color:var(--text);font-size:12px;font-family:inherit;outline:none"><option value="">mood (optional)</option>'+moodOpts+'</select>' +
        '<button onclick="submitGalleryItem()" style="background:var(--accent);color:#fff;border:none;border-radius:8px;padding:7px 18px;font-size:12px;font-weight:700;cursor:pointer;font-family:inherit;margin-left:auto">Add →</button>' +
      '</div>' +
    '</div>' +
    '<div id="gallery-items">' + itemsHtml + '</div>';

  document.querySelector('.workspace-page').appendChild(section);
}

function submitGalleryItem() {
  var title = (document.getElementById('gal-title')||{}).value||'';
  if (!title.trim()) { toast('Add a title first.'); return; }
  addGalleryItem(
    title.trim(),
    (document.getElementById('gal-url')||{}).value||'',
    (document.getElementById('gal-project')||{}).value||'',
    (document.getElementById('gal-mood')||{}).value||''
  );
  renderGallery();
  document.getElementById('gal-title').value = '';
  document.getElementById('gal-url').value   = '';
}

function renderTimeline() {
  var existing = document.getElementById('timeline-section');
  if (existing) existing.remove();
  var tl       = getTimeline();
  var projects = getMyProjects();
  var projOpts = '<option value="">No project</option>' + projects.map(function(p){ return '<option value="'+p.name+'">'+p.name+'</option>'; }).join('');

  var tlHtml = tl.length === 0
    ? '<div style="font-size:13px;color:var(--muted);padding:8px 0">No milestones yet. When did this all start?</div>'
    : '<div class="tl-list">' + tl.map(function(e){
        return '<div class="tl-item">' +
          '<div class="tl-date">' + e.date + '</div>' +
          '<div class="tl-text">' + e.text + '<button class="tl-del" onclick="deleteTimelineEntry('+e.id+');renderTimeline()" title="Delete">×</button></div>' +
          (e.project?'<div class="tl-project">'+e.project+'</div>':'') +
        '</div>';
      }).join('') + '</div>';

  var section = document.createElement('div');
  section.id = 'timeline-section';
  section.style.cssText = 'margin-top:32px;border-top:1px solid var(--border);padding-top:24px;padding-bottom:40px';
  section.innerHTML =
    '<div style="font-size:10px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:var(--muted);margin-bottom:16px">📅 Timeline</div>' +
    '<div style="background:rgba(255,255,255,.03);border:1px solid var(--border);border-radius:14px;padding:16px;margin-bottom:16px">' +
      '<input id="tl-text" placeholder="What happened? First idea, first build, first launch..." style="width:100%;background:none;border:none;outline:none;color:var(--text);font-size:14px;font-family:inherit;margin-bottom:10px">' +
      '<div style="display:flex;gap:8px;flex-wrap:wrap">' +
        '<input id="tl-date" type="month" style="background:rgba(255,255,255,.04);border:1px solid var(--border);border-radius:8px;padding:7px 12px;color:var(--text);font-size:12px;font-family:inherit;outline:none">' +
        '<select id="tl-project" style="background:rgba(255,255,255,.04);border:1px solid var(--border);border-radius:8px;padding:7px 12px;color:var(--text);font-size:12px;font-family:inherit;outline:none">'+projOpts+'</select>' +
        '<button onclick="submitTimelineEntry()" style="background:var(--accent);color:#fff;border:none;border-radius:8px;padding:7px 18px;font-size:12px;font-weight:700;cursor:pointer;font-family:inherit;margin-left:auto">Add →</button>' +
      '</div>' +
    '</div>' +
    '<div id="tl-entries">' + tlHtml + '</div>';

  document.querySelector('.workspace-page').appendChild(section);
}

function submitTimelineEntry() {
  var text = (document.getElementById('tl-text')||{}).value||'';
  if (!text.trim()) { toast('Add a milestone first.'); return; }
  addTimelineEntry(
    (document.getElementById('tl-date')||{}).value || new Date().toISOString().slice(0,7),
    text.trim(),
    (document.getElementById('tl-project')||{}).value||''
  );
  renderTimeline();
  document.getElementById('tl-text').value = '';
}

function submitLogEntry() {
  var text = (document.getElementById('log-text') || {}).value || '';
  if (!text.trim()) return;
  var link    = (document.getElementById('log-link')    || {}).value || '';
  var project = (document.getElementById('log-project') || {}).value || '';
  addLogEntry(text.trim(), link.trim(), project);
  renderBuilderLog();
  document.getElementById('log-text').value = '';
  document.getElementById('log-link').value = '';
}

function wsMyFilter(type, el) {
  document.querySelectorAll('.ws-tab').forEach(function(t){ t.classList.remove('active'); });
  el.classList.add('active');
  var projects = type === 'all' ? getMyProjects() : getMyProjects().filter(function(p){ return p.type === type; });
  renderMyFeed(projects, type);
}

function openShareFromWorkspace() {
  _wsFromMySpace = true;
  spReset();
  document.getElementById('share-modal').style.display = 'flex';
}

function renderMyFeed(projects, filter) {
  var feed = document.getElementById('ws-feed');
  if (!projects.length) {
    feed.innerHTML =
      '<div style="text-align:center;padding:48px 24px;background:rgba(255,255,255,.02);border:1px dashed var(--border);border-radius:18px">' +
        '<div style="font-size:36px;margin-bottom:14px">🏗</div>' +
        '<div style="font-size:15px;font-weight:700;color:var(--text);margin-bottom:8px">Start your universe.</div>' +
        '<div style="font-size:13px;color:var(--muted);margin-bottom:20px;line-height:1.6">Add your first project and begin documenting the journey.</div>' +
        '<button class="bcard-btn" onclick="openShareFromWorkspace()">+ Add first project</button>' +
      '</div>';
    return;
  }

  var typeIcons = { game:'🎮', app:'📱', ai:'🧠', tool:'🛠', website:'🌐', experiment:'🧪' };
  var stageMap  = { idea:'💡 Idea', building:'🔨 Building', testing:'🧪 Testing', earlyaccess:'🔓 Early Access', live:'🚀 Live' };
  var scMap     = { idea:'s-idea', building:'s-building', testing:'s-launched', earlyaccess:'s-launched', live:'s-launched' };

  feed.innerHTML = projects.map(function(p){
    var icon  = typeIcons[p.type] || '📦';
    var stage = stageMap[p.stage] || p.stage;
    var sc    = scMap[p.stage]    || 's-building';

    var linkBtn = p.link
      ? '<a href="' + p.link + '" target="_blank" style="display:inline-flex;align-items:center;gap:5px;background:rgba(34,197,94,.1);border:1px solid rgba(34,197,94,.25);border-radius:8px;padding:5px 12px;font-size:11px;font-weight:700;color:#4ade80;text-decoration:none">▶ Open</a>'
      : '';

    var needsHtml = (p.needs || []).map(function(n){
      var t = n === 'testers' ? 'test' : n === 'ideas' ? 'suggest' : n === 'feedback' ? 'suggest' : 'help';
      var icons = { testers:'🧪', ideas:'💡', feedback:'💬', help:'🆘' };
      return '<button class="fb-btn ' + t + '" onclick="openFeedback(\'' + p.name + '\',\'' + t + '\')">' + (icons[n]||'') + ' ' + n + '</button>';
    }).join('');

    return '<div class="pcard">' +
      '<div class="pcard-img" style="background:linear-gradient(135deg,#0d0d20,#1a1a35)">' +
        '<div class="pcard-img-emoji">' + icon + '</div>' +
        '<div class="pcard-img-overlay"></div>' +
        '<div class="pcard-status-pin"><span class="status-badge ' + sc + '">' + stage + '</span></div>' +
      '</div>' +
      '<div class="pcard-body">' +
        '<div class="pcard-head">' +
          '<div><div class="pcard-name" style="cursor:pointer" onclick="openProjectDetail(' + p.id + ')">' + p.name + '</div>' +
          '<div class="pcard-by">' + (p.showDays ? 'Day ' + daysAgo(p.createdAt) : 'Added recently') + (p.lang ? ' · ' + (p.lang==='ro'?'🇷🇴':p.lang==='en'?'🇬🇧':'🌐') : '') + '</div></div>' +
          '<div style="display:flex;gap:6px">' +
          '<button onclick="openEditProject(' + p.id + ')" style="background:rgba(99,102,241,.08);border:1px solid rgba(99,102,241,.2);border-radius:7px;color:var(--accent2);font-size:11px;font-weight:700;cursor:pointer;padding:5px 10px;font-family:inherit">✏️ Edit</button>' +
          '<button onclick="confirmDeleteProject(' + p.id + ')" style="background:rgba(239,68,68,.08);border:1px solid rgba(239,68,68,.2);border-radius:7px;color:#f87171;font-size:11px;font-weight:700;cursor:pointer;padding:5px 10px;font-family:inherit">🗑 Delete</button>' +
          '</div>' +
        '</div>' +
        (p.desc ? '<div class="pcard-desc">' + p.desc + '</div>' : '') +
        '<div class="feedback-board">' +
          '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">' +
            '<div class="fb-label" style="margin-bottom:0">Community feedback</div>' + linkBtn +
          '</div>' +
          '<div class="fb-actions">' + needsHtml +
            '<button class="fb-btn suggest" onclick="openFeedback(\'' + p.name + '\',\'suggest\')">💡 Suggest</button>' +
            '<button class="fb-btn bug" onclick="openFeedback(\'' + p.name + '\',\'bug\')">🐛 Bug</button>' +
          '</div>' +
        '</div>' +
      '</div>' +
    '</div>';
  }).join('');
}

function refreshMyCard() {
  var name = getBuilderName();
  if (!name) return;
  var projects = getMyProjects();
  var myCard = document.getElementById('my-builder-card');
  if (!myCard) return;

  var isBuilder = projects.length > 0;

  // Proiecte
  var projHtml = isBuilder
    ? projects.slice(0,4).map(function(p){
        var icons = { game:'🎮', app:'📱', ai:'🧠', tool:'🛠', website:'🌐', experiment:'🧪' };
        return '<span class="bcard-proj">' + (icons[p.type]||'📦') + ' ' + p.name + '</span>';
      }).join('')
    : '<span style="font-size:11px;color:var(--muted)">No projects yet — testing mode</span>';

  myCard.querySelector('.bcard-projects').innerHTML = projHtml;

  // Rank
  myCard.querySelector('.bcard-rank').textContent = isBuilder
    ? projects.length + ' project' + (projects.length !== 1 ? 's' : '') + ' · ' + getLog().length + ' logs'
    : 'Exploring VNEX';

  // Update text
  document.getElementById('my-card-update').textContent = isBuilder
    ? 'Last added: ' + projects[0].name + ' · ' + projects[0].createdAt
    : 'Testing projects. No public workspace yet.';

  // Tu pe cardul tău → mereu My Space
  var btn = myCard.querySelector('.bcard-btn');
  if (btn) btn.textContent = 'My Space →';
}

// ── MY PROFILE ───────────────────────────────────────────────
var VV_PROJECTS = [
  { name:'LEA',    emoji:'🧠', status:'Building'     },
  { name:'Solvo',  emoji:'📄', status:'Launched'     },
  { name:'VNEX',   emoji:'🌐', status:'Building'     },
  { name:'SIGNAL', emoji:'◈',  status:'Need testers' }
];

var ACTIVITY_TYPES = [
  { key:'suggest', icon:'💡', label:'Ideas sent'   },
  { key:'bug',     icon:'🐛', label:'Bugs reported' },
  { key:'test',    icon:'🧪', label:'Tests done'    },
  { key:'help',    icon:'🆘', label:'Help offered'  },
  { key:'vote',    icon:'🗳',  label:'Votes cast'   },
  { key:'predict', icon:'🔮', label:'Predictions'   }
];

function openOrSetupProfile() {
  if (!getBuilderName()) {
    document.getElementById('welcome-modal').style.display = 'flex';
    document.getElementById('welcome-btn-accept').style.display = 'none';
    document.querySelectorAll('.welcome-rules,.welcome-disclaimer').forEach(function(el){ el.style.display='none'; });
    document.getElementById('welcome-step2').style.display = '';
  } else {
    openProfile();
  }
}

function openProfile(section) {
  var name = getBuilderName() || 'Anonymous';
  var xp   = getBuilderXP();
  var rank = getBuilderRank(xp);
  var s    = getStats();

  document.getElementById('profile-avatar-el').textContent = name.charAt(0).toUpperCase();
  document.getElementById('profile-name-el').textContent   = name;
  document.getElementById('profile-rank-el').textContent   = rank.label + ' · ' + xp + ' XP';

  var total = 0;
  for (var k in s) total += s[k];
  document.getElementById('ps-total').textContent = total;
  document.getElementById('ps-tests').textContent = s.test    || 0;
  document.getElementById('ps-ideas').textContent = s.suggest || 0;
  document.getElementById('ps-bugs').textContent  = s.bug     || 0;

  var pList = document.getElementById('profile-projects-list');
  pList.innerHTML = '';
  VV_PROJECTS.forEach(function(p) {
    var row = document.createElement('div');
    row.className = 'profile-row';
    row.innerHTML = '<span class="profile-row-icon">' + p.emoji + '</span>' +
      '<span class="profile-row-name">' + p.name + '</span>' +
      '<span class="profile-row-meta">' + p.status + '</span>';
    pList.appendChild(row);
  });

  var aList = document.getElementById('profile-activity-list');
  aList.innerHTML = '';
  ACTIVITY_TYPES.forEach(function(t) {
    var count = s[t.key] || 0;
    if (count === 0) return;
    var row = document.createElement('div');
    row.className = 'profile-row';
    row.innerHTML = '<span class="profile-row-icon">' + t.icon + '</span>' +
      '<span class="profile-row-name">' + t.label + '</span>' +
      '<span class="profile-row-val">' + count + '</span>';
    aList.appendChild(row);
  });
  if (!aList.children.length) {
    aList.innerHTML = '<div style="font-size:12px;color:var(--muted);padding:8px 0">No activity yet.</div>';
  }

  document.getElementById('profile-received-list').innerHTML =
    '<div style="font-size:12px;color:var(--muted);padding:8px 0">Visible once backend is connected.</div>';

  document.getElementById('profile-modal').style.display = 'flex';
  if (section) {
    var el = document.getElementById('ws-' + section);
    if (el) setTimeout(function(){ el.scrollIntoView({behavior:'smooth', block:'start'}); }, 100);
  }
}

function closeProfile() {
  document.getElementById('profile-modal').style.display = 'none';
}

