'use client';

import { AnimatePresence } from 'framer-motion';
import { motion } from 'framer-motion';
import Navigation from '@/components/Navigation';
import Timer from '@/components/Timer';
import TaskList from '@/components/TaskList';
import SoundMixer from '@/components/SoundMixer';
import Stats from '@/components/Stats';
import Settings from '@/components/Settings';
import KeyboardShortcuts from '@/components/KeyboardShortcuts';
import { useStore } from '@/store/useStore';

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.2 } },
};

export default function Home() {
  const { activeTab, showSettings } = useStore();

  return (
    <main className="min-h-screen flex flex-col items-center p-4 pb-8">
      <div className="w-full max-w-xl">
        {/* Navigation */}
        <nav className="py-4 mb-6">
          <Navigation />
        </nav>

        {/* Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'timer' && (
            <motion.div key="timer" variants={pageVariants} initial="initial" animate="animate" exit="exit">
              <div className="flex flex-col gap-8">
                <Timer />
                <div>
                  <h2 className="text-sm font-medium mb-3 px-1" style={{ color: 'var(--muted)' }}>
                    🎵 Ambient Sounds
                  </h2>
                  <SoundMixer />
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'tasks' && (
            <motion.div key="tasks" variants={pageVariants} initial="initial" animate="animate" exit="exit">
              <h1 className="text-xl font-bold mb-4">Tasks</h1>
              <TaskList />
            </motion.div>
          )}

          {activeTab === 'stats' && (
            <motion.div key="stats" variants={pageVariants} initial="initial" animate="animate" exit="exit">
              <h1 className="text-xl font-bold mb-4">Statistics</h1>
              <Stats />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Settings Modal */}
        <AnimatePresence>
          {showSettings && <Settings />}
        </AnimatePresence>

        <KeyboardShortcuts />
      </div>
    </main>
  );
}
