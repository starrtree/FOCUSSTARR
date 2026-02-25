'use client';

import { useStore } from '@/lib/store';
import { Task } from '@/lib/types';
import TaskCard from './TaskCard';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface KanbanColumnProps {
  id: Task['status'];
  label: string;
  bgClass: string;
  darkBgClass: string;
  countBgClass: string;
  tasks: Task[];
  onDrop: (taskId: string, status: Task['status']) => void;
  bodyBgClass: string;
}

function KanbanColumn({ id, label, bgClass, darkBgClass, countBgClass, tasks, onDrop, bodyBgClass }: KanbanColumnProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const { theme } = useStore();
  const isDark = theme === 'dark';

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const taskId = e.dataTransfer.getData('taskId');
    if (taskId) {
      onDrop(taskId, id);
    }
  };

  return (
    <div
      className={cn(
        "bg-white dark:bg-[#1a1a1a] border-[2px] border-black dark:border-[#3a3a3a] rounded-lg flex flex-col transition-all duration-200",
        isDragOver && "border-[var(--brand-blue)] border-[3px] bg-blue-50/30"
      )}
    >
      {/* Header */}
      <div className={cn(
        "px-3 py-2.5 border-b-[2px] border-black dark:border-[#3a3a3a] flex items-center justify-between sticky top-0",
        isDark ? darkBgClass : bgClass
      )}>
        <h4
          className="text-sm tracking-wide text-white"
          style={{ fontFamily: 'Bebas Neue, sans-serif' }}
        >
          {label}
        </h4>
        <span
          className={cn(
            "text-[10px] px-2 py-0.5 rounded-full border-[1.5px] border-black font-bold",
            countBgClass
          )}
          style={{ fontFamily: 'var(--font-space-mono), monospace' }}
        >
          {tasks.length}
        </span>
      </div>

      {/* Body */}
      <div
        className={cn(
          "p-2 overflow-y-auto flex flex-col gap-2 min-h-[150px] max-h-[400px]",
          bodyBgClass,
          isDragOver && "bg-blue-50/20"
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {tasks.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-[var(--gray-400)] text-[10px] py-4" style={{ fontFamily: 'var(--font-space-mono), monospace' }}>
            Drop tasks here
          </div>
        ) : (
          tasks.map(task => <TaskCard key={task.id} task={task} />)
        )}
      </div>
    </div>
  );
}

export default function KanbanBoard() {
  const { tasks, updateTask } = useStore();

  const activeTasks = tasks.filter(t => !t.isArchived);

  const handleDrop = (taskId: string, newStatus: Task['status']) => {
    updateTask(taskId, { status: newStatus });
  };

  const columns: { id: Task['status']; label: string; bgClass: string; darkBgClass: string; countBgClass: string; bodyBgClass: string }[] = [
    { 
      id: 'todo', 
      label: 'TO DO', 
      bgClass: 'bg-[var(--gray-200)]', 
      darkBgClass: 'bg-[#2a2a2a]',
      countBgClass: 'bg-[var(--gray-200)] dark:bg-[#3a3a3a] dark:text-white', 
      bodyBgClass: 'bg-[var(--gray-50)] dark:bg-[#1a1a1a]' 
    },
    { 
      id: 'doing', 
      label: 'IN PROGRESS', 
      bgClass: 'bg-[#dbeafe]', 
      darkBgClass: 'bg-[#1e3a5f]',
      countBgClass: 'bg-[var(--brand-blue)] text-white', 
      bodyBgClass: 'bg-[#eff6ff] dark:bg-[#0f1e30]' 
    },
    { 
      id: 'review', 
      label: 'IN REVIEW', 
      bgClass: 'bg-[#fef9c3]', 
      darkBgClass: 'bg-[#5c4a00]',
      countBgClass: 'bg-[var(--brand-yellow)]', 
      bodyBgClass: 'bg-[#fefce8] dark:bg-[#1a1500]' 
    },
    { 
      id: 'done', 
      label: 'DONE', 
      bgClass: 'bg-[#dcfce7]', 
      darkBgClass: 'bg-[#14532d]',
      countBgClass: 'bg-[#22c55e] text-white', 
      bodyBgClass: 'bg-[#f0fdf4] dark:bg-[#052e16]' 
    },
  ];

  return (
    <div className="space-y-4">
      {/* Top Row: TO DO | IN PROGRESS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {columns.slice(0, 2).map(col => (
          <KanbanColumn
            key={col.id}
            {...col}
            tasks={activeTasks.filter(t => t.status === col.id)}
            onDrop={handleDrop}
          />
        ))}
      </div>
      
      {/* Bottom Row: IN REVIEW | DONE */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {columns.slice(2, 4).map(col => (
          <KanbanColumn
            key={col.id}
            {...col}
            tasks={activeTasks.filter(t => t.status === col.id)}
            onDrop={handleDrop}
          />
        ))}
      </div>
    </div>
  );
}
