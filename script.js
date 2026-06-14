// ════════════ DATA ════════════
const ROOMS = [
  {id:1,name:"Deep Focus Zone",desc:"Binaural Beats · No Chat",mode:"deep",members:18,max:20,colors:["#6C5CE7","#a29bfe","#fd79a8","#00cec9","#e17055"],joined:true},
  {id:2,name:"CS Exam Prep",desc:"Silent Mode · Group Study",mode:"exam",members:6,max:10,colors:["#0984e3","#74b9ff","#55efc4"]},
  {id:3,name:"Chill & Work",desc:"Lo-fi Music · Chat OK",mode:"chat",members:11,max:15,colors:["#00b894","#00cec9","#fd79a8","#fdcb6e","#6c5ce7","#a29bfe"]},
  {id:4,name:"Research Room",desc:"Silent · Deep Work",mode:"deep",members:4,max:8,colors:["#e17055","#fab1a0"]},
  {id:5,name:"Assignment Crunch",desc:"Pomodoro 25/5 · No Chat",mode:"exam",members:9,max:12,colors:["#6c5ce7","#a29bfe","#fd79a8","#00cec9"]},
  {id:6,name:"Night Owls",desc:"Ambient Rain · Open",mode:"chat",members:22,max:30,colors:["#0984e3","#74b9ff","#55efc4","#fdcb6e","#e17055","#fd79a8","#a29bfe"]},
];

const MEMBERS = [
  {name:"Guruprasad",i:"G",c:"#6C5CE7",t:"55:00",s:"#00D26E",you:true},
  {name:"Arjun M",i:"A",c:"#0984e3",t:"42:15",s:"#00D26E"},
  {name:"Priya S",i:"P",c:"#fd79a8",t:"1:02:40",s:"#00D26E"},
  {name:"Rahul K",i:"R",c:"#00b894",t:"18:00",s:"#00D26E"},
  {name:"Neha T",i:"N",c:"#e17055",t:"55:00",s:"#00D26E"},
  {name:"Vikram B",i:"V",c:"#636e72",t:"3:18",s:"#b2bec3"},
  {name:"Sana R",i:"S",c:"#fdcb6e",t:"28:00",s:"#00D26E"},
  {name:"Dev P",i:"D",c:"#a29bfe",t:"1:10:00",s:"#00D26E"},
];

const SOUNDS = [
  {id:"rain",name:"Rain",icon:"🌧️"},
  {id:"ocean",name:"Ocean Waves",icon:"🌊"},
  {id:"forest",name:"Forest",icon:"🌲"},
  {id:"fire",name:"Fireplace",icon:"🔥"},
  {id:"cafe",name:"Café Noise",icon:"☕"},
  {id:"white",name:"White Noise",icon:"📻"},
  {id:"keyboard",name:"Keyboard",icon:"⌨️"},
  {id:"piano",name:"Piano Notes",icon:"🎹"},
];

const BARS = [
  {day:"Mon",h:3.2},{day:"Tue",h:4.5},{day:"Wed",h:2.8},
  {day:"Thu",h:5.1},{day:"Fri",h:4.2,today:true},{day:"Sat",h:1.5},{day:"Sun",h:0.8},
];

// ════════════ STATE ════════════
let sndOn = {rain:true,ocean:false,forest:false,fire:true,cafe:false,white:false,keyboard:true,piano:false};
let sndVol = {rain:65,ocean:40,forest:0,fire:80,cafe:30,white:0,keyboard:55,piano:20};
let tSecs = 1500, tRun = false, tPhase = "focus", tSess = 1, tIv = null;
const FOCUS = 1500, BREAK = 300;

// ════════════ AUTH ════════════
function login() {
  document.getElementById('screen-login').classList.add('hidden');
  document.getElementById('screen-app').classList.remove('hidden');
  initApp();
}

// ════════════ INIT ════════════
function initApp() {
  renderRooms(ROOMS);
  renderAmbGrid();
  renderAmbMini();
  renderMembers();
  renderBars();
  renderHeatmap();
  renderTopRooms();
  go('rooms');
}

// ════════════ NAV ════════════
function go(page) {
  ['rooms','room','ambient','stats'].forEach(p => {
    document.getElementById('page-'+p).classList.add('hidden');
  });
  document.getElementById('page-'+page).classList.remove('hidden');
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  const map = {rooms:'n-rooms',room:'n-pomo',ambient:'n-amb',stats:'n-stats'};
  if (map[page]) document.getElementById(map[page]).classList.add('active');
}

