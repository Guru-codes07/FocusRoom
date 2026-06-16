# 🚀 FocusRoom

### Stay Focused. Track Your Progress. Get Things Done.

FocusRoom is a distraction-free productivity web app built with vanilla HTML, CSS, and JavaScript. It combines a Pomodoro timer, task management, ambient soundscapes, and focus statistics into a single, beautiful dark-themed interface — all running locally in the browser with no backend required.

> *"The best way to stay focused is to focus together."*

---

## 🌟 Live Demo

Simply open `index.html` in your browser — no build tools, no server, no dependencies.

---

## ✨ Features

### 📊 Productivity Dashboard

A real-time overview of your productivity at a glance.

* ✅ Tasks Completed / Pending
* ⏱️ Focus Sessions Count
* ⏳ Total Focus Time (auto-formatted as hours & minutes)
* 🔄 Live updates as you complete tasks and sessions

---

### 💬 Motivational Quotes

A rotating collection of 22 motivational quotes from notable figures — a fresh one is displayed each time you load the app.

---

### ⏱️ Pomodoro Timer

A circular-ring Pomodoro timer with visual progress indication.

* ▶️ Start / ⏸️ Pause / 🔄 Reset controls
* 🎯 **Focus mode** — 25-minute work sessions
* ☕ **Break mode** — 5-minute rest intervals
* 🔔 Audio beep notification on session completion (Web Audio API)
* 📢 Browser notifications when sessions end
* 📈 SVG ring animates to show remaining time
* 📌 Tracks sessions completed today

---

### ✅ Task Manager

A clean, focused task list with full persistence.

* ➕ Add tasks via input field or `Enter` key
* ✔️ Toggle task completion with a single click
* 🗑️ Delete tasks with hover-reveal delete button
* 💾 All tasks persist in `localStorage`
* 🔒 XSS-safe HTML escaping on task text
* 📊 Daily completed tasks tracked separately for stats

---

### 📈 Focus Statistics

Detailed analytics to track your productivity over time.

* 🔢 Total Sessions & Total Focus Minutes
* 📊 Task Completion Rate (percentage)
* 🔥 Current Streak — consecutive days with at least 1 session
* 📅 Today's Summary — sessions, minutes, and tasks completed today
* 💾 All data persisted in `localStorage`

---

### 🎵 Ambient Sounds

Procedurally generated ambient soundscapes using the **Web Audio API** — no external audio files required.

| Sound | Technique |
| ----- | --------- |
| 🌧️ Rain | Pink noise → bandpass filter (800 Hz) |
| 🌊 Ocean | Brown noise → low-pass filter + slow LFO for wave simulation |
| 🌲 Forest | White noise (birds, high bandpass) + brown noise (wind, low-pass) |
| ☕ Café | Pink noise → mid bandpass filter (1200 Hz) |

* 🎚️ Individual volume sliders per sound
* 🔀 Mix multiple sounds simultaneously
* ▶️ Play/pause toggle with visual feedback
* 💡 Cards glow when a sound is active

---

## 🎨 Design

* **Dark Glassmorphism** — frosted-glass cards with `backdrop-filter: blur`
* **Inter Font** — modern, clean typography via Google Fonts
* **Smooth Animations** — CSS keyframe animations, scroll-reveal via Intersection Observer, and micro-interactions on hover
* **Responsive Layout** — mobile-first with breakpoints at `768px` and `480px`
* **Custom Scrollbar** — styled to match the dark theme
* **Scroll Spy Navigation** — active nav link updates as you scroll

---

## 📂 Project Structure

```text
FocusRoom/
│
├── index.html          # Single-page application layout
├── README.md           # Project documentation
│
├── css/
│   └── style.css       # Global styles, design system, and responsive rules
│
└── js/
    ├── sounds.js       # SoundsModule — Web Audio API ambient sound engine
    ├── timer.js        # TimerModule — Pomodoro timer with localStorage persistence
    ├── tasks.js        # TasksModule — Task CRUD with localStorage persistence
    ├── stats.js        # StatsModule — Statistics, streaks, and daily summaries
    └── app.js          # Main controller — quotes, navigation, dashboard, and boot
```

### 🧩 Module Architecture

The app uses the **Revealing Module Pattern** (IIFE) to keep each feature isolated:

| Module | Responsibilities | Public API |
| ------ | --------------- | ---------- |
| `SoundsModule` | Audio graph construction, playback, volume | `toggle`, `play`, `stop`, `setVolume`, `isPlaying` |
| `TimerModule` | Countdown logic, mode switching, session recording | `init`, `getStats`, `todaySessions` |
| `TasksModule` | Task CRUD, localStorage sync, daily tracking | `init`, `getCounts`, `getDailyTasksCompleted` |
| `StatsModule` | Aggregates data from Timer + Tasks modules | `init`, `refresh` |
| `app.js` | Bootstraps everything, wires UI, manages dashboard | — (self-executing) |

---

## 🛠️ Technologies Used

| Category | Technology |
| -------- | ---------- |
| Structure | HTML5 (semantic elements) |
| Styling | CSS3 (custom properties, grid, flexbox, backdrop-filter, keyframe animations) |
| Logic | Vanilla JavaScript (ES6+, IIFE modules) |
| Audio | Web Audio API (oscillators, noise buffers, biquad filters, LFOs) |
| Persistence | localStorage |
| Typography | [Inter](https://fonts.google.com/specimen/Inter) via Google Fonts |
| Notifications | Browser Notification API |

**Zero dependencies. No build tools. No frameworks.**

---

## 🚀 Getting Started

**Clone the repository:**

```bash
git clone https://github.com/Guru-codes07/FocusRoom.git
```

**Navigate to the project:**

```bash
cd FocusRoom
```

**Open the app:**

```bash
# On macOS
open index.html

# On Linux
xdg-open index.html

# Or simply open index.html in your browser
```

> **Tip:** For ambient sounds to work, interact with the page first (click anywhere) — browsers require a user gesture before playing audio.

---

## 🖥️ Sections

| Section | Description |
| ------- | ----------- |
| 🏠 Hero | Landing section with CTA to start focusing |
| 📊 Dashboard | Real-time productivity metrics cards |
| 💬 Motivation | Random inspirational quote display |
| ⏱️ Timer | Pomodoro timer with circular progress ring |
| ✅ Tasks | Task input, list, and completion tracking |
| 📈 Stats | Focus statistics with daily summary |
| 🎵 Sounds | Ambient sound mixer with volume controls |

---

## 🔮 Future Improvements

* ⚛️ React.js or Next.js Frontend
* 🟢 Node.js + Express Backend
* 🍃 MongoDB / PostgreSQL Database
* 🔐 User Authentication (JWT)
* ⚡ Real-Time Collaboration (Socket.IO)
* 👤 User Profiles & Cloud Sync
* 📊 Weekly/Monthly Analytics Charts
* 📱 Progressive Web App (PWA) Support
* ☁️ Cloud Deployment (Vercel / Railway)

---

## 👨‍💻 Author

**Guru Prasad Mishra**

🎓 Computer Science Engineering Student

🐧 Linux Enthusiast

🌱 Open Source Learner

💻 Aspiring Software Developer

---

## 📌 License

This repository is shared for **educational and portfolio purposes**.

© Guru Prasad Mishra. All rights reserved.

---

### ⭐ If you found this project interesting, consider giving it a star!


