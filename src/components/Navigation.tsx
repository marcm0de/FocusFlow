'use client';

import { motion } from 'framer-motion';
import { Timer as TimerIcon, ListTodo, BarChart3, Settings } from 'lucide-react';
import { useStore } from '@/store/useStore';

export default function Navigation() {
  const { activeTab, setActiveTab, setShowSettings, getStreak } = useStore();
  const streak = getStreak();

  const tabs = [
    { id: 'timer' as const, icon: TimerIcon, label: 'Timer' },
    { id: 'tasks' as const, icon: ListTodo, label: 'Tasks' },
    { id: 'stats' as const, icon: BarChart3, label: 'Stats' },
  ];

  return (
    <div className="flex items-center justify-between w-full max-w-lg mx-auto">
      <div className="flex items-center gap-1">
        <span className="text-xl">🔥</span>
        <span className="text-sm font-bold" style={{ color: 'var(--accent)' }}>
          FocusFlow
        </span>
        {streak > 0 && (
          <span className="text-xs px-2 py-0.5 rounded-full ml-2" style={{ background: 'var(--card)', color: 'var(--accent)' }}>
            🔥 {streak}d
          </span>
        )}
      </div>

      <div className="flex items-center gap-1">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="relative p-2 rounded-lg"
            style={{ color: activeTab === tab.id ? 'var(--accent)' : 'var(--muted)' }}
          >
            <tab.icon size={20} />
            {activeTab === tab.id && (
              <motion.div
                layoutId="activeTab"
                className="absolute inset-0 rounded-lg -z-10"
                style={{ background: 'var(--card)' }}
              />
            )}
          </button>
        ))}

        <button
          onClick={() => setShowSettings(true)}
          className="p-2 rounded-lg ml-1"
          style={{ color: 'var(--muted)' }}
        >
          <Settings size={20} />
        </button>
      </div>
    </div>
  );
}
