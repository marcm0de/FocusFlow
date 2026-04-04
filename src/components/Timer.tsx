'use client';

import { useEffect, useRef, useMemo } from 'react';
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

function getSessionColor(type: SessionType): string {
  switch (type) {
    case 'work': return 'var(--accent)';
    case 'shortBreak': return 'var(--break-short)';
    case 'longBreak': return 'var(--break-long)';
  }
}

function getSessionGlow(type: SessionType): string {
  switch (type) {
    case 'work': return 'var(--work-glow)';
    case 'shortBreak': return 'var(--break-short-glow)';
    case 'longBreak': return 'var(--break-long-glow)';
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

  const activeColor = getSessionColor(sessionType);
  const activeGlow = getSessionGlow(sessionType);

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
            className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300"
            style={{
              background: sessionType === type ? getSessionColor(type) : 'transparent',
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
        {/* Ambient glow — always visible, intensifies when running */}
        <motion.div
          className="absolute rounded-full"
          style={{
            width: 300,
            height: 300,
            background: `radial-gradient(circle, ${activeColor} 0%, transparent 70%)`,
          }}
          animate={{
            opacity: timerState === 'running' ? [0.06, 0.12, 0.06] : 0.04,
            scale: timerState === 'running' ? [1, 1.06, 1] : 1,
          }}
          transition={{
            duration: 3,
            repeat: timerState === 'running' ? Infinity : 0,
            ease: 'easeInOut',
          }}
        />
        <svg width="320" height="320" className="absolute -rotate-90">
          <defs>
            {/* Glow filter for progress ring */}
            <filter id="progress-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>
          {/* Background circle */}
          <circle
            cx="160" cy="160" r="140"
            fill="none"
            stroke="var(--border)"
            strokeWidth="5"
            opacity={0.3}
          />
          {/* Secondary progress track */}
          <circle
            cx="160" cy="160" r="140"
            fill="none"
            stroke="var(--border)"
            strokeWidth="5"
            opacity={0.15}
          />
          {/* Progress circle — smooth CSS transition instead of framer-motion re-renders */}
          <circle
            cx="160" cy="160" r="140"
            fill="none"
            stroke={activeColor}
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            filter="url(#progress-glow)"
            style={{
              transition: 'stroke-dashoffset 1s linear, stroke 0.6s ease',
            }}
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
              transition={{ duration: 0.3 }}
              className="text-sm font-medium mb-2 uppercase tracking-widest"
              style={{ color: activeColor, fontSize: '0.7rem', letterSpacing: '0.15em' }}
            >
              {getSessionLabel(sessionType)}
            </motion.span>
          </AnimatePresence>
          
          <span
            className="text-6xl font-bold tabular-nums tracking-tight"
            style={{
              color: 'var(--foreground)',
              transition: 'color 0.3s ease',
            }}
          >
            {formatTime(timeRemaining)}
          </span>
          
          <span className="text-xs mt-2" style={{ color: 'var(--muted)' }}>
            Session {completedWorkSessions + 1} of {settings.longBreakInterval}
          </span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4">
        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          onClick={resetTimer}
          className="p-3 rounded-full transition-colors duration-200"
          style={{ background: 'var(--card)', color: 'var(--muted)' }}
          title="Reset"
        >
          <RotateCcw size={20} />
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.94 }}
          onClick={() => {
            if (timerState === 'idle') startTimer();
            else if (timerState === 'running') pauseTimer();
            else resumeTimer();
          }}
          className="p-5 rounded-full shadow-lg transition-colors duration-300"
          style={{
            background: activeColor,
            color: '#0f172a',
            boxShadow: `0 0 24px ${activeGlow}`,
          }}
        >
          {timerState === 'running' ? <Pause size={28} /> : <Play size={28} className="ml-1" />}
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          onClick={skipSession}
          className="p-3 rounded-full transition-colors duration-200"
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
        <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
          <motion.div
            className="h-full rounded-full"
            style={{ background: goalProgress >= 100 ? 'var(--success)' : activeColor }}
            animate={{ width: `${Math.min(goalProgress, 100)}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
        </div>
      </div>
    </div>
  );
}
