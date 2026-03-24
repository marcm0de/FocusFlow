'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Check, Circle, Target } from 'lucide-react';
import { useStore } from '@/store/useStore';

export default function TaskList() {
  const { tasks, currentTaskId, addTask, toggleTask, deleteTask, setCurrentTask } = useStore();
  const [newTask, setNewTask] = useState('');

  const handleAdd = () => {
    if (!newTask.trim()) return;
    addTask(newTask.trim());
    setNewTask('');
  };

  const activeTasks = tasks.filter(t => !t.completed);
  const completedTasks = tasks.filter(t => t.completed);

  return (
    <div className="flex flex-col gap-4 w-full max-w-lg mx-auto">
      {/* Add task input */}
      <div className="flex gap-2">
        <input
          type="text"
          value={newTask}
          onChange={e => setNewTask(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleAdd()}
          placeholder="Add a task..."
          className="flex-1 px-4 py-3 rounded-xl text-sm outline-none"
          style={{ background: 'var(--card)', color: 'var(--foreground)', border: '1px solid var(--border)' }}
        />
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleAdd}
          className="p-3 rounded-xl"
          style={{ background: 'var(--accent)', color: '#0f172a' }}
        >
          <Plus size={20} />
        </motion.button>
      </div>

      {/* Active tasks */}
      <div className="flex flex-col gap-2">
        <AnimatePresence>
          {activeTasks.map(task => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="flex items-center gap-3 p-3 rounded-xl group"
              style={{
                background: 'var(--card)',
                border: currentTaskId === task.id ? '1px solid var(--accent)' : '1px solid transparent',
              }}
            >
              <button onClick={() => toggleTask(task.id)} style={{ color: 'var(--muted)' }}>
                <Circle size={20} />
              </button>
              
              <div className="flex-1 min-w-0">
                <p className="text-sm truncate" style={{ color: 'var(--foreground)' }}>{task.title}</p>
                {task.focusMinutes > 0 && (
                  <p className="text-xs" style={{ color: 'var(--muted)' }}>
                    {task.focusMinutes} min · {task.sessionCount} sessions
                  </p>
                )}
              </div>

              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => setCurrentTask(currentTaskId === task.id ? null : task.id)}
                  className="p-1.5 rounded-lg transition-colors"
                  style={{
                    color: currentTaskId === task.id ? 'var(--accent)' : 'var(--muted)',
                  }}
                  title={currentTaskId === task.id ? 'Unlink from timer' : 'Link to timer'}
                >
                  <Target size={16} />
                </button>
                <button
                  onClick={() => deleteTask(task.id)}
                  className="p-1.5 rounded-lg"
                  style={{ color: 'var(--danger)' }}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {activeTasks.length === 0 && (
          <p className="text-center py-8 text-sm" style={{ color: 'var(--muted)' }}>
            No tasks yet. Add one to get started!
          </p>
        )}
      </div>

      {/* Completed tasks */}
      {completedTasks.length > 0 && (
        <div>
          <p className="text-xs font-medium mb-2" style={{ color: 'var(--muted)' }}>
            Completed ({completedTasks.length})
          </p>
          <div className="flex flex-col gap-1">
            {completedTasks.map(task => (
              <div
                key={task.id}
                className="flex items-center gap-3 p-2 rounded-lg group"
                style={{ background: 'var(--card)', opacity: 0.6 }}
              >
                <button onClick={() => toggleTask(task.id)} style={{ color: 'var(--success)' }}>
                  <Check size={18} />
                </button>
                <span className="text-sm line-through flex-1" style={{ color: 'var(--muted)' }}>
                  {task.title}
                </span>
                <button
                  onClick={() => deleteTask(task.id)}
                  className="p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ color: 'var(--danger)' }}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
