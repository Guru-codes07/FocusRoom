/* ============================================
   FocusRoom — Main Application Controller
   ============================================ */

(function () {
  'use strict';

  /* ---- Motivational Quotes ---- */
  const QUOTES = [
    { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
    { text: "Focus on being productive instead of busy.", author: "Tim Ferriss" },
    { text: "It's not that I'm so smart, it's just that I stay with problems longer.", author: "Albert Einstein" },
    { text: "The way to get started is to quit talking and begin doing.", author: "Walt Disney" },
    { text: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson" },
    { text: "You don't have to be great to start, but you have to start to be great.", author: "Zig Ziglar" },
    { text: "Productivity is never an accident. It is always the result of a commitment to excellence.", author: "Paul J. Meyer" },
    { text: "Action is the foundational key to all success.", author: "Pablo Picasso" },
    { text: "Start where you are. Use what you have. Do what you can.", author: "Arthur Ashe" },
    { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
    { text: "Amateurs sit and wait for inspiration. The rest of us just get up and go to work.", author: "Stephen King" },
    { text: "Your future is created by what you do today, not tomorrow.", author: "Robert Kiyosaki" },
    { text: "Discipline is the bridge between goals and accomplishment.", author: "Jim Rohn" },
    { text: "Small daily improvements over time lead to stunning results.", author: "Robin Sharma" },
    { text: "Success is the sum of small efforts repeated day in and day out.", author: "Robert Collier" },
    { text: "The best time to plant a tree was 20 years ago. The second best time is now.", author: "Chinese Proverb" },
    { text: "Do the hard jobs first. The easy jobs will take care of themselves.", author: "Dale Carnegie" },
    { text: "Concentrate all your thoughts upon the work at hand.", author: "Alexander Graham Bell" },
    { text: "Either you run the day, or the day runs you.", author: "Jim Rohn" },
    { text: "Great things are done by a series of small things brought together.", author: "Vincent Van Gogh" },
    { text: "What you do today can improve all your tomorrows.", author: "Ralph Marston" },
    { text: "It always seems impossible until it's done.", author: "Nelson Mandela" }
  ];

  /* ---- Display a random quote ---- */
  function showQuote() {
    const q = QUOTES[Math.floor(Math.random() * QUOTES.length)];
    const textEl = document.getElementById('quote-text');
    const authorEl = document.getElementById('quote-author');
    if (textEl) textEl.textContent = `"${q.text}"`;
    if (authorEl) authorEl.textContent = `— ${q.author}`;
  }

  /* ---- Current date ---- */
  function setDate() {
    const el = document.getElementById('current-date');
    if (!el) return;
    const now = new Date();
    el.textContent = now.toLocaleDateString('en-US', {
      weekday: 'short', month: 'short', day: 'numeric', year: 'numeric'
    });
  }

  /* ---- Mobile menu toggle ---- */
  function initMobileMenu() {
    const btn = document.getElementById('mobile-menu-btn');
    const nav = document.getElementById('main-nav');
    if (!btn || !nav) return;

    btn.addEventListener('click', () => {
      btn.classList.toggle('open');
      nav.classList.toggle('open');
    });

    // Close menu when a link is clicked
    nav.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        btn.classList.remove('open');
        nav.classList.remove('open');
      });
    });
  }

  /* ---- Active nav link on scroll ---- */
  function initScrollSpy() {
    const links = document.querySelectorAll('.nav-link[data-section]');
    const sections = [];
    links.forEach(link => {
      const sec = document.getElementById(link.dataset.section);
      if (sec) sections.push({ el: sec, link });
    });

    function update() {
      const scrollY = window.scrollY + 120;
      let current = sections[0];
      sections.forEach(s => {
        if (scrollY >= s.el.offsetTop) current = s;
      });
      links.forEach(l => l.classList.remove('active'));
      if (current) current.link.classList.add('active');
    }

    window.addEventListener('scroll', update, { passive: true });
    update();
  }

  /* ---- Dashboard refresh ---- */
  window.refreshDashboard = function () {
    const taskCounts = typeof TasksModule !== 'undefined' ? TasksModule.getCounts() : { done: 0, pending: 0 };
    const timerStats = typeof TimerModule !== 'undefined' ? TimerModule.getStats() : { total: 0, totalMinutes: 0 };

    const doneEl = document.getElementById('dash-tasks-done-val');
    const pendingEl = document.getElementById('dash-tasks-pending-val');
    const sessionsEl = document.getElementById('dash-sessions-val');
    const focusTimeEl = document.getElementById('dash-focus-time-val');

    if (doneEl) doneEl.textContent = taskCounts.done;
    if (pendingEl) pendingEl.textContent = taskCounts.pending;
    if (sessionsEl) sessionsEl.textContent = timerStats.total;
    if (focusTimeEl) {
      const mins = timerStats.totalMinutes;
      if (mins >= 60) {
        focusTimeEl.textContent = `${Math.floor(mins / 60)}h ${mins % 60}m`;
      } else {
        focusTimeEl.textContent = `${mins}m`;
      }
    }
  };

  /* ---- Ambient sound UI wiring ---- */
  function initSoundsUI() {
    const soundNames = ['rain', 'ocean', 'forest', 'cafe'];

    soundNames.forEach(name => {
      const card = document.querySelector(`.sound-card[data-sound="${name}"]`);
      const btn = document.getElementById(`sound-toggle-${name}`);
      const vol = document.getElementById(`sound-volume-${name}`);
      if (!btn) return;

      btn.addEventListener('click', () => {
        const playing = SoundsModule.toggle(name);
        const playIcon = btn.querySelector('.play-icon');
        const pauseIcon = btn.querySelector('.pause-icon');
        if (playing) {
          playIcon.style.display = 'none';
          pauseIcon.style.display = 'block';
          if (card) card.classList.add('playing');
        } else {
          playIcon.style.display = 'block';
          pauseIcon.style.display = 'none';
          if (card) card.classList.remove('playing');
        }
      });

      if (vol) {
        vol.addEventListener('input', () => {
          SoundsModule.setVolume(name, parseInt(vol.value, 10));
        });
      }
    });
  }

  /* ---- Smooth reveal on scroll (intersection observer) ---- */
  function initScrollReveal() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('.section').forEach(sec => {
      sec.style.opacity = '0';
      sec.style.transform = 'translateY(30px)';
      sec.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
      observer.observe(sec);
    });

    // Add CSS for revealed state
    const style = document.createElement('style');
    style.textContent = '.section.revealed { opacity: 1 !important; transform: translateY(0) !important; }';
    document.head.appendChild(style);
  }

  /* ---- Boot ---- */
  document.addEventListener('DOMContentLoaded', () => {
    setDate();
    showQuote();
    initMobileMenu();
    initScrollSpy();
    initSoundsUI();
    initScrollReveal();

    // Init modules
    TimerModule.init();
    TasksModule.init();
    StatsModule.init();

    // Initial dashboard render
    window.refreshDashboard();
  });
})();
