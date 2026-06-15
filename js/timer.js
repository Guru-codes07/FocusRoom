const TimerModule = (() => {
  'use strict';

  /* ---- Constants ---- */
  const FOCUS_DURATION = 25 * 60;   // 25 minutes in seconds
  const BREAK_DURATION = 5 * 60;    // 5 minutes in seconds
  const CIRCUMFERENCE = 2 * Math.PI * 120; // matches SVG r=120

  /* ---- State ---- */
  let mode = 'focus';          // 'focus' | 'break'
  let totalSeconds = FOCUS_DURATION;
  let remaining = FOCUS_DURATION;
  let intervalId = null;
  let running = false;

  /* ---- DOM refs (bound in init) ---- */
  let elTime, elLabel, elRing, elStartBtn, elPauseBtn, elResetBtn;
  let elFocusModeBtn, elBreakModeBtn, elSessionsCount;

  /* ---- Helpers ---- */

  /** Format seconds → mm:ss */
  function fmt(s) {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  }

  /** Update the circular ring progress */
  function updateRing() {
    const fraction = 1 - remaining / totalSeconds;
    elRing.style.strokeDashoffset = CIRCUMFERENCE * (1 - fraction);
  }

  /** Update the display */
  function render() {
    elTime.textContent = fmt(remaining);
    elLabel.textContent = mode === 'focus' ? 'Focus Session' : 'Break Time';
    updateRing();
  }

  /** Play a short notification beep via Web Audio API */
  function playBeep() {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = 660;
      gain.gain.value = 0.3;
      osc.connect(gain).connect(ctx.destination);
      osc.start();
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
      osc.stop(ctx.currentTime + 0.8);
    } catch (_) { /* silent fail */ }
  }

  /** Show browser notification */
  function showNotification(title, body) {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, { body, icon: '' });
    }
  }

  /** Request notification permission on first interaction */
  function requestNotifPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }

  /* ---- Storage helpers ---- */
  function todayKey() {
    return new Date().toISOString().slice(0, 10);
  }

  function getStats() {
    const raw = localStorage.getItem('fr_timer_stats');
    return raw ? JSON.parse(raw) : { total: 0, totalMinutes: 0, days: {} };
  }

  function saveStats(stats) {
    localStorage.setItem('fr_timer_stats', JSON.stringify(stats));
  }

  function recordSession() {
    const stats = getStats();
    stats.total += 1;
    stats.totalMinutes += 25;
    const day = todayKey();
    if (!stats.days[day]) stats.days[day] = { sessions: 0, minutes: 0 };
    stats.days[day].sessions += 1;
    stats.days[day].minutes += 25;
    saveStats(stats);
    updateSessionsDisplay();
    // Notify other modules
    if (typeof StatsModule !== 'undefined') StatsModule.refresh();
    if (typeof window.refreshDashboard === 'function') window.refreshDashboard();
  }

  function todaySessions() {
    const stats = getStats();
    const day = todayKey();
    return stats.days[day] ? stats.days[day].sessions : 0;
  }

  function updateSessionsDisplay() {
    if (elSessionsCount) {
      elSessionsCount.textContent = `Sessions completed today: ${todaySessions()}`;
    }
  }

  /* ---- Timer logic ---- */

  function tick() {
    if (remaining <= 0) {
      clearInterval(intervalId);
      intervalId = null;
      running = false;
      playBeep();

      if (mode === 'focus') {
        recordSession();
        showNotification('Focus session complete!', 'Time for a break.');
        switchMode('break');
      } else {
        showNotification('Break over!', 'Ready for another focus session?');
        switchMode('focus');
      }

      showPlayBtn();
      render();
      return;
    }
    remaining--;
    render();
  }

  function start() {
    if (running) return;
    requestNotifPermission();
    running = true;
    intervalId = setInterval(tick, 1000);
    showPauseBtn();
  }

  function pause() {
    if (!running) return;
    running = false;
    clearInterval(intervalId);
    intervalId = null;
    showPlayBtn();
  }

  function reset() {
    pause();
    remaining = totalSeconds;
    render();
  }

  function switchMode(newMode) {
    mode = newMode;
    totalSeconds = mode === 'focus' ? FOCUS_DURATION : BREAK_DURATION;
    remaining = totalSeconds;

    elFocusModeBtn.classList.toggle('active', mode === 'focus');
    elBreakModeBtn.classList.toggle('active', mode === 'break');

    // Update ring color
    elRing.style.stroke = mode === 'focus' ? 'var(--accent)' : 'var(--success)';
    render();
  }

  function showPlayBtn() {
    elStartBtn.style.display = 'flex';
    elPauseBtn.style.display = 'none';
  }

  function showPauseBtn() {
    elStartBtn.style.display = 'none';
    elPauseBtn.style.display = 'flex';
  }

  /* ---- Init ---- */
  function init() {
    elTime = document.getElementById('timer-time');
    elLabel = document.getElementById('timer-label');
    elRing = document.getElementById('timer-ring-progress');
    elStartBtn = document.getElementById('timer-start-btn');
    elPauseBtn = document.getElementById('timer-pause-btn');
    elResetBtn = document.getElementById('timer-reset-btn');
    elFocusModeBtn = document.getElementById('focus-mode-btn');
    elBreakModeBtn = document.getElementById('break-mode-btn');
    elSessionsCount = document.getElementById('timer-sessions-count');

    // Set initial stroke-dasharray
    elRing.style.strokeDasharray = CIRCUMFERENCE;
    elRing.style.strokeDashoffset = 0;

    elStartBtn.addEventListener('click', start);
    elPauseBtn.addEventListener('click', pause);
    elResetBtn.addEventListener('click', reset);

    elFocusModeBtn.addEventListener('click', () => { if (!running) switchMode('focus'); });
    elBreakModeBtn.addEventListener('click', () => { if (!running) switchMode('break'); });

    updateSessionsDisplay();
    render();
  }

  return { init, getStats, todaySessions };
})();
