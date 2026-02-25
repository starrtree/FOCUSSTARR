'use client';

import { Task } from '@/lib/types';
import { useStore, formatDuration } from '@/lib/store';
import { cn } from '@/lib/utils';
import { Clock, Pencil } from 'lucide-react';
import { toast } from 'sonner';

interface TaskCardProps {
  task: Task;
  onEdit?: () => void;
}

export default function TaskCard({ task, onEdit }: TaskCardProps) {
  const { updateTask, setEditingTaskId, setModalOpen } = useStore();
  
  const isOverdue = task.due && task.due < new Date().toISOString().split('T')[0] && task.status !== 'done';
  const duration = formatDuration(task.durationHours, task.durationMinutes);

  const handleQuickMove = (newStatus: Task['status'], e: React.MouseEvent) => {
    e.stopPropagation();
    updateTask(task.id, { status: newStatus });
    toast.success(`Task moved to ${newStatus.toUpperCase()}`);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onEdit) {
      onEdit();
    } else {
      setEditingTaskId(task.id);
      setModalOpen(true);
    }
  };

  return (
    <div
      className="bg-white border-[2px] border-black rounded-lg p-3 cursor-grab transition-all duration-200 relative tactile-card"
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData('taskId', task.id);
      }}
    >
      {/* Priority Badge */}
      <span
        className={cn(
          "inline-block text-[9px] font-bold tracking-wider px-1.5 py-0.5 rounded-[3px] border-[1.5px] border-black mb-2 uppercase",
          task.priority === 'high' && "bg-[var(--brand-red)] text-white",
          task.priority === 'medium' && "bg-[var(--brand-yellow)] text-black",
          task.priority === 'low' && "bg-[var(--gray-200)] text-[var(--gray-600)]"
        )}
        style={{ fontFamily: 'var(--font-space-mono), monospace' }}
      >
        {task.priority}
      </span>

      {/* Title */}
      <div className="text-sm font-semibold leading-snug mb-2 text-black">
        {task.title}
      </div>

      {/* Meta */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Duration */}
        <div
          className="text-[10px] text-[var(--brand-blue)] font-bold flex items-center gap-1"
          style={{ fontFamily: 'var(--font-space-mono), monospace' }}
        >
          <Clock className="w-3 h-3" />
          {duration}
        </div>

        {/* Tags */}
        {task.tags.map((tag, i) => (
          <span
            key={i}
            className="text-[10px] px-1.5 py-0.5 rounded-[3px] border-[1.5px] border-black bg-[var(--off-white)]"
            style={{ fontFamily: 'var(--font-space-mono), monospace' }}
          >
            {tag}
          </span>
        ))}

        {/* Due Date */}
        {task.due && (
          <span
            className={cn(
              "text-[10px] text-[var(--gray-600)] ml-auto",
              isOverdue && "text-[var(--brand-red)] font-bold"
            )}
            style={{ fontFamily: 'var(--font-space-mono), monospace' }}
          >
            {task.due}
          </span>
        )}
      </div>

      {/* Quick Actions */}
      <div className="flex gap-1.5 mt-2.5 pt-2 border-t border-[var(--gray-200)] flex-wrap">
        {task.status !== 'done' && (
          <button
            onClick={(e) => handleQuickMove('done', e)}
            className="flex items-center gap-1 px-2 py-1 text-[9px] font-bold tracking-wider rounded-[5px] border-[1.5px] border-black cursor-pointer transition-all duration-150 bg-[#22c55e] text-white hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[2px_2px_0_#15803d] active:translate-x-0 active:translate-y-0 active:shadow-none"
            style={{ fontFamily: 'var(--font-space-mono), monospace' }}
          >
            ✓ DONE
          </button>
        )}
        {task.status === 'todo' && (
          <button
            onClick={(e) => handleQuickMove('doing', e)}
            className="flex items-center gap-1 px-2 py-1 text-[9px] font-bold tracking-wider rounded-[5px] border-[1.5px] border-black cursor-pointer transition-all duration-150 bg-[var(--brand-blue)] text-white hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[2px_2px_0_var(--brand-blue-dark)] active:translate-x-0 active:translate-y-0 active:shadow-none"
            style={{ fontFamily: 'var(--font-space-mono), monospace' }}
          >
            ⚡ START
          </button>
        )}
        {task.status === 'doing' && (
          <button
            onClick={(e) => handleQuickMove('review', e)}
            className="flex items-center gap-1 px-2 py-1 text-[9px] font-bold tracking-wider rounded-[5px] border-[1.5px] border-black cursor-pointer transition-all duration-150 bg-[var(--brand-yellow)] text-black hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[2px_2px_0_var(--brand-yellow-dark)] active:translate-x-0 active:translate-y-0 active:shadow-none"
            style={{ fontFamily: 'var(--font-space-mono), monospace' }}
          >
            REVIEW
          </button>
        )}
        <button
          onClick={handleEdit}
          className="flex items-center gap-1 px-2 py-1 text-[9px] font-bold tracking-wider rounded-[5px] border-[1.5px] border-black cursor-pointer transition-all duration-150 bg-white text-[var(--gray-600)] hover:bg-[var(--gray-100)] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[2px_2px_0_var(--gray-400)] active:translate-x-0 active:translate-y-0 active:shadow-none"
          style={{ fontFamily: 'var(--font-space-mono), monospace' }}
        >
          <Pencil className="w-3 h-3" /> EDIT
        </button>
      </div>
    </div>
  );
}
