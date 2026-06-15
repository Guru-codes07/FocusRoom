const TasksModule = (() => {
  'use strict';

  const STORAGE_KEY = 'fr_tasks';

  let elInput, elList, elEmpty, elAddBtn;

  /* ---- Storage ---- */
  function load() {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  }

  function save(tasks) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }

  /* ---- Render ---- */
  function render() {
    const tasks = load();
    elList.innerHTML = '';

    if (tasks.length === 0) {
      elEmpty.classList.remove('hidden');
    } else {
      elEmpty.classList.add('hidden');
    }

    tasks.forEach((task, i) => {
      const li = document.createElement('li');
      li.className = `task-item${task.done ? ' completed' : ''}`;
      li.innerHTML = `
        <div class="task-check" data-index="${i}" aria-label="Toggle complete">${task.done ? '✓' : ''}</div>
        <span class="task-text">${escapeHtml(task.text)}</span>
        <button class="task-delete-btn" data-index="${i}" aria-label="Delete task">✕</button>
      `;
      elList.appendChild(li);
    });

    // Update dashboard if available
    if (typeof window.refreshDashboard === 'function') window.refreshDashboard();
  }

  function escapeHtml(str) {
    const el = document.createElement('span');
    el.textContent = str;
    return el.innerHTML;
  }

  /* ---- Actions ---- */
  function addTask() {
    const text = elInput.value.trim();
    if (!text) return;
    const tasks = load();
    tasks.push({ text, done: false, created: Date.now() });
    save(tasks);
    elInput.value = '';
    render();
  }

  function toggleTask(index) {
    const tasks = load();
    if (tasks[index] === undefined) return;
    tasks[index].done = !tasks[index].done;
    // Track daily completed tasks
    if (tasks[index].done) {
      incrementDailyTasks();
    }
    save(tasks);
    render();
    if (typeof StatsModule !== 'undefined') StatsModule.refresh();
  }

  function deleteTask(index) {
    const tasks = load();
    tasks.splice(index, 1);
    save(tasks);
    render();
  }

  function incrementDailyTasks() {
    const key = 'fr_daily_tasks';
    const today = new Date().toISOString().slice(0, 10);
    const raw = localStorage.getItem(key);
    const data = raw ? JSON.parse(raw) : {};
    data[today] = (data[today] || 0) + 1;
    localStorage.setItem(key, JSON.stringify(data));
  }

  /* ---- Counts for dashboard ---- */
  function getCounts() {
    const tasks = load();
    const done = tasks.filter(t => t.done).length;
    return { total: tasks.length, done, pending: tasks.length - done };
  }

  function getDailyTasksCompleted() {
    const key = 'fr_daily_tasks';
    const today = new Date().toISOString().slice(0, 10);
    const raw = localStorage.getItem(key);
    const data = raw ? JSON.parse(raw) : {};
    return data[today] || 0;
  }

  /* ---- Init ---- */
  function init() {
    elInput = document.getElementById('task-input');
    elList = document.getElementById('task-list');
    elEmpty = document.getElementById('task-empty');
    elAddBtn = document.getElementById('task-add-btn');

    elAddBtn.addEventListener('click', addTask);
    elInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') addTask();
    });

    elList.addEventListener('click', (e) => {
      const target = e.target.closest('[data-index]');
      if (!target) return;
      const idx = parseInt(target.dataset.index, 10);
      if (target.classList.contains('task-check')) {
        toggleTask(idx);
      } else if (target.classList.contains('task-delete-btn')) {
        deleteTask(idx);
      }
    });

    render();
  }

  return { init, getCounts, getDailyTasksCompleted };
})();
