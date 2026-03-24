# 🔥 FocusFlow

A beautiful Pomodoro timer and task manager with ambient sound mixing. Stay focused, track your sessions, and build your streak.

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![License](https://img.shields.io/badge/License-MIT-green)

## Features

- **⏱️ Pomodoro Timer** — Circular countdown with animated progress ring. Work → Short Break → Work → Long Break cycle.
- **📋 Task Manager** — Add tasks, mark complete, link tasks to focus sessions to track time per task.
- **🎵 Ambient Sound Mixer** — Rain, coffee shop, fireplace, ocean — mix and match with individual volume controls.
- **📊 Statistics** — Total focus time, sessions completed, daily streak, average session length, weekly chart.
- **🎯 Daily Goal** — Set a daily focus target and track progress with a visual progress bar.
- **🔥 Streaks** — Build daily focus streaks to stay consistent.
- **🔔 Notifications** — Browser notifications when sessions end.
- **⚙️ Customizable** — Adjust work/break durations, long break interval, auto-start preferences.
- **💾 Persistent** — All data saved to localStorage via Zustand.

## Tech Stack

- [Next.js](https://nextjs.org/) (App Router)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Zustand](https://zustand-demo.pmnd.rs/) (state management + persistence)
- [Framer Motion](https://www.framer.com/motion/) (animations)
- [Lucide React](https://lucide.dev/) (icons)
- [date-fns](https://date-fns.org/) (date utilities)

## Getting Started

```bash
# Clone
git clone https://github.com/yourusername/FocusFlow.git
cd FocusFlow

# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to start focusing.

## Usage

1. **Set a task** — Go to Tasks tab, add what you're working on, click the target icon to link it to the timer.
2. **Start focusing** — Hit play on the timer. A 25-minute work session begins.
3. **Take breaks** — After each session, FocusFlow switches to a break. After 4 sessions, you get a long break.
4. **Mix sounds** — Toggle ambient sounds and adjust volumes for your ideal focus environment.
5. **Track progress** — Check the Stats tab for your focus history, streak, and weekly overview.

## Customization

Click the gear icon to adjust:
- Focus duration (default: 25 min)
- Short break (default: 5 min)
- Long break (default: 15 min)
- Sessions before long break (default: 4)
- Daily goal (default: 240 min)
- Auto-start breaks/work

## Adding Real Ambient Sounds

The sound mixer UI is fully built with placeholder controls. To add real audio:

1. Place audio files in `public/sounds/` (e.g., `rain.mp3`, `coffee.mp3`)
2. Create an audio context or use `<audio>` elements controlled by the Zustand store
3. Hook the volume sliders to actual audio gain nodes

## License

MIT — see [LICENSE](./LICENSE)
