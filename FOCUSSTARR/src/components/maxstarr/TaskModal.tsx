'use client';

import { useState, useMemo } from 'react';
import { useStore, createNewTask, formatDuration } from '@/lib/store';
import { Task } from '@/lib/types';
import { X, Trash2, Plus, ChevronUp, ChevronDown, Archive, RotateCcw, Calendar, HelpCircle } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export default function TaskModal() {
  const { isModalOpen, setModalOpen, editingTaskId, tasks, projects, tags: allTags, addTask, updateTask, deleteTask, archiveTask, selectedProjectId, autoSetProjectForTask, setAutoSetProjectForTask } = useStore();
  
  // Find the task being edited
  const editingTask = useMemo(() => {
    if (editingTaskId) {
      return tasks.find(t => t.id === editingTaskId);
    }
    return null;
  }, [editingTaskId, tasks]);

  // Get the current project name from selectedProjectId or autoSetProjectForTask
  const currentProjectName = useMemo(() => {
    // First check autoSetProjectForTask (set from project view)
    if (autoSetProjectForTask) {
      const project = projects.find(p => p.id === autoSetProjectForTask);
      return project?.name || 'General';
    }
    // Then check selectedProjectId
    if (selectedProjectId) {
      const project = projects.find(p => p.id === selectedProjectId);
      return project?.name || 'General';
    }
    return 'General';
  }, [autoSetProjectForTask, selectedProjectId, projects]);

  // Form state
  const [formData, setFormData] = useState<Partial<Task>>(() => {
    if (editingTask) {
      return {
        title: editingTask.title,
        project: editingTask.project,
        priority: editingTask.priority,
        status: editingTask.status,
        durationHours: editingTask.durationHours,
        durationMinutes: editingTask.durationMinutes,
        due: editingTask.due,
        tags: editingTask.tags,
        notes: editingTask.notes,
        subtasks: editingTask.subtasks,
      };
    }
    return {
      title: '',
      project: currentProjectName,
      priority: 'medium',
      status: 'todo',
      durationHours: 0,
      durationMinutes: 30,
      due: '',
      tags: [],
      notes: '',
      subtasks: [],
    };
  });

  const [newSubtaskText, setNewSubtaskText] = useState('');
  const [tagInput, setTagInput] = useState('');

  // Reset form when modal opens with new task data
  const [lastEditingId, setLastEditingId] = useState<string | null>(null);
  
  // Handle form reset when editing task changes
  if (isModalOpen && editingTaskId !== lastEditingId) {
    setLastEditingId(editingTaskId);
    if (editingTask) {
      setFormData({
        title: editingTask.title,
        project: editingTask.project,
        priority: editingTask.priority,
        status: editingTask.status,
        durationHours: editingTask.durationHours,
        durationMinutes: editingTask.durationMinutes,
        due: editingTask.due,
        tags: [...editingTask.tags],
        notes: editingTask.notes,
        subtasks: [...editingTask.subtasks],
      });
      setNewSubtaskText('');
      setTagInput('');
    } else {
      setFormData({
        title: '',
        project: currentProjectName,
        priority: 'medium',
        status: 'todo',
        durationHours: 0,
        durationMinutes: 30,
        due: '',
        tags: [],
        notes: '',
        subtasks: [],
      });
      setNewSubtaskText('');
      setTagInput('');
    }
  }

  const handleClose = () => {
    setModalOpen(false);
    setAutoSetProjectForTask(null);
    setLastEditingId(null);
    setFormData({
      title: '',
      project: 'General',
      priority: 'medium',
      status: 'todo',
      durationHours: 0,
      durationMinutes: 30,
      due: '',
      tags: [],
      notes: '',
      subtasks: [],
    });
    setNewSubtaskText('');
    setTagInput('');
  };

  const handleSave = () => {
    if (!formData.title?.trim()) {
      toast.error('Task name is required');
      return;
    }

    // Parse subtasks from the list
    const subtasks = (formData.subtasks || []).map(st => ({
      id: st.id || Math.random().toString(36).substring(2, 9),
      text: st.text,
      done: st.done || false,
    }));

    if (editingTaskId) {
      updateTask(editingTaskId, {
        ...formData,
        subtasks,
      });
      toast.success('Task updated');
    } else {
      const newTask = createNewTask({
        ...formData,
        subtasks,
      });
      addTask(newTask);
      toast.success('Task created');
    }
    handleClose();
  };

  const handleDelete = () => {
    if (editingTaskId && confirm('Delete this task?')) {
      deleteTask(editingTaskId);
      handleClose();
      toast.success('Task deleted');
    }
  };

  const handleSacrifice = () => {
    if (editingTaskId) {
      archiveTask(editingTaskId);
      handleClose();
      toast.success('Task sacrificed');
    }
  };

  // Duration controls
  const adjustDuration = (field: 'durationHours' | 'durationMinutes', delta: number) => {
    const currentValue = formData[field] || 0;
    let newValue = currentValue + delta;
    
    if (field === 'durationMinutes') {
      if (newValue >= 60) {
        newValue = 0;
        setFormData(prev => ({
          ...prev,
          durationHours: (prev.durationHours || 0) + 1,
          durationMinutes: newValue,
        }));
        return;
      } else if (newValue < 0) {
        newValue = 59;
        setFormData(prev => ({
          ...prev,
          durationHours: Math.max(0, (prev.durationHours || 0) - 1),
          durationMinutes: newValue,
        }));
        return;
      }
    } else {
      newValue = Math.max(0, newValue);
    }
    
    setFormData({ ...formData, [field]: newValue });
  };

  // Tags management
  const handleAddTag = (tag: string) => {
    if (!formData.tags?.includes(tag)) {
      setFormData({ ...formData, tags: [...(formData.tags || []), tag] });
    }
  };

  const handleRemoveTag = (tag: string) => {
    setFormData({ ...formData, tags: formData.tags?.filter(t => t !== tag) || [] });
  };

  const handleAddCustomTag = () => {
    const tag = tagInput.trim();
    if (tag && !formData.tags?.includes(tag) && !allTags.includes(tag)) {
      handleAddTag(tag);
    }
    setTagInput('');
  };

  // Subtasks management
  const handleAddSubtask = () => {
    if (newSubtaskText.trim()) {
      const newSubtask = {
        id: Math.random().toString(36).substring(2, 9),
        text: newSubtaskText.trim(),
        done: false,
      };
      setFormData({ 
        ...formData, 
        subtasks: [...(formData.subtasks || []), newSubtask] 
      });
      setNewSubtaskText('');
    }
  };

  const handleRemoveSubtask = (id: string) => {
    setFormData({ 
      ...formData, 
      subtasks: formData.subtasks?.filter(st => st.id !== id) || [] 
    });
  };

  const handleToggleSubtask = (id: string) => {
    setFormData({
      ...formData,
      subtasks: formData.subtasks?.map(st => 
        st.id === id ? { ...st, done: !st.done } : st
      ) || []
    });
  };

  if (!isModalOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/70 z-[500] flex items-center justify-center p-5"
      onClick={(e) => e.target === e.currentTarget && handleClose()}
    >
      <div
        className="bg-white border-[2px] border-black rounded-lg w-full max-w-[550px] shadow-[8px_8px_0_black] animate-[modalIn_0.2s_ease] max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-black px-4 py-3.5 flex items-center justify-between sticky top-0 z-10">
          <h2
            className="text-xl text-[var(--brand-yellow)] tracking-wide"
            style={{ fontFamily: 'Bebas Neue, sans-serif' }}
          >
            {editingTaskId ? 'EDIT TASK' : 'NEW TASK'}
          </h2>
          <button
            onClick={handleClose}
            className="w-[30px] h-[30px] flex items-center justify-center bg-[var(--brand-red)] border-[2px] border-black rounded cursor-pointer text-white text-base font-bold transition-all duration-150 hover:bg-[var(--brand-red-dark)]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5">
          {/* Task Name */}
          <div className="mb-4">
            <label
              className="text-[10px] tracking-wider text-[var(--gray-600)] uppercase block mb-1.5"
              style={{ fontFamily: 'var(--font-space-mono), monospace' }}
            >
              Task Name *
            </label>
            <input
              type="text"
              value={formData.title || ''}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="What is the mission?"
              className="w-full px-3 py-2 text-sm border-[2px] border-black rounded-lg bg-white text-black outline-none transition-all duration-150 focus:border-[var(--brand-blue)] focus:shadow-[0_0_0_3px_rgba(0,82,180,0.15)]"
            />
          </div>

          {/* Project & Priority */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div>
              <label
                className="text-[10px] tracking-wider text-[var(--gray-600)] uppercase block mb-1.5"
                style={{ fontFamily: 'var(--font-space-mono), monospace' }}
              >
                Project
              </label>
              <select
                value={formData.project || ''}
                onChange={(e) => setFormData({ ...formData, project: e.target.value })}
                className="w-full px-3 py-2 text-xs border-[2px] border-black rounded-lg bg-white text-black outline-none cursor-pointer appearance-none transition-all duration-150"
                style={{ 
                  fontFamily: 'var(--font-space-mono), monospace',
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L6 7L11 1' stroke='black' stroke-width='2' stroke-linecap='round'/%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 12px center',
                }}
              >
                {projects.map(p => (
                  <option key={p.id} value={p.name}>{p.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label
                className="text-[10px] tracking-wider text-[var(--gray-600)] uppercase block mb-1.5"
                style={{ fontFamily: 'var(--font-space-mono), monospace' }}
              >
                Priority
              </label>
              <select
                value={formData.priority || 'medium'}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as Task['priority'] })}
                className="w-full px-3 py-2 text-xs border-[2px] border-black rounded-lg bg-white text-black outline-none cursor-pointer appearance-none transition-all duration-150"
                style={{ 
                  fontFamily: 'var(--font-space-mono), monospace',
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L6 7L11 1' stroke='black' stroke-width='2' stroke-linecap='round'/%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 12px center',
                }}
              >
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>

          {/* Duration Spinners */}
          <div className="mb-4">
            <label
              className="text-[10px] tracking-wider text-[var(--gray-600)] uppercase block mb-1.5"
              style={{ fontFamily: 'var(--font-space-mono), monospace' }}
            >
              Duration
            </label>
            <div className="flex items-center gap-4">
              {/* Hours */}
              <div className="flex items-center gap-2">
                <div className="flex flex-col">
                  <button
                    type="button"
                    onClick={() => adjustDuration('durationHours', 1)}
                    className="p-1 border-[2px] border-black bg-[var(--gray-100)] rounded-t hover:bg-[var(--brand-yellow)] transition-colors duration-150"
                  >
                    <ChevronUp className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => adjustDuration('durationHours', -1)}
                    className="p-1 border-x-[2px] border-b-[2px] border-black bg-[var(--gray-100)] rounded-b hover:bg-[var(--gray-200)] transition-colors duration-150"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min="0"
                    value={formData.durationHours || 0}
                    onChange={(e) => setFormData({ ...formData, durationHours: Math.max(0, parseInt(e.target.value) || 0) })}
                    className="w-14 px-2 py-2 text-center text-sm border-[2px] border-black rounded-lg bg-white text-black outline-none"
                  />
                  <span className="text-xs font-bold" style={{ fontFamily: 'var(--font-space-mono), monospace' }}>hrs</span>
                </div>
              </div>
              
              {/* Minutes */}
              <div className="flex items-center gap-2">
                <div className="flex flex-col">
                  <button
                    type="button"
                    onClick={() => adjustDuration('durationMinutes', 5)}
                    className="p-1 border-[2px] border-black bg-[var(--gray-100)] rounded-t hover:bg-[var(--brand-yellow)] transition-colors duration-150"
                  >
                    <ChevronUp className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => adjustDuration('durationMinutes', -5)}
                    className="p-1 border-x-[2px] border-b-[2px] border-black bg-[var(--gray-100)] rounded-b hover:bg-[var(--gray-200)] transition-colors duration-150"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min="0"
                    max="59"
                    value={formData.durationMinutes || 0}
                    onChange={(e) => setFormData({ ...formData, durationMinutes: Math.min(59, Math.max(0, parseInt(e.target.value) || 0)) })}
                    className="w-14 px-2 py-2 text-center text-sm border-[2px] border-black rounded-lg bg-white text-black outline-none"
                  />
                  <span className="text-xs font-bold" style={{ fontFamily: 'var(--font-space-mono), monospace' }}>min</span>
                </div>
              </div>
            </div>
          </div>

          {/* Due Date */}
          <div className="mb-4">
            <label
              className="text-[10px] tracking-wider text-[var(--gray-600)] uppercase block mb-1.5"
              style={{ fontFamily: 'var(--font-space-mono), monospace' }}
            >
              Due Date
            </label>
            <div className="flex gap-2">
              <input
                type="date"
                value={formData.due && formData.due !== 'idk yet' ? formData.due : ''}
                onChange={(e) => setFormData({ ...formData, due: e.target.value })}
                className="flex-1 px-3 py-2 text-sm border-[2px] border-black rounded-lg bg-white text-black outline-none transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={formData.due === 'idk yet'}
              />
              <button
                type="button"
                onClick={() => setFormData({ ...formData, due: formData.due === 'idk yet' ? '' : 'idk yet' })}
                className={cn(
                  "px-3 py-2 border-[2px] border-black rounded-lg transition-all duration-150 flex items-center gap-1.5 cursor-pointer",
                  formData.due === 'idk yet' 
                    ? "bg-[var(--brand-yellow)] text-black" 
                    : "bg-white text-[var(--gray-600)] hover:bg-[var(--gray-100)]"
                )}
                title="Set to 'I don't know yet'"
              >
                <HelpCircle className="w-4 h-4" />
                <span className="text-xs font-medium" style={{ fontFamily: 'var(--font-space-mono), monospace' }}>
                  IDK
                </span>
              </button>
            </div>
            {formData.due === 'idk yet' && (
              <p className="text-[10px] text-[var(--brand-yellow)] mt-1" style={{ fontFamily: 'var(--font-space-mono), monospace' }}>
                Due date will show as "idk yet"
              </p>
            )}
          </div>

          {/* Tags - Clickable chips */}
          <div className="mb-4">
            <label
              className="text-[10px] tracking-wider text-[var(--gray-600)] uppercase block mb-1.5"
              style={{ fontFamily: 'var(--font-space-mono), monospace' }}
            >
              Tags (click to add/remove)
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {/* Selected tags */}
              {formData.tags?.map((tag) => (
                <button
                  key={tag}
                  onClick={() => handleRemoveTag(tag)}
                  className="text-[10px] px-2 py-1 bg-[var(--brand-blue)] text-white border-[2px] border-black rounded cursor-pointer transition-all duration-150 hover:bg-[var(--brand-red)] hover:line-through"
                  style={{ fontFamily: 'var(--font-space-mono), monospace' }}
                >
                  #{tag} ✕
                </button>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              {/* Available tags */}
              {allTags.filter(t => !formData.tags?.includes(t)).map((tag) => (
                <button
                  key={tag}
                  onClick={() => handleAddTag(tag)}
                  className="text-[10px] px-2 py-1 bg-[var(--gray-100)] text-black border-[2px] border-black rounded cursor-pointer transition-all duration-150 hover:bg-[var(--brand-yellow)] hover:translate-y-[-2px]"
                  style={{ fontFamily: 'var(--font-space-mono), monospace' }}
                >
                  + #{tag}
                </button>
              ))}
            </div>
            {/* Custom tag input */}
            <div className="flex gap-2 mt-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddCustomTag()}
                placeholder="Add custom tag..."
                className="flex-1 px-3 py-1.5 text-xs border-[2px] border-black rounded-lg bg-white text-black outline-none"
              />
              <button
                onClick={handleAddCustomTag}
                className="px-3 py-1.5 bg-[var(--brand-yellow)] text-black text-xs font-bold border-[2px] border-black rounded-lg transition-all duration-150 hover:bg-[var(--brand-yellow-dark)]"
                style={{ fontFamily: 'var(--font-space-mono), monospace' }}
              >
                ADD
              </button>
            </div>
          </div>

          {/* Notes */}
          <div className="mb-4">
            <label
              className="text-[10px] tracking-wider text-[var(--gray-600)] uppercase block mb-1.5"
              style={{ fontFamily: 'var(--font-space-mono), monospace' }}
            >
              Notes
            </label>
            <textarea
              value={formData.notes || ''}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Context, thoughts, links..."
              className="w-full px-3 py-2 text-xs border-[2px] border-black rounded-lg bg-white text-black outline-none resize-vertical min-h-[80px] transition-all duration-150 focus:border-[var(--brand-blue)]"
              style={{ fontFamily: 'var(--font-space-mono), monospace' }}
            />
          </div>

          {/* Subtasks */}
          <div className="mb-4">
            <label
              className="text-[10px] tracking-wider text-[var(--gray-600)] uppercase block mb-1.5"
              style={{ fontFamily: 'var(--font-space-mono), monospace' }}
            >
              Subtasks
            </label>
            
            {/* Subtask list */}
            <div className="space-y-2 mb-2">
              {formData.subtasks?.map((st) => (
                <div
                  key={st.id}
                  className="flex items-center gap-2 p-2 bg-[var(--off-white)] border-[2px] border-black rounded-lg group"
                >
                  <div
                    onClick={() => handleToggleSubtask(st.id)}
                    className={cn(
                      "w-5 h-5 border-[2px] border-black rounded-[4px] flex items-center justify-center flex-shrink-0 cursor-pointer transition-all duration-150",
                      st.done ? "bg-[var(--brand-blue)] border-[var(--brand-blue)] text-white" : "bg-white"
                    )}
                  >
                    {st.done && <span className="text-[10px] font-bold">✓</span>}
                  </div>
                  <span className={cn("flex-1 text-sm", st.done && "line-through text-[var(--gray-400)]")}>
                    {st.text}
                  </span>
                  <button
                    onClick={() => handleRemoveSubtask(st.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-[var(--brand-red)] hover:text-white rounded transition-all duration-150"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add subtask input */}
            <div className="flex gap-2">
              <input
                type="text"
                value={newSubtaskText}
                onChange={(e) => setNewSubtaskText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddSubtask()}
                placeholder="Add a subtask..."
                className="flex-1 px-3 py-1.5 text-xs border-[2px] border-black rounded-lg bg-white text-black outline-none"
              />
              <button
                onClick={handleAddSubtask}
                className="px-3 py-1.5 bg-[var(--brand-blue)] text-white text-xs font-bold border-[2px] border-black rounded-lg transition-all duration-150 hover:bg-[var(--brand-blue-dark)] flex items-center gap-1"
                style={{ fontFamily: 'var(--font-space-mono), monospace' }}
              >
                <Plus className="w-3 h-3" /> ADD
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-3.5 border-t-[2px] border-black flex gap-2.5 justify-end items-center sticky bottom-0 bg-white z-10">
          {editingTaskId && (
            <div className="flex gap-2">
              <button
                onClick={handleSacrifice}
                className="px-3 py-2 bg-[var(--gray-600)] text-white text-xs font-bold tracking-wider border-[2px] border-black rounded-lg cursor-pointer transition-all duration-150 hover:bg-[var(--gray-800)] flex items-center gap-1.5 btn-shine"
                style={{ fontFamily: 'var(--font-space-mono), monospace' }}
              >
                <Archive className="w-4 h-4" /> SACRIFICE
              </button>
              <button
                onClick={handleDelete}
                className="px-3 py-2 bg-transparent text-[var(--brand-red)] text-xs font-bold tracking-wider border-[2px] border-[var(--brand-red)] rounded-lg cursor-pointer transition-all duration-150 hover:bg-[var(--brand-red)] hover:text-white flex items-center gap-1.5"
                style={{ fontFamily: 'var(--font-space-mono), monospace' }}
              >
                <Trash2 className="w-4 h-4" /> DELETE
              </button>
            </div>
          )}
          <div className="flex-1" />
          <button
            onClick={handleClose}
            className="px-4 py-2 bg-transparent text-[var(--gray-600)] text-xs font-bold tracking-wider border-none rounded-lg cursor-pointer transition-all duration-150 hover:bg-[var(--gray-100)]"
            style={{ fontFamily: 'var(--font-space-mono), monospace' }}
          >
            CANCEL
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-[var(--brand-red)] text-white text-xs font-bold tracking-wider border-[2px] border-black rounded-lg cursor-pointer transition-all duration-150 shadow-[4px_4px_0_var(--brand-red-dark)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0_var(--brand-red-dark)] active:translate-x-0 active:translate-y-0 active:shadow-none btn-shine"
            style={{ fontFamily: 'var(--font-space-mono), monospace' }}
          >
            {editingTaskId ? 'SAVE' : 'CREATE TASK'}
          </button>
        </div>
      </div>
    </div>
  );
}
