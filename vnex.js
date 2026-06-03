var FORMSPREE = 'https://formspree.io/f/meepavqj';

// ── TABS ─────────────────────────────────────────────────────
function scrollFeed(){ document.getElementById('feed-anchor').scrollIntoView({behavior:'smooth'}); }

function setTab(el){
  document.querySelectorAll('.tab').forEach(function(t){ t.classList.remove('active'); });
  el.classList.add('active');
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
  var name = getBuilderName() || 'Anonymous';
  var text = (document.getElementById('fb-text') || {}).value || '';
  fetch(FORMSPREE, {
    method:'POST', headers:{'Content-Type':'application/json'},
    body: JSON.stringify({ project: _currentProject, type: _currentType, builder: name, text: text, source:'vnex-feedback' })
  });
  closeModal('feedback-modal');
  addStat(_currentType);
  var xp = addXP(50);
  var rank = getBuilderRank(xp);
  toast('✓ Sent by ' + name + '! +50 XP · ' + rank.label);
  e.target.reset();
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

function setBuilderName() {
  var input = document.getElementById('builder-name-input').value.trim();
  var name = input || _pickedName;
  if (!name) { toast('Choose a name first.'); return; }
  localStorage.setItem('vnex_builder_name', name);
  localStorage.setItem('vnex_welcomed', '1');
  document.getElementById('welcome-modal').style.display = 'none';
  updateBuilderBadge();
}

// ── WELCOME ──────────────────────────────────────────────────
(function(){
  if (!localStorage.getItem('vnex_welcomed')) {
    document.getElementById('welcome-modal').style.display = 'flex';
  } else {
    updateBuilderBadge();
  }
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
  if (_vnexSettings.name)     document.getElementById('s-name').value     = _vnexSettings.name;
  if (_vnexSettings.username) document.getElementById('s-username').value = _vnexSettings.username;
  if (_vnexSettings.email)    document.getElementById('s-email').value    = _vnexSettings.email;
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
  _vnexSettings.name     = (document.getElementById('s-name') || {}).value || '';
  _vnexSettings.username = (document.getElementById('s-username') || {}).value || '';
  _vnexSettings.email    = (document.getElementById('s-email') || {}).value || '';
  localStorage.setItem('vnex_settings', JSON.stringify(_vnexSettings));
  closeSettings();
  toast('✓ Settings saved.');
}

// ── SHARE FLOW ───────────────────────────────────────────────
var _spType  = '';
var _spStage = '';
var _spNeeds = [];

function openShareProject() {
  spReset();
  document.getElementById('share-modal').style.display = 'flex';
}
function closeShareProject() { document.getElementById('share-modal').style.display = 'none'; }

function spReset() {
  _spType = ''; _spStage = ''; _spNeeds = [];
  document.querySelectorAll('.share-type-btn,.share-stage,.share-need').forEach(function(el){ el.classList.remove('sel'); });
  ['sp-name','sp-desc','sp-link','sp-github','sp-video'].forEach(function(id){
    var el = document.getElementById(id); if (el) el.value = '';
  });
  spGoTo(1);
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
  document.querySelectorAll('.share-type-btn').forEach(function(b){ b.classList.remove('sel'); });
  el.classList.add('sel');
  _spType = type;
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
  var payload = {
    name:   name,
    desc:   (document.getElementById('sp-desc')   || {}).value || '',
    type:   _spType,
    stage:  _spStage,
    needs:  _spNeeds.join(', '),
    link:   (document.getElementById('sp-link')   || {}).value || '',
    github: (document.getElementById('sp-github') || {}).value || '',
    video:  (document.getElementById('sp-video')  || {}).value || '',
    source: 'vnex-share'
  };
  fetch(FORMSPREE, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload) });
  closeShareProject();
  toast('✓ ' + name + ' submitted! We\'ll add it to the feed within 24h.');
}

