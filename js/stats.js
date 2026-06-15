const StatsModule = (() => {
  'use strict';

  /* ---- DOM refs ---- */
  let elTotalSessions, elTotalMinutes, elCompletion, elStreak;
  let elDailySessions, elDailyMinutes, elDailyTasks;

  /* ---- Helpers ---- */
  function todayKey() {
    return new Date().toISOString().slice(0, 10);
  }

  /** Calculate streak = consecutive days with at least 1 session ending today */
  function calcStreak(days) {
    const today = new Date();
    let streak = 0;
    const d = new Date(today);
    while (true) {
      const key = d.toISOString().slice(0, 10);
      if (days[key] && days[key].sessions > 0) {
        streak++;
        d.setDate(d.getDate() - 1);
      } else {
        break;
      }
    }
    return streak;
  }

  /** Completion rate = sessions done / tasks created * 100 (capped at 100) */
  function calcCompletion(timerStats) {
    const taskCounts = typeof TasksModule !== 'undefined' ? TasksModule.getCounts() : { total: 0, done: 0 };
    if (taskCounts.total === 0 && timerStats.total === 0) return 0;
    // Use task completion rate if tasks exist, otherwise session-based
    if (taskCounts.total > 0) {
      return Math.min(100, Math.round((taskCounts.done / taskCounts.total) * 100));
    }
    return timerStats.total > 0 ? 100 : 0;
  }

  /* ---- Refresh UI ---- */
  function refresh() {
    const stats = typeof TimerModule !== 'undefined' ? TimerModule.getStats() : { total: 0, totalMinutes: 0, days: {} };
    const today = todayKey();
    const dailyData = stats.days[today] || { sessions: 0, minutes: 0 };

    // Main stat cards
    if (elTotalSessions) elTotalSessions.textContent = stats.total;
    if (elTotalMinutes) elTotalMinutes.textContent = stats.totalMinutes;
    if (elCompletion) elCompletion.textContent = calcCompletion(stats) + '%';
    if (elStreak) elStreak.textContent = calcStreak(stats.days);

    // Daily summary
    if (elDailySessions) elDailySessions.textContent = dailyData.sessions;
    if (elDailyMinutes) elDailyMinutes.textContent = dailyData.minutes;
    if (elDailyTasks) {
      const dailyTasksDone = typeof TasksModule !== 'undefined' ? TasksModule.getDailyTasksCompleted() : 0;
      elDailyTasks.textContent = dailyTasksDone;
    }
  }

  /* ---- Init ---- */
  function init() {
    elTotalSessions = document.getElementById('stat-total-sessions');
    elTotalMinutes = document.getElementById('stat-total-minutes');
    elCompletion = document.getElementById('stat-completion');
    elStreak = document.getElementById('stat-streak');
    elDailySessions = document.getElementById('daily-sessions');
    elDailyMinutes = document.getElementById('daily-minutes');
    elDailyTasks = document.getElementById('daily-tasks');

    refresh();
  }

  return { init, refresh };
})();