// ════════════ ROOMS ════════════
function renderRooms(data) {
  const mc = {deep:'b-deep',exam:'b-exam',chat:'b-chat',silent:'b-silent'};
  const ml = {deep:'Deep Work',exam:'Exam Mode',chat:'Chat OK',silent:'Silent'};
  document.getElementById('rooms-grid').innerHTML = data.map(r => `
    <div class="room-card ${r.joined?'joined':''}" onclick="joinRoom(${r.id})">
      <div class="rc-hdr">
        <div>
          <div class="rc-name">${r.name}</div>
          <div class="rc-desc">${r.desc}</div>
        </div>
        <span class="badge ${mc[r.mode]||'b-deep'}">${ml[r.mode]||r.mode}</span>
      </div>
      <div class="dots">${r.colors.map(c=>`<div class="dot" style="background:${c}"></div>`).join('')}</div>
      <div class="rc-foot">
        <span class="rc-count">📍 ${r.members}/${r.max} members</span>
        <button class="join-btn ${r.joined?'here':''}" onclick="event.stopPropagation();joinRoom(${r.id})">
          ${r.joined?'✅ You\'re Here':'Join Room'}
        </button>
      </div>
    </div>`).join('');
}

function joinRoom(id) {
  const r = ROOMS.find(x => x.id === id);
  if (!r) return;
  document.getElementById('ar-name').textContent = r.name;
  document.getElementById('ar-members').textContent = r.members + ' Members';
  document.getElementById('m-count').textContent = r.members;
  go('room');
  toast('✅ Joined ' + r.name);
}

function leaveRoom() {
  if (tRun) { clearInterval(tIv); tRun = false; }
  go('rooms');
  toast('👋 Left the room');
}

function filterRooms(v) {
  renderRooms(ROOMS.filter(r =>
    r.name.toLowerCase().includes(v.toLowerCase()) ||
    r.desc.toLowerCase().includes(v.toLowerCase())
  ));
}

function setFilter(f, btn) {
  document.querySelectorAll('.pill').forEach(p => p.classList.remove('active'));
  btn.classList.add('active');
  renderRooms(f === 'all' ? ROOMS : ROOMS.filter(r => r.mode === f));
}

// ════════════ TIMER ════════════
function toggleTimer() {
  if (tRun) {
    clearInterval(tIv); tRun = false;
    document.getElementById('t-play').textContent = '▶';
  } else {
    tRun = true;
    document.getElementById('t-play').textContent = '⏸';
    tIv = setInterval(() => {
      tSecs--;
      if (tSecs <= 0) {
        clearInterval(tIv); tRun = false;
        document.getElementById('t-play').textContent = '▶';
        if (tPhase === 'focus') { tSess++; tPhase = 'break'; tSecs = BREAK; toast('☕ Break time!'); }
        else { tPhase = 'focus'; tSecs = FOCUS; toast('🎯 Focus time!'); }
      }
      updateTimer();
    }, 1000);
  }
}

function resetTimer() {
  clearInterval(tIv); tRun = false; tPhase = 'focus'; tSecs = FOCUS; tSess = 1;
  document.getElementById('t-play').textContent = '▶';
  updateTimer();
}

function skipPhase() {
  clearInterval(tIv); tRun = false;
  document.getElementById('t-play').textContent = '▶';
  tPhase = tPhase === 'focus' ? 'break' : 'focus';
  tSecs = tPhase === 'focus' ? FOCUS : BREAK;
  updateTimer();
}

function updateTimer() {
  const m = Math.floor(tSecs/60), s = tSecs%60;
  const fmt = n => String(n).padStart(2,'0');
  document.getElementById('t-disp').textContent = fmt(m)+':'+fmt(s);
  document.getElementById('t-phase').textContent = tPhase === 'focus' ? 'FOCUS' : 'BREAK';
  const total = tPhase === 'focus' ? FOCUS : BREAK;
  document.getElementById('t-ring').style.strokeDashoffset = 515 - (tSecs/total)*515;
  document.getElementById('t-ring').style.stroke = tPhase === 'focus' ? '#6C5CE7' : '#00CEC9';
  document.getElementById('t-info').textContent =
    `Session ${tSess} of 4 · ${tPhase==='focus'?'Short break':'Focus'} in ${fmt(m)}:${fmt(s)}`;
}

// ════════════ AMBIENT ════════════
function renderAmbMini() {
  document.getElementById('amb-mini').innerHTML = SOUNDS.map(s => `
    <button class="s-chip ${sndOn[s.id]?'active':''}" onclick="toggleMini('${s.id}',this)">
      ${s.icon} ${s.name}
    </button>`).join('');
}

function toggleMini(id, btn) {
  sndOn[id] = !sndOn[id];
  btn.classList.toggle('active');
  refreshAmbGrid();
}