// ── BUILDER SPACE ────────────────────────────────────────────
var BUILDERS = {
  cosmin: {
    name: 'Cosmin', sub: 'VV Hybrid Universe · 180 days building',
    avatar: 'C', color: 'linear-gradient(135deg,#6366f1,#818cf8)',
    stats: [
      { val:4,   lbl:'Projects' },
      { val:2,   lbl:'Games'    },
      { val:1,   lbl:'AI'       },
      { val:1,   lbl:'Tools'    },
      { val:180, lbl:'Days'     }
    ],
    projects: [
      {
        type:'ai', emoji:'🧠', name:'LEA', status:'Building', sc:'s-building',
        desc:'Personal AI companion. Knows you, remembers everything, works fully offline. Zero cloud, zero tracking.',
        update:'2 days ago — Alexandria 2.0 integrated — 3026 Romanian patterns. Presence Architecture complete.',
        link:'https://hilea.eu/lea-home.html', linkLabel:'▶ Try now',
        vote:{ q:'What should LEA learn next?', opts:[{t:'Emotions deeper',p:61},{t:'More languages',p:39}] },
        needs:['🧪 Testers','💡 Ideas']
      },
      {
        type:'app', emoji:'🌐', name:'VNEX', status:'Building', sc:'s-building',
        desc:'Platform where builders share real progress. Follow builders through their projects, not just posts.',
        update:'Today — Builder Space live. Full project cards per builder. Filter by type.',
        link:null,
        pred:{ q:'Will VNEX hit 100 waitlist signups before accounts launch?', yes:84, no:16 },
        needs:['🧪 Testers','💡 Ideas']
      },
      {
        type:'tool', emoji:'📄', name:'Solvo', status:'Launched', sc:'s-launched',
        desc:'Document builder for tradespeople. Offers, contracts, invoices in 60 seconds. Works offline.',
        update:'1 week ago — Full document chain live: offer → contract → process verbal → proforma.',
        link:'https://hilea.eu/solvo.html', linkLabel:'▶ Try now',
        vote:{ q:'What should we build next?', opts:[{t:'Saved clients',p:64},{t:'Invoice generator',p:36}] },
        needs:['🐛 Bug reports']
      },
      {
        type:'game', emoji:'◈', name:'SIGNAL', status:'Need testers', sc:'s-launched',
        desc:'Atmospheric raycaster game. Navigate dark rooms, detect signals, uncover symbols. Single HTML file.',
        update:'Today — First build. Raycaster engine, ambient audio, 2-room map, pointer lock.',
        link:'signal.html', linkLabel:'▶ Play now',
        needs:['🧪 Testers']
      }
    ]
  },
  mihai: {
    name: 'Mihai', sub: 'indie dev · 118 days building',
    avatar: 'M', color: 'linear-gradient(135deg,#22c55e,#4ade80)',
    stats: [
      { val:1,   lbl:'Projects'     },
      { val:1,   lbl:'Games'        },
      { val:156, lbl:'Followers'    },
      { val:27,  lbl:'Testers'      },
      { val:118, lbl:'Days'         }
    ],
    projects: [
      {
        type:'game', emoji:'🎮', name:'Pixel Realm', status:'Need ideas', sc:'s-needs-ideas',
        desc:'2D pixel RPG with procedurally generated dungeons. Solo dev, no publisher, no funding. Just building.',
        update:'Today — Added 3 new dungeon layouts. Community vote for next boss fight.',
        link:null,
        vote:{ q:'What boss should come next?', opts:[{t:'Ice Dragon',p:52},{t:'Shadow Witch',p:31},{t:'Lava Golem',p:17}] },
        needs:['💡 Ideas']
      }
    ]
  },
  alex: {
    name: 'Alex', sub: 'freelancer · 34 days building',
    avatar: 'A', color: 'linear-gradient(135deg,#ef4444,#f87171)',
    stats: [
      { val:1,  lbl:'Projects' },
      { val:1,  lbl:'Tools'    },
      { val:34, lbl:'Days'     }
    ],
    projects: [
      {
        type:'tool', emoji:'⚡', name:'QuickInvoice', status:'Stuck', sc:'s-stuck',
        desc:'Fast invoice generator for freelancers. From zero to PDF in under 30 seconds.',
        update:'Stuck on EU VAT for digital products without a registered business. Romania specifically.',
        stuck:'Can\'t figure out how to handle EU VAT for digital products without a PFA. Anyone solved this?',
        link:null,
        needs:['🆘 Help']
      }
    ]
  }
};

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
