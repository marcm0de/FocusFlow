'use client';

import { motion } from 'framer-motion';
import { Volume2, VolumeX } from 'lucide-react';
import { useStore } from '@/store/useStore';

export default function SoundMixer() {
  const { sounds, toggleSound, setSoundVolume } = useStore();

  return (
    <div className="w-full max-w-sm mx-auto">
      <div className="flex flex-col gap-3">
        {sounds.map(sound => (
          <div
            key={sound.id}
            className="flex items-center gap-3 p-3 rounded-xl"
            style={{ background: 'var(--card)' }}
          >
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => toggleSound(sound.id)}
              className="flex items-center justify-center w-10 h-10 rounded-lg text-xl"
              style={{
                background: sound.playing ? 'var(--accent)' : 'var(--border)',
                opacity: sound.playing ? 1 : 0.6,
              }}
            >
              {sound.icon}
            </motion.button>

            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm" style={{ color: sound.playing ? 'var(--foreground)' : 'var(--muted)' }}>
                  {sound.name}
                </span>
                {sound.playing ? (
                  <Volume2 size={14} style={{ color: 'var(--accent)' }} />
                ) : (
                  <VolumeX size={14} style={{ color: 'var(--muted)' }} />
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
          </div>
        ))}
      </div>
      <p className="text-xs text-center mt-3" style={{ color: 'var(--muted)' }}>
        🎵 Ambient sounds use placeholder audio. Connect real audio files for full experience.
      </p>
    </div>
  );
}