function renderAmbGrid() {
  document.getElementById('amb-grid').innerHTML = SOUNDS.map(s => `
    <div class="amb-card ${sndOn[s.id]?'playing':''}" id="ac-${s.id}">
      <span class="amb-icon">${s.icon}</span>
      <div class="amb-name">${s.name}</div>
      <div class="amb-pct" id="ap-${s.id}">${sndVol[s.id]}%</div>
      <input type="range" class="vol-slider" min="0" max="100" value="${sndVol[s.id]}"
        oninput="setVol('${s.id}',this.value)">
      <button class="play-chip ${sndOn[s.id]?'pc-on':'pc-off'}" id="ab-${s.id}"
        onclick="toggleSnd('${s.id}')">
        ${sndOn[s.id]?'▶ Playing':'○ Off'}
      </button>
    </div>`).join('');
}

function refreshAmbGrid() {
  SOUNDS.forEach(s => {
    const card = document.getElementById('ac-'+s.id);
    const btn = document.getElementById('ab-'+s.id);
    if (!card||!btn) return;
    card.classList.toggle('playing', sndOn[s.id]);
    btn.className = 'play-chip '+(sndOn[s.id]?'pc-on':'pc-off');
    btn.textContent = sndOn[s.id]?'▶ Playing':'○ Off';
  });
}

function toggleSnd(id) {
  sndOn[id] = !sndOn[id];
  refreshAmbGrid();
  renderAmbMini();
}

function setVol(id, v) {
  sndVol[id] = parseInt(v);
  const el = document.getElementById('ap-'+id);
  if (el) el.textContent = v+'%';
}

// ════════════ MEMBERS ════════════
function renderMembers() {
  document.getElementById('member-list').innerHTML = MEMBERS.map(m => `
    <div class="m-item">
      <div class="m-av" style="background:${m.c}">${m.i}</div>
      <div>
        <div class="m-name">${m.name}${m.you?' <span style="font-size:0.68rem;color:var(--accent);">(You)</span>':''}</div>
        <div class="m-time">⏱️ ${m.t}</div>
      </div>
      <div class="s-dot" style="background:${m.s};box-shadow:0 0 5px ${m.s};margin-left:auto;"></div>
    </div>`).join('');
}

// ════════════ STATS ════════════
function renderBars() {
  const max = Math.max(...BARS.map(b => b.h));
  document.getElementById('bar-chart').innerHTML = BARS.map(b => `
    <div class="bar-col">
      <div style="font-size:0.6rem;color:var(--muted);margin-bottom:2px;">${b.h}h</div>
      <div class="bar ${b.today?'today':''}" style="height:${(b.h/max)*90}px;"></div>
      <div class="bar-lbl">${b.day}</div>
    </div>`).join('');
}

function renderHeatmap() {
  const lvls = ['','l1','l2','l3','l4'];
  let html = '';
  for (let r=0;r<7;r++) {
    html += '<div class="hm-row">';
    for (let c=0;c<14;c++) {
      const l = Math.random()<0.25?'':lvls[Math.floor(Math.random()*5)];
      html += `<div class="hm-cell ${l}"></div>`;
    }
    html += '</div>';
  }
  document.getElementById('heatmap').innerHTML = html;
}

function renderTopRooms() {
  const rooms = [{n:"Deep Focus Zone",t:"18.2h"},{n:"CS Exam Prep",t:"6.5h"},{n:"Night Owls",t:"4.1h"}];
  document.getElementById('top-rooms').innerHTML = rooms.map(r => `
    <div class="tr-item">
      <div class="tr-name">📍 ${r.n}</div>
      <div class="tr-time">${r.t}</div>
    </div>`).join('');
}

// ════════════ MODAL ════════════
function openModal() { document.getElementById('modal-ov').classList.remove('hidden'); }
function closeModal() { document.getElementById('modal-ov').classList.add('hidden'); }
function closeOuter(e) { if (e.target===document.getElementById('modal-ov')) closeModal(); }

function selOpt(btn, grp) {
  btn.closest('.opt-grp').querySelectorAll('.opt').forEach(o => o.classList.remove('sel'));
  btn.classList.add('sel');
}

function createRoom() {
  const name = document.getElementById('nr-name').value.trim();
  if (!name) { toast('⚠️ Enter a room name'); return; }
  ROOMS.unshift({id:Date.now(),name,desc:document.getElementById('nr-desc').value||'New room',mode:'deep',members:1,max:20,colors:['#6C5CE7'],joined:false});
  renderRooms(ROOMS);
  closeModal();
  toast('🎉 Room "'+name+'" created!');
  document.getElementById('nr-name').value='';
  document.getElementById('nr-desc').value='';
}

// ════════════ TOAST ════════════
function toast(msg) {
  document.querySelectorAll('.toast').forEach(t => t.remove());
  const t = document.createElement('div');
  t.className = 'toast'; t.textContent = msg;
  document.body.appendChild(t);
  se
