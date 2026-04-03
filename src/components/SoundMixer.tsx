'use client';

import { motion } from 'framer-motion';
import { Volume2, VolumeX } from 'lucide-react';
import { useStore } from '@/store/useStore';

export default function SoundMixer() {
  const { sounds, toggleSound, setSoundVolume } = useStore();

  const activeSounds = sounds.filter(s => s.playing).length;

  return (
    <div className="w-full max-w-lg mx-auto">
      {activeSounds > 0 && (
        <div className="text-center mb-3">
          <span className="text-xs px-2.5 py-1 rounded-full" style={{ background: 'var(--card)', color: 'var(--accent)' }}>
            🎧 {activeSounds} sound{activeSounds > 1 ? 's' : ''} playing
          </span>
        </div>
      )}
      <div className="grid grid-cols-2 gap-2">
        {sounds.map(sound => (
          <motion.div
            key={sound.id}
            whileHover={{ scale: 1.02 }}
            className="flex items-center gap-3 p-3 rounded-xl transition-all"
            style={{
              background: 'var(--card)',
              border: sound.playing ? '1px solid var(--accent)' : '1px solid transparent',
            }}
          >
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => toggleSound(sound.id)}
              className="flex items-center justify-center w-10 h-10 rounded-lg text-xl shrink-0"
              style={{
                background: sound.playing ? 'var(--accent)' : 'var(--border)',
                opacity: sound.playing ? 1 : 0.6,
              }}
            >
              {sound.icon}
            </motion.button>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs truncate" style={{ color: sound.playing ? 'var(--foreground)' : 'var(--muted)' }}>
                  {sound.name}
                </span>
                {sound.playing ? (
                  <Volume2 size={12} style={{ color: 'var(--accent)' }} />
                ) : (
                  <VolumeX size={12} style={{ color: 'var(--muted)' }} />
                )}
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={sound.volume}
                onChange={e => setSoundVolume(sound.id, parseFloat(e.target.value))}
                className="w-full"
                style={{ opacity: sound.playing ? 1 : 0.4 }}
              />
            </div>
          </motion.div>
        ))}
      </div>
      <p className="text-xs text-center mt-3" style={{ color: 'var(--muted)', opacity: 0.5 }}>
        🎵 Placeholder audio — connect real sound files via <code style={{ fontSize: '10px' }}>/public/sounds/</code>
      </p>
    </div>
  );
}
