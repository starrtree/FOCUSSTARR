'use client';

import { useStore, formatDuration } from '@/lib/store';
import { Task } from '@/lib/types';
import { toast } from 'sonner';

interface UpNextCardProps {
  task: Task;
  onStart: () => void;
  onEdit: () => void;
}

function UpNextCard({ task, onStart, onEdit }: UpNextCardProps) {
  const duration = formatDuration(task.durationHours, task.durationMinutes);

  return (
    <div
      onClick={onEdit}
      className="bg-white border-[2px] border-black rounded-lg p-5 flex items-center justify-between shadow-[4px_4px_0_black] cursor-pointer transition-all duration-200 hover:translate-x-[-3px] hover:translate-y-[-3px] hover:shadow-[6px_6px_0_black] hover:border-[var(--brand-blue)] group"
    >
      <div>
        <div className="text-lg font-bold group-hover:text-[var(--brand-blue)] transition-colors duration-150">{task.title}</div>
        <div
          className="text-xs text-[var(--gray-600)] mt-1"
          style={{ fontFamily: 'var(--font-space-mono), monospace' }}
        >
          {task.project} • {task.priority.toUpperCase()} • {duration}
        </div>
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onStart();
        }}
        className="px-3 py-1.5 bg-[var(--brand-red)] text-white text-xs font-bold tracking-wider border-[2px] border-black rounded-lg cursor-pointer transition-all duration-150 shadow-[3px_3px_0_var(--brand-red-dark)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[5px_5px_0_var(--brand-red-dark)] active:translate-x-0 active:translate-y-0 active:shadow-none"
        style={{ fontFamily: 'var(--font-space-mono), monospace' }}
      >
        START
      </button>
    </div>
  );
}

export default function UpNextQueue() {
  const { tasks, updateTask, setEditingTaskId, setModalOpen, setCurrentView } = useStore();

  const priorityOrder = { high: 3, medium: 2, low: 1 };
  const nextTasks = tasks
    .filter(t => t.status === 'todo')
    .sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority])
    .slice(0, 2);

  const handleStart = (taskId: string) => {
    updateTask(taskId, { status: 'doing' });
    toast.success('Task started! ⚡');
  };

  const handleEdit = (taskId: string) => {
    setEditingTaskId(taskId);
    setModalOpen(true);
  };

  const handleViewAllTasks = () => {
    setCurrentView('kanban');
  };

  return (
    <>
      <div className="flex justify-between items-center mb-5">
        <h3
          className="text-xl tracking-wide"
          style={{ fontFamily: 'Bebas Neue, sans-serif' }}
        >
          UP NEXT QUEUE
        </h3>
        <button
          onClick={handleViewAllTasks}
          className="px-4 py-2 bg-white text-[var(--gray-600)] text-xs font-bold tracking-wider border-[2px] border-black rounded-lg cursor-pointer transition-all duration-150 hover:bg-[var(--brand-yellow)] hover:text-black shadow-[2px_2px_0_black] hover:shadow-[3px_3px_0_black] hover:translate-x-[-1px] hover:translate-y-[-1px]"
          style={{ fontFamily: 'var(--font-space-mono), monospace' }}
        >
          VIEW ALL TASKS
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
        {nextTasks.length === 0 ? (
          <div
            className="col-span-2 text-center text-[var(--gray-400)] p-5 bg-white border-[2px] border-black rounded-lg shadow-[4px_4px_0_black]"
            style={{ fontFamily: 'var(--font-space-mono), monospace' }}
          >
            🎉 QUEUE EMPTY. GREAT JOB!
          </div>
        ) : (
          nextTasks.map(task => (
            <UpNextCard
              key={task.id}
              task={task}
              onStart={() => handleStart(task.id)}
              onEdit={() => handleEdit(task.id)}
            />
          ))
        )}
      </div>
    </>
  );
}
