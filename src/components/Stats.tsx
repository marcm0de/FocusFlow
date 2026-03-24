'use client';

import { motion } from 'framer-motion';
import { Clock, Target, Flame, TrendingUp, Calendar } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { format, isSameDay, subDays } from 'date-fns';

export default function Stats() {
  const { getStats, sessions, settings } = useStore();
  const stats = getStats();

  // Build last 7 days chart data
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

  return (
    <div className="flex flex-col gap-6 w-full max-w-lg mx-auto">
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
    </div>
  );
}
