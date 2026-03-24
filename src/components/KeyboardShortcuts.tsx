'use client';

import { useEffect } from 'react';
import { useStore } from '@/store/useStore';

export default function KeyboardShortcuts() {
  const {
    timerState,
    startTimer,
    pauseTimer,
    resumeTimer,
    resetTimer,
    skipSession,
    activeTab,
  } = useStore();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Don't fire if typing in an input/textarea
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      if (activeTab !== 'timer') return;

      switch (e.key.toLowerCase()) {
        case ' ':
          e.preventDefault();
          if (timerState === 'idle') startTimer();
          else if (timerState === 'running') pauseTimer();
          else if (timerState === 'paused') resumeTimer();
          break;
        case 's':
          e.preventDefault();
          skipSession();
          break;
        case 'r':
          e.preventDefault();
          resetTimer();
          break;
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [timerState, startTimer, pauseTimer, resumeTimer, resetTimer, skipSession, activeTab]);

  return null;
}
