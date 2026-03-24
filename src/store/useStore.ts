import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { startOfDay, isSameDay, differenceInCalendarDays, subDays, subWeeks, startOfWeek, endOfWeek, isWithinInterval, format, subMonths, startOfMonth, endOfMonth } from 'date-fns';

// Types
export interface Task {
  id: string;
  title: string;
  completed: boolean;
  createdAt: string;
  focusMinutes: number;
  sessionCount: number;
}

export interface FocusSession {
  id: string;
  taskId: string | null;
  taskTitle: string | null;
  startedAt: string;
  duration: number; // planned duration in seconds
  actualDuration: number; // actual seconds focused
  completed: boolean;
  type: 'work' | 'shortBreak' | 'longBreak';
}

export type TimerState = 'idle' | 'running' | 'paused';
export type SessionType = 'work' | 'shortBreak' | 'longBreak';

export interface TimerSettings {
  workDuration: number; // minutes
  shortBreakDuration: number;
  longBreakDuration: number;
  longBreakInterval: number; // after N work sessions
  dailyGoalMinutes: number;
  autoStartBreaks: boolean;
  autoStartWork: boolean;
}

export interface SoundConfig {
  id: string;
  name: string;
  icon: string;
  volume: number;
  playing: boolean;
}

interface AppState {
  // Timer
  timerState: TimerState;
  sessionType: SessionType;
  timeRemaining: number; // seconds
  completedWorkSessions: number;
  currentTaskId: string | null;
  
  // Settings
  settings: TimerSettings;
  
  // Tasks
  tasks: Task[];
  
  // Sessions
  sessions: FocusSession[];
  
  // Sounds
  sounds: SoundConfig[];
  
  // Streak
  lastFocusDate: string | null;
  currentStreak: number;
  
  // Navigation
  activeTab: 'timer' | 'tasks' | 'stats';
  showSettings: boolean;
  
  // Actions
  startTimer: () => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  resetTimer: () => void;
  tick: () => void;
  completeSession: () => void;
  skipSession: () => void;
  
  setSessionType: (type: SessionType) => void;
  setCurrentTask: (taskId: string | null) => void;
  
  updateSettings: (settings: Partial<TimerSettings>) => void;
  
  addTask: (title: string) => void;
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;
  
  toggleSound: (id: string) => void;
  setSoundVolume: (id: string, volume: number) => void;
  
  setActiveTab: (tab: 'timer' | 'tasks' | 'stats') => void;
  setShowSettings: (show: boolean) => void;
  
  // Computed helpers
  getTodayFocusMinutes: () => number;
  getDailyGoalProgress: () => number;
  getStreak: () => number;
  getStats: () => {
    totalFocusMinutes: number;
    totalSessions: number;
    completedSessions: number;
    avgSessionMinutes: number;
    streak: number;
  };

  getFocusScore: () => number;
  getWeeklyData: (weeksAgo?: number) => { label: string; minutes: number; isToday: boolean }[];
  getMonthlyData: (monthsAgo?: number) => { label: string; minutes: number }[];
}

const DEFAULT_SETTINGS: TimerSettings = {
  workDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  longBreakInterval: 4,
  dailyGoalMinutes: 240,
  autoStartBreaks: false,
  autoStartWork: false,
};

const DEFAULT_SOUNDS: SoundConfig[] = [
  { id: 'rain', name: 'Rain', icon: '🌧️', volume: 0.5, playing: false },
  { id: 'coffee', name: 'Coffee Shop', icon: '☕', volume: 0.5, playing: false },
  { id: 'fire', name: 'Fireplace', icon: '🔥', volume: 0.5, playing: false },
  { id: 'ocean', name: 'Ocean', icon: '🌊', volume: 0.5, playing: false },
];

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

