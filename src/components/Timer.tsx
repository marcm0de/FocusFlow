'use client';

import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCcw, SkipForward } from 'lucide-react';
import { useStore, SessionType } from '@/store/useStore';

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

function getSessionLabel(type: SessionType): string {
  switch (type) {
    case 'work': return 'Focus Time';
    case 'shortBreak': return 'Short Break';
    case 'longBreak': return 'Long Break';
  }
}

function getDurationForType(type: SessionType, settings: { workDuration: number; shortBreakDuration: number; longBreakDuration: number }): number {
  switch (type) {
    case 'work': return settings.workDuration * 60;
    case 'shortBreak': return settings.shortBreakDuration * 60;
    case 'longBreak': return settings.longBreakDuration * 60;
  }
}

export default function Timer() {
  const {
    timerState, sessionType, timeRemaining, settings, completedWorkSessions,
    startTimer, pauseTimer, resumeTimer, resetTimer, tick, skipSession,
    setSessionType, getTodayFocusMinutes, getDailyGoalProgress,
  } = useStore();

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (timerState === 'running') {
      intervalRef.current = setInterval(() => tick(), 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [timerState, tick]);

  // Request notification permission
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const totalDuration = getDurationForType(sessionType, settings);
  const progress = totalDuration > 0 ? (totalDuration - timeRemaining) / totalDuration : 0;
  const circumference = 2 * Math.PI * 140;
  const strokeDashoffset = circumference - (progress * circumference);

  const todayMinutes = getTodayFocusMinutes();
  const goalProgress = getDailyGoalProgress();

  const sessionTypes: { type: SessionType; label: string }[] = [
    { type: 'work', label: 'Focus' },
    { type: 'shortBreak', label: 'Short Break' },
    { type: 'longBreak', label: 'Long Break' },
  ];

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Session type tabs */}
      <div className="flex gap-1 p-1 rounded-xl" style={{ background: 'var(--card)' }}>
        {sessionTypes.map(({ type, label }) => (
          <button
            key={type}
            onClick={() => timerState === 'idle' && setSessionType(type)}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
            style={{
              background: sessionType === type ? 'var(--accent)' : 'transparent',
              color: sessionType === type ? '#0f172a' : 'var(--muted)',
              cursor: timerState === 'idle' ? 'pointer' : 'default',
              opacity: timerState !== 'idle' && sessionType !== type ? 0.5 : 1,
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Timer circle */}
      <div className="relative flex items-center justify-center" style={{ width: 320, height: 320 }}>
        <svg width="320" height="320" className="absolute -rotate-90">
          {/* Background circle */}
          <circle
            cx="160" cy="160" r="140"
            fill="none"
            stroke="var(--border)"
            strokeWidth="6"
          />
          {/* Progress circle */}
          <motion.circle
            cx="160" cy="160" r="140"
            fill="none"
            stroke="var(--accent)"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            animate={{ strokeDashoffset }}
            transition={{ duration: 0.5, ease: 'linear' }}
          />
        </svg>
        
        {/* Center content */}
        <div className="flex flex-col items-center z-10">
          <AnimatePresence mode="wait">
            <motion.span
              key={sessionType}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="text-sm font-medium mb-2"
              style={{ color: 'var(--accent)' }}
            >
              {getSessionLabel(sessionType)}
            </motion.span>
          </AnimatePresence>
          
          <motion.span
            className="text-6xl font-bold tabular-nums tracking-tight"
            style={{ color: 'var(--foreground)' }}
            key={timeRemaining}
            animate={{ scale: timerState === 'running' ? [1, 1.01, 1] : 1 }}
            transition={{ duration: 1, repeat: timerState === 'running' ? Infinity : 0 }}
          >
            {formatTime(timeRemaining)}
          </motion.span>
          
          <span className="text-xs mt-2" style={{ color: 'var(--muted)' }}>
            Session {completedWorkSessions + 1} of {settings.longBreakInterval}
          </span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={resetTimer}
          className="p-3 rounded-full"
          style={{ background: 'var(--card)', color: 'var(--muted)' }}
          title="Reset"
        >
          <RotateCcw size={20} />
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            if (timerState === 'idle') startTimer();
            else if (timerState === 'running') pauseTimer();
            else resumeTimer();
          }}
          className="p-5 rounded-full"
          style={{ background: 'var(--accent)', color: '#0f172a' }}
        >
          {timerState === 'running' ? <Pause size={28} /> : <Play size={28} className="ml-1" />}
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={skipSession}
          className="p-3 rounded-full"
          style={{ background: 'var(--card)', color: 'var(--muted)' }}
          title="Skip"
        >
          <SkipForward size={20} />
        </motion.button>
      </div>

      {/* Keyboard shortcut hint */}
      <div className="flex items-center justify-center gap-3 text-[10px]" style={{ color: 'var(--muted)', opacity: 0.4 }}>
        <span><kbd className="px-1 py-0.5 rounded border" style={{ borderColor: 'var(--border)' }}>Space</kbd> play/pause</span>
        <span><kbd className="px-1 py-0.5 rounded border" style={{ borderColor: 'var(--border)' }}>S</kbd> skip</span>
        <span><kbd className="px-1 py-0.5 rounded border" style={{ borderColor: 'var(--border)' }}>R</kbd> reset</span>
      </div>

      {/* Daily progress */}
      <div className="w-full max-w-xs">
        <div className="flex justify-between text-xs mb-1" style={{ color: 'var(--muted)' }}>
          <span>Today: {Math.round(todayMinutes)} min</span>
          <span>Goal: {settings.dailyGoalMinutes} min</span>
        </div>
        <div className="w-full h-2 rounded-full" style={{ background: 'var(--border)' }}>
          <motion.div
            className="h-full rounded-full"
            style={{ background: goalProgress >= 100 ? 'var(--success)' : 'var(--accent)' }}
            animate={{ width: `${goalProgress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>
    </div>
  );
}
