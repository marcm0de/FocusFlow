'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, Target, Flame, TrendingUp, Calendar, Award, ChevronLeft, ChevronRight } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { format, isSameDay, subDays } from 'date-fns';

export default function Stats() {
  const { getStats, getFocusScore, getWeeklyData, getMonthlyData, sessions, settings } = useStore();
  const stats = getStats();
  const focusScore = getFocusScore();
  const [compareMode, setCompareMode] = useState<'weekly' | 'monthly'>('weekly');
  const [weekOffset, setWeekOffset] = useState(0);
  const [monthOffset, setMonthOffset] = useState(0);

  // Current and comparison data
  const currentWeek = getWeeklyData(weekOffset);
  const prevWeek = getWeeklyData(weekOffset + 1);
  const currentMonth = getMonthlyData(monthOffset);
  const prevMonth = getMonthlyData(monthOffset + 1);

  // Build last 7 days chart data (for the main quick view)
  const today = new Date();
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = subDays(today, 6 - i);
    const dayMinutes = sessions
      .filter(s => s.type === 'work' && s.completed && isSameDay(new Date(s.startedAt), date))
      .reduce((acc, s) => acc + s.actualDuration / 60, 0);
    return {
      label: format(date, 'EEE'),
      minutes: Math.round(dayMinutes),
      isToday: isSameDay(date, today),
    };
  });

  const maxMinutes = Math.max(...last7Days.map(d => d.minutes), settings.dailyGoalMinutes / 4);

  const statCards = [
    { icon: Clock, label: 'Total Focus', value: `${Math.floor(stats.totalFocusMinutes / 60)}h ${stats.totalFocusMinutes % 60}m`, color: 'var(--accent)' },
    { icon: Target, label: 'Sessions', value: `${stats.completedSessions}`, color: 'var(--success)' },
    { icon: Flame, label: 'Streak', value: `${stats.streak} days`, color: '#ef4444' },
    { icon: TrendingUp, label: 'Avg Session', value: `${stats.avgSessionMinutes} min`, color: '#8b5cf6' },
  ];

  // Recent sessions (last 10)
  const recentSessions = [...sessions]
    .filter(s => s.type === 'work')
    .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime())
    .slice(0, 10);

  // Focus Score color
  const scoreColor = focusScore >= 80 ? 'var(--success)' : focusScore >= 50 ? 'var(--accent)' : '#ef4444';

  return (
    <div className="flex flex-col gap-6 w-full max-w-lg mx-auto">
      {/* Focus Score */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 rounded-xl text-center"
        style={{ background: 'var(--card)' }}
      >
        <div className="flex items-center justify-center gap-2 mb-3">
          <Award size={20} style={{ color: scoreColor }} />
          <span className="text-sm font-medium" style={{ color: 'var(--muted)' }}>Focus Score</span>
        </div>
        <div className="relative w-32 h-32 mx-auto mb-3">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="50" fill="none" stroke="var(--border)" strokeWidth="8" />
            <motion.circle
              cx="60" cy="60" r="50" fill="none"
              stroke={scoreColor}
              strokeWidth="8" strokeLinecap="round"
              strokeDasharray={Math.PI * 100}
              initial={{ strokeDashoffset: Math.PI * 100 }}
              animate={{ strokeDashoffset: Math.PI * 100 * (1 - focusScore / 100) }}
              transition={{ duration: 1, ease: 'easeOut' }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-3xl font-bold" style={{ color: 'var(--foreground)' }}>{focusScore}</span>
          </div>
        </div>
        <p className="text-xs" style={{ color: 'var(--muted)' }}>
          {focusScore >= 80 ? '🔥 Outstanding focus!' : focusScore >= 50 ? '💪 Good progress!' : '🌱 Keep building the habit!'}
        </p>
        <div className="flex justify-center gap-4 mt-3 text-xs" style={{ color: 'var(--muted)' }}>
          <span>Goal: {Math.round(useStore.getState().getDailyGoalProgress())}%</span>
          <span>Streak: {stats.streak}d</span>
          <span>Rate: {stats.totalSessions > 0 ? Math.round((stats.completedSessions / stats.totalSessions) * 100) : 0}%</span>
        </div>
      </motion.div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3">
        {statCards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="p-4 rounded-xl"
            style={{ background: 'var(--card)' }}
          >
            <div className="flex items-center gap-2 mb-2">
              <card.icon size={16} style={{ color: card.color }} />
              <span className="text-xs" style={{ color: 'var(--muted)' }}>{card.label}</span>
            </div>
            <p className="text-xl font-bold" style={{ color: 'var(--foreground)' }}>{card.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Weekly chart */}
      <div className="p-4 rounded-xl" style={{ background: 'var(--card)' }}>
        <div className="flex items-center gap-2 mb-4">
          <Calendar size={16} style={{ color: 'var(--accent)' }} />
          <span className="text-sm font-medium">This Week</span>
        </div>
        <div className="flex items-end justify-between gap-2" style={{ height: 120 }}>
          {last7Days.map((day, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full relative" style={{ height: 90 }}>
                <motion.div
                  className="absolute bottom-0 w-full rounded-t-md"
                  initial={{ height: 0 }}
                  animate={{ height: maxMinutes > 0 ? `${(day.minutes / maxMinutes) * 100}%` : '0%' }}
                  transition={{ delay: i * 0.05, duration: 0.5 }}
                  style={{
                    background: day.isToday ? 'var(--accent)' : 'var(--border)',
                    minHeight: day.minutes > 0 ? 4 : 0,
                  }}
                />
              </div>
              <span className="text-[10px]" style={{ color: day.isToday ? 'var(--accent)' : 'var(--muted)' }}>
                {day.label}
              </span>
              {day.minutes > 0 && (
                <span className="text-[10px]" style={{ color: 'var(--muted)' }}>
                  {day.minutes}m
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Comparison Charts */}
      <div className="p-4 rounded-xl" style={{ background: 'var(--card)' }}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp size={16} style={{ color: 'var(--accent)' }} />
            <span className="text-sm font-medium">Compare</span>
          </div>
          <div className="flex gap-1">
            <button
              onClick={() => setCompareMode('weekly')}
              className="px-2.5 py-1 rounded-lg text-xs font-medium transition-all"
              style={{
                background: compareMode === 'weekly' ? 'var(--accent)' : 'transparent',
                color: compareMode === 'weekly' ? '#0f172a' : 'var(--muted)',
              }}
            >
              Weekly
            </button>
            <button
              onClick={() => setCompareMode('monthly')}
              className="px-2.5 py-1 rounded-lg text-xs font-medium transition-all"
              style={{
                background: compareMode === 'monthly' ? 'var(--accent)' : 'transparent',
                color: compareMode === 'monthly' ? '#0f172a' : 'var(--muted)',
              }}
            >
              Monthly
            </button>
          </div>
        </div>

        {compareMode === 'weekly' ? (
          <>
            <div className="flex items-center justify-between mb-3">
              <button onClick={() => setWeekOffset(weekOffset + 1)} className="p-1" style={{ color: 'var(--muted)' }}>
                <ChevronLeft size={16} />
              </button>
              <span className="text-xs" style={{ color: 'var(--muted)' }}>
                {weekOffset === 0 ? 'This Week vs Last Week' : `${weekOffset} weeks ago vs ${weekOffset + 1} weeks ago`}
              </span>
              <button
                onClick={() => setWeekOffset(Math.max(0, weekOffset - 1))}
                disabled={weekOffset === 0}
                className="p-1"
                style={{ color: weekOffset === 0 ? 'var(--border)' : 'var(--muted)' }}
              >
                <ChevronRight size={16} />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <ComparisonBar
                label="Current"
                minutes={currentWeek.reduce((a, d) => a + d.minutes, 0)}
                maxMinutes={Math.max(
                  currentWeek.reduce((a, d) => a + d.minutes, 0),
                  prevWeek.reduce((a, d) => a + d.minutes, 0),
                  1
                )}
                color="var(--accent)"
              />
              <ComparisonBar
                label="Previous"
                minutes={prevWeek.reduce((a, d) => a + d.minutes, 0)}
                maxMinutes={Math.max(
                  currentWeek.reduce((a, d) => a + d.minutes, 0),
                  prevWeek.reduce((a, d) => a + d.minutes, 0),
                  1
                )}
                color="var(--border)"
              />
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center justify-between mb-3">
              <button onClick={() => setMonthOffset(monthOffset + 1)} className="p-1" style={{ color: 'var(--muted)' }}>
                <ChevronLeft size={16} />
              </button>
              <span className="text-xs" style={{ color: 'var(--muted)' }}>
                {monthOffset === 0 ? 'This Month vs Last Month' : `${monthOffset} months ago vs ${monthOffset + 1} months ago`}
              </span>
              <button
                onClick={() => setMonthOffset(Math.max(0, monthOffset - 1))}
                disabled={monthOffset === 0}
                className="p-1"
                style={{ color: monthOffset === 0 ? 'var(--border)' : 'var(--muted)' }}
              >
                <ChevronRight size={16} />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <ComparisonBar
                label="Current"
                minutes={currentMonth.reduce((a, d) => a + d.minutes, 0)}
                maxMinutes={Math.max(
                  currentMonth.reduce((a, d) => a + d.minutes, 0),
                  prevMonth.reduce((a, d) => a + d.minutes, 0),
                  1
                )}
                color="var(--accent)"
              />
              <ComparisonBar
                label="Previous"
                minutes={prevMonth.reduce((a, d) => a + d.minutes, 0)}
                maxMinutes={Math.max(
                  currentMonth.reduce((a, d) => a + d.minutes, 0),
                  prevMonth.reduce((a, d) => a + d.minutes, 0),
                  1
                )}
                color="var(--border)"
              />
            </div>
          </>
        )}
      </div>

      {/* Recent sessions */}
      {recentSessions.length > 0 && (
        <div>
          <h3 className="text-sm font-medium mb-3" style={{ color: 'var(--muted)' }}>Recent Sessions</h3>
          <div className="flex flex-col gap-2">
            {recentSessions.map(session => (
              <div
                key={session.id}
                className="flex items-center justify-between p-3 rounded-lg"
                style={{ background: 'var(--card)' }}
              >
                <div>
                  <p className="text-sm" style={{ color: 'var(--foreground)' }}>
                    {session.taskTitle || 'Untitled session'}
                  </p>
                  <p className="text-xs" style={{ color: 'var(--muted)' }}>
                    {format(new Date(session.startedAt), 'MMM d, h:mm a')}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm" style={{ color: 'var(--foreground)' }}>
                    {Math.round(session.actualDuration / 60)} min
                  </span>
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ background: session.completed ? 'var(--success)' : 'var(--danger)' }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {recentSessions.length === 0 && (
        <p className="text-center py-8 text-sm" style={{ color: 'var(--muted)' }}>
          No sessions yet. Start your first focus session!
        </p>
      )}

      {/* Keyboard shortcuts hint */}
      <div className="text-center text-[10px] pb-4" style={{ color: 'var(--muted)', opacity: 0.4 }}>
        Timer shortcuts: Space (play/pause) · S (skip) · R (reset)
      </div>
    </div>
  );
}

function ComparisonBar({ label, minutes, maxMinutes, color }: { label: string; minutes: number; maxMinutes: number; color: string }) {
  const percentage = maxMinutes > 0 ? (minutes / maxMinutes) * 100 : 0;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  return (
    <div className="text-center">
      <p className="text-xs mb-2" style={{ color: 'var(--muted)' }}>{label}</p>
      <div className="h-24 flex items-end justify-center">
        <motion.div
          className="w-12 rounded-t-md"
          initial={{ height: 0 }}
          animate={{ height: `${percentage}%` }}
          transition={{ duration: 0.5 }}
          style={{ background: color, minHeight: minutes > 0 ? 4 : 0 }}
        />
      </div>
      <p className="text-sm font-bold mt-2" style={{ color: 'var(--foreground)' }}>
        {hours > 0 ? `${hours}h ${mins}m` : `${mins}m`}
      </p>
    </div>
  );
}