function getDurationForType(type: SessionType, settings: TimerSettings): number {
  switch (type) {
    case 'work': return settings.workDuration * 60;
    case 'shortBreak': return settings.shortBreakDuration * 60;
    case 'longBreak': return settings.longBreakDuration * 60;
  }
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Initial state
      timerState: 'idle',
      sessionType: 'work',
      timeRemaining: DEFAULT_SETTINGS.workDuration * 60,
      completedWorkSessions: 0,
      currentTaskId: null,
      settings: DEFAULT_SETTINGS,
      tasks: [],
      sessions: [],
      sounds: DEFAULT_SOUNDS,
      lastFocusDate: null,
      currentStreak: 0,
      activeTab: 'timer',
      showSettings: false,

      // Timer actions
      startTimer: () => {
        const state = get();
        set({ 
          timerState: 'running',
          timeRemaining: getDurationForType(state.sessionType, state.settings),
        });
      },

      pauseTimer: () => set({ timerState: 'paused' }),
      
      resumeTimer: () => set({ timerState: 'running' }),

      resetTimer: () => {
        const state = get();
        set({
          timerState: 'idle',
          timeRemaining: getDurationForType(state.sessionType, state.settings),
        });
      },

      tick: () => {
        const state = get();
        if (state.timerState !== 'running') return;
        
        if (state.timeRemaining <= 1) {
          get().completeSession();
        } else {
          set({ timeRemaining: state.timeRemaining - 1 });
        }
      },

      completeSession: () => {
        const state = get();
        const now = new Date();
        const todayStr = startOfDay(now).toISOString();
        
        // Record session
        if (state.sessionType === 'work') {
          const task = state.tasks.find(t => t.id === state.currentTaskId);
          const session: FocusSession = {
            id: generateId(),
            taskId: state.currentTaskId,
            taskTitle: task?.title || null,
            startedAt: now.toISOString(),
            duration: getDurationForType('work', state.settings),
            actualDuration: getDurationForType('work', state.settings),
            completed: true,
            type: 'work',
          };

          const newSessions = [...state.sessions, session];
          const newWorkCount = state.completedWorkSessions + 1;
          
          // Update task focus time
          const newTasks = state.tasks.map(t => 
            t.id === state.currentTaskId 
              ? { ...t, focusMinutes: t.focusMinutes + state.settings.workDuration, sessionCount: t.sessionCount + 1 }
              : t
          );

          // Update streak
          let newStreak = state.currentStreak;
          if (!state.lastFocusDate || !isSameDay(new Date(state.lastFocusDate), now)) {
            if (state.lastFocusDate && differenceInCalendarDays(now, new Date(state.lastFocusDate)) === 1) {
              newStreak = state.currentStreak + 1;
            } else if (!state.lastFocusDate || differenceInCalendarDays(now, new Date(state.lastFocusDate)) > 1) {
              newStreak = 1;
            }
          }

          // Determine next session type
          const isLongBreak = newWorkCount % state.settings.longBreakInterval === 0;
          const nextType: SessionType = isLongBreak ? 'longBreak' : 'shortBreak';

          set({
            sessions: newSessions,
            tasks: newTasks,
            completedWorkSessions: newWorkCount,
            lastFocusDate: todayStr,
            currentStreak: newStreak,
            timerState: state.settings.autoStartBreaks ? 'running' : 'idle',
            sessionType: nextType,
            timeRemaining: getDurationForType(nextType, state.settings),
          });

          // Send notification
          if (typeof window !== 'undefined' && Notification.permission === 'granted') {
            new Notification('FocusFlow', {
              body: `Work session complete! Time for a ${isLongBreak ? 'long' : 'short'} break.`,
              icon: '/favicon.ico',
            });
          }
        } else {
          // Break completed
          set({
            timerState: state.settings.autoStartWork ? 'running' : 'idle',
            sessionType: 'work',
            timeRemaining: getDurationForType('work', state.settings),
          });

          if (typeof window !== 'undefined' && Notification.permission === 'granted') {
            new Notification('FocusFlow', {
              body: 'Break over! Ready to focus?',
              icon: '/favicon.ico',
            });
          }
        }
      },

      skipSession: () => {
        const state = get();
        if (state.sessionType === 'work') {
          const isLongBreak = (state.completedWorkSessions + 1) % state.settings.longBreakInterval === 0;
          const nextType: SessionType = isLongBreak ? 'longBreak' : 'shortBreak';
          set({
            timerState: 'idle',
            sessionType: nextType,
            timeRemaining: getDurationForType(nextType, state.settings),
          });
        } else {
          set({
            timerState: 'idle',
            sessionType: 'work',
            timeRemaining: getDurationForType('work', state.settings),
          });
        }
      },

      setSessionType: (type) => {
        const state = get();
        set({
          sessionType: type,
          timeRemaining: getDurationForType(type, state.settings),
          timerState: 'idle',
        });
      },

      setCurrentTask: (taskId) => set({ currentTaskId: taskId }),

      updateSettings: (newSettings) => {
        const state = get();
        const merged = { ...state.settings, ...newSettings };
        set({
          settings: merged,
          timeRemaining: state.timerState === 'idle' ? getDurationForType(state.sessionType, merged) : state.timeRemaining,
        });
      },

      addTask: (title) => {
        const task: Task = {
          id: generateId(),
          title,
          completed: false,
          createdAt: new Date().toISOString(),
          focusMinutes: 0,
          sessionCount: 0,
        };
        set(state => ({ tasks: [...state.tasks, task] }));
      },

      toggleTask: (id) => {
        set(state => ({
          tasks: state.tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t),
        }));
      },

      deleteTask: (id) => {
        set(state => ({
          tasks: state.tasks.filter(t => t.id !== id),
          currentTaskId: state.currentTaskId === id ? null : state.currentTaskId,
        }));
      },

      toggleSound: (id) => {
        set(state => ({
          sounds: state.sounds.map(s => s.id === id ? { ...s, playing: !s.playing } : s),
        }));
      },

      setSoundVolume: (id, volume) => {
        set(state => ({
          sounds: state.sounds.map(s => s.id === id ? { ...s, volume } : s),
        }));
      },

      setActiveTab: (tab) => set({ activeTab: tab }),
      setShowSettings: (show) => set({ showSettings: show }),

      getTodayFocusMinutes: () => {
        const state = get();
        const today = startOfDay(new Date());
        return state.sessions
          .filter(s => s.type === 'work' && s.completed && isSameDay(new Date(s.startedAt), today))
          .reduce((acc, s) => acc + s.actualDuration / 60, 0);
      },

      getDailyGoalProgress: () => {
        const state = get();
        const minutes = state.getTodayFocusMinutes();
        return Math.min((minutes / state.settings.dailyGoalMinutes) * 100, 100);
      },

      getStreak: () => {
        const state = get();
        if (!state.lastFocusDate) return 0;
        const last = new Date(state.lastFocusDate);
        const now = new Date();
        const diff = differenceInCalendarDays(now, last);
        if (diff > 1) return 0;
        return state.currentStreak;
      },

      getStats: () => {
        const state = get();
        const workSessions = state.sessions.filter(s => s.type === 'work');
        const completedSessions = workSessions.filter(s => s.completed);
        const totalMinutes = completedSessions.reduce((acc, s) => acc + s.actualDuration / 60, 0);
        
        return {
          totalFocusMinutes: Math.round(totalMinutes),
          totalSessions: workSessions.length,
          completedSessions: completedSessions.length,
          avgSessionMinutes: completedSessions.length > 0 ? Math.round(totalMinutes / completedSessions.length) : 0,
          streak: state.getStreak(),
        };
      },

      getFocusScore: () => {
        const state = get();
        const streak = state.getStreak();
        const todayMinutes = state.getTodayFocusMinutes();
        const goalProgress = state.getDailyGoalProgress();
        const stats = state.getStats();

        // Score components (max 100):
        // - Daily goal progress: 0-40 points
        // - Streak bonus: 0-30 points (caps at 30 days)
        // - Consistency bonus: 0-30 points (based on completed vs total sessions)
        const goalScore = Math.min(goalProgress, 100) * 0.4;
        const streakScore = Math.min(streak, 30) * (30 / 30);
        const completionRate = stats.totalSessions > 0
          ? (stats.completedSessions / stats.totalSessions) * 30
          : 0;

        return Math.round(goalScore + streakScore + completionRate);
      },

      getWeeklyData: (weeksAgo = 0) => {
        const state = get();
        const today = new Date();
        const targetWeekStart = startOfWeek(subWeeks(today, weeksAgo));
        
        return Array.from({ length: 7 }, (_, i) => {
          const date = subDays(targetWeekStart, -i);
          const dayMinutes = state.sessions
            .filter(s => s.type === 'work' && s.completed && isSameDay(new Date(s.startedAt), date))
            .reduce((acc, s) => acc + s.actualDuration / 60, 0);
          return {
            label: format(date, 'EEE'),
            minutes: Math.round(dayMinutes),
            isToday: isSameDay(date, today),
          };
        });
      },

      getMonthlyData: (monthsAgo = 0) => {
        const state = get();
        const targetMonth = subMonths(new Date(), monthsAgo);
        const monthStart = startOfMonth(targetMonth);
        const monthEnd = endOfMonth(targetMonth);
        
        // Group by week within the month
        const weeks: { label: string; minutes: number }[] = [];
        let weekStart = monthStart;
        let weekNum = 1;
        while (weekStart <= monthEnd) {
          const weekEnd = new Date(Math.min(subDays(weekStart, -6).getTime(), monthEnd.getTime()));
          const weekMinutes = state.sessions
            .filter(s => {
              const d = new Date(s.startedAt);
              return s.type === 'work' && s.completed && d >= weekStart && d <= weekEnd;
            })
            .reduce((acc, s) => acc + s.actualDuration / 60, 0);
          weeks.push({
            label: `W${weekNum}`,
            minutes: Math.round(weekMinutes),
          });
          weekStart = subDays(weekStart, -7);
          weekNum++;
        }
        return weeks;
      },
    }),
    {
      name: 'focusflow-storage',
      partialize: (state) => ({
        tasks: state.tasks,
        sessions: state.sessions,
        sounds: state.sounds,
        settings: state.settings,
        completedWorkSessions: state.completedWorkSessions,
        lastFocusDate: state.lastFocusDate,
        currentStreak: state.currentStreak,
      }),
    }
  )
);
