'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { useStore, formatDuration } from '@/lib/store';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { Plus, Trash2, ExternalLink, Check, FolderOpen } from 'lucide-react';

export default function FocusZone() {
  const { 
    tasks, 
    updateTask, 
    toggleSubtask, 
    addSubtask, 
    updateSubtask, 
    deleteSubtask,
    setEditingTaskId, 
    setModalOpen, 
    setCurrentView,
    setSelectedProjectId,
    projects,
    theme
  } = useStore();
  
  const focusTask = tasks.find(t => t.status === 'doing');

  // Local state for editing
  const [editingNotes, setEditingNotes] = useState(false);
  const [editingSubtaskId, setEditingSubtaskId] = useState<string | null>(null);
  const [editingSubtaskText, setEditingSubtaskText] = useState('');
  const [newSubtaskText, setNewSubtaskText] = useState('');
  const [isAddingSubtask, setIsAddingSubtask] = useState(false);

  const subtaskInputRef = useRef<HTMLInputElement>(null);
  const newSubtaskRef = useRef<HTMLInputElement>(null);

  // Focus input when adding subtask
  useEffect(() => {
    if (isAddingSubtask && newSubtaskRef.current) {
      newSubtaskRef.current.focus();
    }
  }, [isAddingSubtask]);

  // Focus input when editing subtask
  useEffect(() => {
    if (editingSubtaskId && subtaskInputRef.current) {
      subtaskInputRef.current.focus();
      subtaskInputRef.current.select();
    }
  }, [editingSubtaskId]);

  const handleCompleteMission = () => {
    if (focusTask) {
      updateTask(focusTask.id, { status: 'done', progress: 100 });
      toast.success('Mission completed! 🎉');
    }
  };

  const handleOpenDetails = () => {
    if (focusTask) {
      setEditingTaskId(focusTask.id);
      setModalOpen(true);
    }
  };

  const handleSelectTask = () => {
    setCurrentView('kanban');
  };

  const handleProjectClick = () => {
    if (focusTask) {
      const project = projects.find(p => p.name === focusTask.project);
      if (project) {
        setSelectedProjectId(project.id);
        setCurrentView('projects');
      }
    }
  };

  // Notes editing - use the task notes directly
  const handleNotesBlur = (e: React.FocusEvent<HTMLDivElement>) => {
    setEditingNotes(false);
    const newNotes = e.currentTarget.textContent || '';
    if (focusTask && newNotes !== focusTask.notes) {
      updateTask(focusTask.id, { notes: newNotes });
      toast.success('Notes saved');
    }
  };

  // Subtask editing
  const handleSubtaskEdit = (subtaskId: string, currentText: string) => {
    setEditingSubtaskId(subtaskId);
    setEditingSubtaskText(currentText);
  };

  const handleSubtaskSave = () => {
    if (focusTask && editingSubtaskId) {
      if (editingSubtaskText.trim()) {
        updateSubtask(focusTask.id, editingSubtaskId, editingSubtaskText.trim());
      }
      setEditingSubtaskId(null);
      setEditingSubtaskText('');
    }
  };

  const handleSubtaskKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubtaskSave();
    } else if (e.key === 'Escape') {
      setEditingSubtaskId(null);
      setEditingSubtaskText('');
    }
  };

  const handleSubtaskDelete = (subtaskId: string) => {
    if (focusTask) {
      deleteSubtask(focusTask.id, subtaskId);
      toast.success('Subtask deleted');
    }
  };

  // Add new subtask
  const handleNewSubtaskSave = () => {
    if (focusTask && newSubtaskText.trim()) {
      addSubtask(focusTask.id, newSubtaskText.trim());
      setNewSubtaskText('');
      toast.success('Subtask added');
    }
    setIsAddingSubtask(false);
  };

  const handleNewSubtaskKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleNewSubtaskSave();
    } else if (e.key === 'Escape') {
      setIsAddingSubtask(false);
      setNewSubtaskText('');
    }
  };

  // Calculate progress based on subtasks
  const progress = useMemo(() => {
    if (!focusTask) return 0;
    if (focusTask.subtasks && focusTask.subtasks.length > 0) {
      const done = focusTask.subtasks.filter(s => s.done).length;
      return Math.round((done / focusTask.subtasks.length) * 100);
    }
    return focusTask.progress || 0;
  }, [focusTask]);

  const isDark = theme === 'dark';

  // Calculate glow color based on progress - yellow in light mode, red in dark mode
  const getGlowStyle = () => {
    if (progress === 0) return {};
    
    const intensity = Math.min(progress / 100, 1);
    
    if (isDark) {
      // Red glow in dark mode
      const alpha = 0.7 + (intensity * 0.3);
      return {
        boxShadow: `0 0 ${15 + progress * 0.4}px rgba(237, 28, 36, ${alpha}), 0 0 ${30 + progress * 0.6}px rgba(237, 28, 36, ${alpha * 0.6})`,
      };
    } else {
      // Yellow glow in light mode (smaller radius)
      const alpha = 0.5 + (intensity * 0.4);
      return {
        boxShadow: `0 0 ${8 + progress * 0.15}px rgba(255, 209, 0, ${alpha}), 0 0 ${15 + progress * 0.25}px rgba(255, 209, 0, ${alpha * 0.5})`,
      };
    }
  };

  if (!focusTask) {
    return (
      <div
        className="bg-[var(--brand-yellow)] border-[2px] border-black rounded-lg p-8 md:p-16 mb-6 md:mb-8 relative shadow-[4px_4px_0_black] md:shadow-[8px_8px_0_black] transition-all duration-200 hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0_black] md:hover:shadow-[10px_10px_0_black] text-center"
      >
        <div
          className="text-[40px] md:text-[50px] leading-none mb-1"
          style={{ animation: 'pulse 2s infinite ease-in-out' }}
        >
          ★
        </div>
        <div
          className="text-[9px] md:text-[10px] tracking-[1.5px] text-[var(--brand-blue-dark)] uppercase mb-2.5 font-bold"
          style={{ fontFamily: 'var(--font-space-mono), monospace' }}
        >
          CURRENT MISSION
        </div>
        <div
          className="text-[28px] md:text-[40px] text-[var(--gray-800)] mb-4 md:mb-5 leading-tight"
          style={{ fontFamily: 'Bebas Neue, sans-serif' }}
        >
          NO ACTIVE MISSION
        </div>
        <div className="text-sm md:text-base text-[var(--brand-blue-dark)] mb-5">
          You are free. Select a task below to begin focus mode.
        </div>
        <button
          onClick={handleSelectTask}
          className="px-4 py-2 bg-[var(--brand-red)] text-white text-xs font-bold tracking-wider border-[2px] border-black rounded-lg cursor-pointer transition-all duration-150 shadow-[4px_4px_0_var(--brand-red-dark)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0_var(--brand-red-dark)] active:translate-x-0 active:translate-y-0 active:shadow-none btn-shine"
          style={{ fontFamily: 'var(--font-space-mono), monospace' }}
        >
          SELECT A TASK
        </button>
      </div>
    );
  }

  const duration = formatDuration(focusTask.durationHours, focusTask.durationMinutes);

  return (
    <div
      className={cn(
        "bg-[var(--brand-yellow)] border-[2px] border-black rounded-lg p-4 md:p-8 mb-6 md:mb-8 relative transition-all duration-500 grid grid-cols-1 lg:grid-cols-[1fr_1.5fr_1fr] gap-6 md:gap-8",
        progress === 0 && "shadow-[4px_4px_0_black] md:shadow-[8px_8px_0_black]"
      )}
      style={{
        ...getGlowStyle(),
      }}
    >
      {/* LEFT: Notes */}
      <div className="lg:border-r-[2px] lg:border-dashed lg:border-black/10 lg:pr-5 flex flex-col">
        <div
          className="text-[10px] tracking-[1.5px] text-[var(--brand-blue-dark)] uppercase mb-2 font-bold"
          style={{ fontFamily: 'var(--font-space-mono), monospace' }}
        >
          NOTES (click to edit)
        </div>
        {/* Key prop causes React to remount when task ID changes, resetting content */}
        <div
          key={focusTask.id}
          contentEditable
          suppressContentEditableWarning
          onFocus={() => setEditingNotes(true)}
          onBlur={handleNotesBlur}
          className={cn(
            "flex-1 min-h-[100px] lg:min-h-0 border-[1.5px] border-black/10 rounded-lg p-3 text-[11px] whitespace-pre-wrap leading-relaxed outline-none cursor-text",
            isDark 
              ? "bg-black/20 text-[#1a1a1a]" 
              : "bg-white/40 text-[var(--gray-800)]",
            editingNotes && "border-[2px] border-dashed border-[var(--brand-blue)] bg-[rgba(0,82,180,0.05)]"
          )}
          style={{ fontFamily: 'var(--font-space-mono), monospace' }}
        >
          {focusTask.notes || 'Click here to add notes...'}
        </div>
      </div>

      {/* CENTER: Main */}
      <div className="flex flex-col items-center text-center justify-center">
        <div
          className="text-[40px] md:text-[50px] leading-none mb-1"
          style={{ animation: 'pulse 2s infinite ease-in-out' }}
        >
          ★
        </div>
        <div
          className="text-[24px] md:text-[32px] leading-tight text-black mb-2 md:mb-2.5"
          style={{ fontFamily: 'Bebas Neue, sans-serif' }}
        >
          {focusTask.title}
        </div>

        <div className="flex items-center gap-2 md:gap-2.5 text-[10px] md:text-xs text-[var(--brand-blue-dark)] mb-3 md:mb-4 flex-wrap justify-center" style={{ fontFamily: 'var(--font-space-mono), monospace' }}>
          <span className={cn(
            "px-2 py-0.5 rounded border border-black font-bold",
            isDark ? "bg-[var(--brand-blue)] text-white" : "bg-white"
          )}>
            ⏱ {duration}
          </span>
          <button
            onClick={handleProjectClick}
            className={cn(
              "flex items-center gap-1 px-2 py-0.5 rounded border border-black font-bold transition-all hover:scale-105 cursor-pointer",
              isDark ? "bg-[var(--brand-blue)] text-white hover:bg-[var(--brand-blue-light)]" : "bg-white hover:bg-[var(--gray-100)]"
            )}
          >
            <FolderOpen className="w-3 h-3" />
            {focusTask.project}
          </button>
        </div>

        {/* Progress Bar */}
        <div className="w-full max-w-md h-3 bg-black/10 rounded-md border-[1.5px] border-black overflow-hidden mb-4 md:mb-5 relative">
          <div
            className="h-full bg-gradient-to-r from-[var(--brand-blue)] to-[var(--brand-yellow)] transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[9px] font-bold text-black"
            style={{ 
              fontFamily: 'var(--font-space-mono), monospace',
              textShadow: '0 0 4px white'
            }}
          >
            {progress}%
          </div>
        </div>

        <div className="flex flex-col items-center gap-2 md:gap-2.5">
          <div className="flex gap-2">
            <button
              onClick={handleCompleteMission}
              className="px-5 md:px-6 py-2 md:py-2.5 bg-[var(--brand-red)] text-white text-xs md:text-sm font-bold tracking-wider border-[2px] border-black rounded-lg cursor-pointer transition-all duration-150 shadow-[4px_4px_0_var(--brand-red-dark)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0_var(--brand-red-dark)] active:translate-x-0 active:translate-y-0 active:shadow-none btn-shine"
              style={{ fontFamily: 'var(--font-space-mono), monospace' }}
            >
              ★ COMPLETE MISSION
            </button>
          </div>
          <button
            onClick={handleOpenDetails}
            className={cn(
              "px-4 py-2 text-[10px] md:text-[11px] font-bold tracking-wider border-[2px] border-black rounded-lg cursor-pointer transition-all flex items-center gap-1.5 shadow-[2px_2px_0_black] hover:shadow-[3px_3px_0_black] hover:translate-x-[-1px] hover:translate-y-[-1px]",
              isDark 
                ? "bg-[var(--brand-blue)] text-white hover:bg-[var(--brand-blue-light)]" 
                : "bg-white text-[var(--brand-blue)] hover:bg-[var(--gray-100)]"
            )}
            style={{ fontFamily: 'var(--font-space-mono), monospace' }}
          >
            <ExternalLink className="w-3 h-3" /> OPEN DETAILS
          </button>
        </div>
      </div>

      {/* RIGHT: Subtasks */}
      <div className="lg:border-l-[2px] lg:border-dashed lg:border-black/10 lg:pl-5">
        <div
          className="text-[10px] tracking-[1.5px] text-[var(--brand-blue-dark)] uppercase mb-2 font-bold"
          style={{ fontFamily: 'var(--font-space-mono), monospace' }}
        >
          SUBTASKS
        </div>
        <div className="flex flex-col gap-1.5 max-h-[200px] overflow-y-auto">
          {focusTask.subtasks && focusTask.subtasks.length > 0 ? (
            focusTask.subtasks.map((subtask) => (
              <div
                key={subtask.id}
                className={cn(
                  "group flex items-center gap-2 text-[11px] select-none p-1.5 rounded transition-all duration-150",
                  editingSubtaskId === subtask.id ? "bg-white border-[2px] border-dashed border-[var(--brand-blue)]" : "hover:bg-black/5"
                )}
                style={{ fontFamily: 'var(--font-space-mono), monospace' }}
              >
                {/* Checkbox */}
                <div
                  onClick={() => toggleSubtask(focusTask.id, subtask.id)}
                  className={cn(
                    "w-4 h-4 border-[2px] border-black rounded-[3px] flex items-center justify-center flex-shrink-0 bg-white cursor-pointer transition-all duration-150",
                    subtask.done && "bg-[var(--brand-blue)] border-[var(--brand-blue)]"
                  )}
                >
                  {subtask.done && (
                    <Check className="w-2.5 h-2.5 text-white" style={{ animation: 'checkmark 0.3s var(--ease-bounce)' }} />
                  )}
                </div>
                
                {/* Text */}
                {editingSubtaskId === subtask.id ? (
                  <input
                    ref={subtaskInputRef}
                    type="text"
                    value={editingSubtaskText}
                    onChange={(e) => setEditingSubtaskText(e.target.value)}
                    onBlur={handleSubtaskSave}
                    onKeyDown={handleSubtaskKeyDown}
                    className={cn(
                      "flex-1 bg-transparent outline-none border-none",
                      isDark && "text-white"
                    )}
                  />
                ) : (
                  <span
                    onClick={() => handleSubtaskEdit(subtask.id, subtask.text)}
                    className={cn(
                      "flex-1 leading-relaxed cursor-text",
                      subtask.done ? "text-[var(--gray-400)] line-through" : isDark ? "text-[#2a2a25]" : "text-inherit"
                    )}
                  >
                    {subtask.text}
                  </span>
                )}

                {/* Delete button */}
                <button
                  onClick={() => handleSubtaskDelete(subtask.id)}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:bg-[var(--brand-red)] hover:text-white rounded transition-all duration-150"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))
          ) : (
            !isAddingSubtask && (
              <div
                className={cn(
                  "text-[11px] text-center py-4",
                  isDark ? "text-[#2a2a25]" : "text-[var(--gray-600)]"
                )}
                style={{ fontFamily: 'var(--font-space-mono), monospace' }}
              >
                No subtasks yet
              </div>
            )
          )}

          {/* Add new subtask input */}
          {isAddingSubtask && (
            <div className={cn(
              "flex items-center gap-2 p-1.5 border-[2px] border-dashed border-[var(--brand-blue)] rounded",
              isDark && "bg-[#2a2a25]"
            )}>
              <div className="w-4 h-4 border-[2px] border-black rounded-[3px] bg-white flex-shrink-0" />
              <input
                ref={newSubtaskRef}
                type="text"
                value={newSubtaskText}
                onChange={(e) => setNewSubtaskText(e.target.value)}
                onBlur={handleNewSubtaskSave}
                onKeyDown={handleNewSubtaskKeyDown}
                placeholder="Enter subtask..."
                className={cn(
                  "flex-1 bg-transparent outline-none border-none text-[11px]",
                  isDark ? "text-[#1a1a1a] placeholder:text-[#5a5a55]" : "text-inherit"
                )}
                style={{ fontFamily: 'var(--font-space-mono), monospace' }}
              />
            </div>
          )}

          {/* Add subtask button */}
          <button
            onClick={() => setIsAddingSubtask(true)}
            className="flex items-center gap-1.5 text-[10px] text-[var(--brand-blue)] font-bold p-2 rounded hover:bg-black/5 transition-all duration-150 mt-1"
            style={{ fontFamily: 'var(--font-space-mono), monospace' }}
          >
            <Plus className="w-3 h-3" /> ADD SUBTASK
          </button>
        </div>
      </div>
    </div>
  );
}
