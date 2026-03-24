'use client';

import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useStore } from '@/store/useStore';

export default function Settings() {
  const { settings, updateSettings, setShowSettings } = useStore();

  const fields = [
    { key: 'workDuration' as const, label: 'Focus Duration', unit: 'min', min: 1, max: 120 },
    { key: 'shortBreakDuration' as const, label: 'Short Break', unit: 'min', min: 1, max: 30 },
    { key: 'longBreakDuration' as const, label: 'Long Break', unit: 'min', min: 1, max: 60 },
    { key: 'longBreakInterval' as const, label: 'Sessions Before Long Break', unit: '', min: 1, max: 10 },
    { key: 'dailyGoalMinutes' as const, label: 'Daily Goal', unit: 'min', min: 30, max: 720 },
  ];

  const toggles = [
    { key: 'autoStartBreaks' as const, label: 'Auto-start breaks' },
    { key: 'autoStartWork' as const, label: 'Auto-start work sessions' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
      onClick={() => setShowSettings(false)}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="w-full max-w-md p-6 rounded-2xl"
        style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold">Settings</h2>
          <button onClick={() => setShowSettings(false)} style={{ color: 'var(--muted)' }}>
            <X size={20} />
          </button>
        </div>

        <div className="flex flex-col gap-4">
          {fields.map(field => (
            <div key={field.key} className="flex items-center justify-between">
              <label className="text-sm" style={{ color: 'var(--foreground)' }}>
                {field.label}
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={field.min}
                  max={field.max}
                  value={settings[field.key]}
                  onChange={e => updateSettings({ [field.key]: Math.max(field.min, Math.min(field.max, parseInt(e.target.value) || field.min)) })}
                  className="w-16 px-2 py-1 rounded-lg text-center text-sm outline-none"
                  style={{ background: 'var(--background)', color: 'var(--foreground)', border: '1px solid var(--border)' }}
                />
                {field.unit && (
                  <span className="text-xs" style={{ color: 'var(--muted)' }}>{field.unit}</span>
                )}
              </div>
            </div>
          ))}

          <div className="border-t my-2" style={{ borderColor: 'var(--border)' }} />

          {toggles.map(toggle => (
            <div key={toggle.key} className="flex items-center justify-between">
              <label className="text-sm" style={{ color: 'var(--foreground)' }}>
                {toggle.label}
              </label>
              <button
                onClick={() => updateSettings({ [toggle.key]: !settings[toggle.key] })}
                className="w-10 h-5 rounded-full relative transition-colors"
                style={{ background: settings[toggle.key] ? 'var(--accent)' : 'var(--border)' }}
              >
                <motion.div
                  className="w-4 h-4 rounded-full absolute top-0.5"
                  animate={{ left: settings[toggle.key] ? 22 : 2 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  style={{ background: 'white' }}
                />
              </button>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
