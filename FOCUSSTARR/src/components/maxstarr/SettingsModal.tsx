'use client';

import { useStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import { X, Moon, Sun, Download, Trash2, RefreshCw, Info, Database, Volume2, VolumeX } from 'lucide-react';
import { toast } from 'sonner';
import { useState, useEffect } from 'react';

export default function SettingsModal() {
  const { 
    isSettingsOpen, 
    setSettingsOpen,
    tasks,
    projects,
    documents,
    tags,
    theme,
    soundEnabled,
    setTheme,
    setSoundEnabled,
    deleteTask
  } = useStore();

  const [activeTab, setActiveTab] = useState<'general' | 'data' | 'about'>('general');

  // Apply theme class to document
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  if (!isSettingsOpen) return null;

  const handleClose = () => {
    setSettingsOpen(false);
  };

  const handleExportData = () => {
    const data = {
      tasks,
      projects,
      documents,
      tags,
      exportedAt: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `maxstarr-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('Data exported successfully');
  };

  const handleClearCompletedTasks = () => {
    const completedTasks = tasks.filter(t => t.status === 'done' && !t.isArchived);
    if (completedTasks.length === 0) {
      toast.info('No completed tasks to clear');
      return;
    }
    completedTasks.forEach(t => deleteTask(t.id));
    toast.success(`Cleared ${completedTasks.length} completed tasks`);
  };

  const handleToggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    toast.success(`Switched to ${newTheme} mode`);
  };

  const handleToggleSound = () => {
    setSoundEnabled(!soundEnabled);
    toast.success(soundEnabled ? 'Sound effects disabled' : 'Sound effects enabled');
  };

  const stats = {
    totalTasks: tasks.filter(t => !t.isArchived).length,
    completedTasks: tasks.filter(t => t.status === 'done' && !t.isArchived).length,
    archivedTasks: tasks.filter(t => t.isArchived).length,
    totalProjects: projects.filter(p => !p.isArchived).length,
    archivedProjects: projects.filter(p => p.isArchived).length,
    totalDocuments: documents.filter(d => !d.isArchived).length,
    totalTags: tags.length
  };

  return (
    <div 
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-[200] p-4"
      onClick={handleClose}
    >
      <div 
        className="bg-white dark:bg-[var(--gray-800)] border-[3px] border-black rounded-lg shadow-[8px_8px_0_black] w-full max-w-lg animate-in fade-in-0 zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-black px-4 py-3 flex items-center justify-between">
          <h2 
            className="text-lg text-[var(--brand-yellow)] tracking-wide"
            style={{ fontFamily: 'Bebas Neue, sans-serif' }}
          >
            ⚙️ SETTINGS
          </h2>
          <button 
            onClick={handleClose}
            className="text-white/70 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b-[2px] border-black dark:border-[var(--gray-600)]">
          {(['general', 'data', 'about'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "flex-1 px-4 py-2.5 text-xs font-bold transition-all cursor-pointer",
                activeTab === tab 
                  ? "bg-[var(--brand-yellow)] text-black border-b-[3px] border-black -mb-[2px]" 
                  : "text-[var(--gray-600)] dark:text-[var(--gray-400)] hover:bg-[var(--gray-100)] dark:hover:bg-[var(--gray-700)]",
                "uppercase tracking-wider"
              )}
              style={{ fontFamily: 'var(--font-space-mono), monospace' }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-4 min-h-[300px]">
          {activeTab === 'general' && (
            <div className="space-y-4">
              {/* Theme Toggle */}
              <div className="p-4 border-[2px] border-black dark:border-[var(--gray-600)] rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-sm dark:text-white">Appearance</div>
                    <div className="text-xs text-[var(--gray-500)]" style={{ fontFamily: 'var(--font-space-mono), monospace' }}>
                      {theme === 'light' ? 'Light mode' : 'Dark mode'}
                    </div>
                  </div>
                  <button
                    onClick={handleToggleTheme}
                    className={cn(
                      "flex items-center gap-2 p-1 rounded-lg transition-all cursor-pointer",
                      theme === 'light' 
                        ? "bg-[var(--gray-100)]" 
                        : "bg-[var(--gray-700)]"
                    )}
                  >
                    <div className={cn(
                      "p-2 rounded-lg transition-all",
                      theme === 'light' && "bg-white border-[2px] border-black"
                    )}>
                      <Sun className={cn("w-4 h-4", theme === 'light' ? "text-black" : "text-[var(--gray-400)]")} />
                    </div>
                    <div className={cn(
                      "p-2 rounded-lg transition-all",
                      theme === 'dark' && "bg-[var(--brand-blue)] border-[2px] border-black"
                    )}>
                      <Moon className={cn("w-4 h-4", theme === 'dark' ? "text-white" : "text-[var(--gray-400)]")} />
                    </div>
                  </button>
                </div>
              </div>

              {/* Sound Toggle */}
              <div className="p-4 border-[2px] border-black dark:border-[var(--gray-600)] rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-sm dark:text-white">Sound Effects</div>
                    <div className="text-xs text-[var(--gray-500)]" style={{ fontFamily: 'var(--font-space-mono), monospace' }}>
                      {soundEnabled ? 'Enabled' : 'Disabled'}
                    </div>
                  </div>
                  <button
                    onClick={handleToggleSound}
                    className={cn(
                      "w-14 h-7 rounded-full p-0.5 cursor-pointer transition-all",
                      soundEnabled 
                        ? "bg-[var(--brand-blue)]" 
                        : "bg-[var(--gray-300)] dark:bg-[var(--gray-600)]"
                    )}
                  >
                    <div className={cn(
                      "w-6 h-6 rounded-full transition-all flex items-center justify-center",
                      soundEnabled 
                        ? "translate-x-7 bg-white" 
                        : "translate-x-0 bg-white"
                    )}>
                      {soundEnabled 
                        ? <Volume2 className="w-3.5 h-3.5 text-[var(--brand-blue)]" />
                        : <VolumeX className="w-3.5 h-3.5 text-[var(--gray-400)]" />
                      }
                    </div>
                  </button>
                </div>
              </div>

              {/* Default View */}
              <div className="p-4 border-[2px] border-black dark:border-[var(--gray-600)] rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-sm dark:text-white">Default View</div>
                    <div className="text-xs text-[var(--gray-500)]" style={{ fontFamily: 'var(--font-space-mono), monospace' }}>
                      Focus Dashboard
                    </div>
                  </div>
                  <select className="px-3 py-1.5 border-[2px] border-black dark:border-[var(--gray-600)] dark:bg-[var(--gray-700)] dark:text-white rounded-lg text-xs bg-white cursor-pointer" style={{ fontFamily: 'var(--font-space-mono), monospace' }}>
                    <option>Dashboard</option>
                    <option>All Tasks</option>
                    <option>Documents</option>
                    <option>Projects</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'data' && (
            <div className="space-y-4">
              {/* Stats */}
              <div className="p-4 border-[2px] border-black dark:border-[var(--gray-600)] rounded-lg bg-[var(--gray-100)] dark:bg-[var(--gray-700)]">
                <div className="flex items-center gap-2 mb-3 dark:text-white">
                  <Database className="w-4 h-4" />
                  <span className="font-medium text-sm">Data Overview</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-2 bg-white dark:bg-[var(--gray-800)] border-[1px] border-[var(--gray-300)] dark:border-[var(--gray-600)] rounded">
                    <div className="text-lg font-bold text-[var(--brand-blue)]">{stats.totalTasks}</div>
                    <div className="text-[10px] text-[var(--gray-500)] uppercase" style={{ fontFamily: 'var(--font-space-mono), monospace' }}>Active Tasks</div>
                  </div>
                  <div className="p-2 bg-white dark:bg-[var(--gray-800)] border-[1px] border-[var(--gray-300)] dark:border-[var(--gray-600)] rounded">
                    <div className="text-lg font-bold text-[var(--brand-yellow)]">{stats.totalProjects}</div>
                    <div className="text-[10px] text-[var(--gray-500)] uppercase" style={{ fontFamily: 'var(--font-space-mono), monospace' }}>Projects</div>
                  </div>
                  <div className="p-2 bg-white dark:bg-[var(--gray-800)] border-[1px] border-[var(--gray-300)] dark:border-[var(--gray-600)] rounded">
                    <div className="text-lg font-bold text-[var(--brand-red)]">{stats.totalDocuments}</div>
                    <div className="text-[10px] text-[var(--gray-500)] uppercase" style={{ fontFamily: 'var(--font-space-mono), monospace' }}>Documents</div>
                  </div>
                  <div className="p-2 bg-white dark:bg-[var(--gray-800)] border-[1px] border-[var(--gray-300)] dark:border-[var(--gray-600)] rounded">
                    <div className="text-lg font-bold text-[var(--gray-600)]">{stats.archivedTasks}</div>
                    <div className="text-[10px] text-[var(--gray-500)] uppercase" style={{ fontFamily: 'var(--font-space-mono), monospace' }}>Sacrificed</div>
                  </div>
                </div>
              </div>

              {/* Export */}
              <button
                onClick={handleExportData}
                className="w-full p-4 border-[2px] border-black dark:border-[var(--gray-600)] rounded-lg flex items-center justify-between hover:bg-[var(--gray-100)] dark:hover:bg-[var(--gray-700)] transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <Download className="w-5 h-5 text-[var(--brand-blue)]" />
                  <div className="text-left">
                    <div className="font-medium text-sm dark:text-white">Export All Data</div>
                    <div className="text-xs text-[var(--gray-500)]" style={{ fontFamily: 'var(--font-space-mono), monospace' }}>
                      Download as JSON backup
                    </div>
                  </div>
                </div>
                <span className="text-xs px-2 py-1 bg-[var(--brand-blue)] text-white rounded group-hover:bg-[var(--brand-blue-light)] transition-colors btn-shine" style={{ fontFamily: 'var(--font-space-mono), monospace' }}>
                  EXPORT
                </span>
              </button>

              {/* Clear Completed */}
              <button
                onClick={handleClearCompletedTasks}
                className="w-full p-4 border-[2px] border-black dark:border-[var(--gray-600)] rounded-lg flex items-center justify-between hover:bg-[var(--gray-100)] dark:hover:bg-[var(--gray-700)] transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <RefreshCw className="w-5 h-5 text-[var(--brand-yellow)]" />
                  <div className="text-left">
                    <div className="font-medium text-sm dark:text-white">Clear Completed Tasks</div>
                    <div className="text-xs text-[var(--gray-500)]" style={{ fontFamily: 'var(--font-space-mono), monospace' }}>
                      {stats.completedTasks} completed tasks
                    </div>
                  </div>
                </div>
                <span className="text-xs px-2 py-1 bg-[var(--brand-yellow)] text-black rounded group-hover:bg-[var(--brand-yellow-dark)] transition-colors btn-shine" style={{ fontFamily: 'var(--font-space-mono), monospace' }}>
                  CLEAR
                </span>
              </button>

              {/* Danger Zone */}
              <div className="p-4 border-[2px] border-[var(--brand-red)] rounded-lg bg-[var(--brand-red)]/5">
                <div className="flex items-center gap-2 mb-2">
                  <Trash2 className="w-4 h-4 text-[var(--brand-red)]" />
                  <span className="font-medium text-sm text-[var(--brand-red)]">Danger Zone</span>
                </div>
                <p className="text-xs text-[var(--gray-600)] mb-3" style={{ fontFamily: 'var(--font-space-mono), monospace' }}>
                  These actions are irreversible. Proceed with caution.
                </p>
                <button
                  className="px-3 py-2 bg-white border-[2px] border-[var(--brand-red)] text-[var(--brand-red)] rounded-lg text-xs font-bold hover:bg-[var(--brand-red)] hover:text-white transition-all cursor-pointer"
                  style={{ fontFamily: 'var(--font-space-mono), monospace' }}
                >
                  Reset All Data
                </button>
              </div>
            </div>
          )}

          {activeTab === 'about' && (
            <div className="space-y-4">
              {/* Logo */}
              <div className="text-center py-6">
                <div 
                  className="text-4xl mb-2"
                  style={{ fontFamily: 'Bebas Neue, sans-serif' }}
                >
                  <span className="text-[var(--brand-blue)]">MAX</span>
                  <span className="text-[var(--brand-red)]">STARR</span>
                  <span className="text-[var(--brand-yellow)]"> ★</span>
                </div>
                <div className="text-[10px] text-[var(--gray-500)] tracking-wider" style={{ fontFamily: 'var(--font-space-mono), monospace' }}>
                  PERSONAL FOCUS OS
                </div>
                <div className="text-xs text-[var(--gray-400)] mt-1" style={{ fontFamily: 'var(--font-space-mono), monospace' }}>
                  Version 1.0.0
                </div>
              </div>

              {/* Info */}
              <div className="p-4 border-[2px] border-black dark:border-[var(--gray-600)] rounded-lg bg-[var(--gray-100)] dark:bg-[var(--gray-700)]">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-[var(--brand-blue)] mt-0.5" />
                  <div className="dark:text-white">
                    <div className="font-medium text-sm mb-1">About This App</div>
                    <p className="text-xs text-[var(--gray-600)] dark:text-[var(--gray-300)] leading-relaxed" style={{ fontFamily: 'var(--font-space-mono), monospace' }}>
                      MAX STARR is a brutalist-style personal productivity system designed to help you focus on what matters. 
                      Track projects, manage tasks, and organize your work with a bold, distraction-free interface.
                    </p>
                  </div>
                </div>
              </div>

              {/* Tech Stack */}
              <div className="p-4 border-[2px] border-black dark:border-[var(--gray-600)] rounded-lg">
                <div className="font-medium text-sm mb-2 dark:text-white">Built With</div>
                <div className="flex flex-wrap gap-2">
                  {['Next.js', 'TypeScript', 'Tailwind CSS', 'Zustand', 'Bebas Neue', 'Space Mono'].map(tech => (
                    <span 
                      key={tech}
                      className="text-[10px] px-2 py-1 bg-[var(--gray-100)] dark:bg-[var(--gray-700)] border border-[var(--gray-300)] dark:border-[var(--gray-600)] rounded dark:text-white"
                      style={{ fontFamily: 'var(--font-space-mono), monospace' }}
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t-[2px] border-black dark:border-[var(--gray-600)] bg-[var(--gray-100)] dark:bg-[var(--gray-700)] flex justify-end">
          <button
            onClick={handleClose}
            className="px-4 py-2 bg-black text-white border-[2px] border-black rounded-lg hover:bg-[var(--gray-800)] transition-all text-xs font-bold cursor-pointer btn-shine"
            style={{ fontFamily: 'var(--font-space-mono), monospace' }}
          >
            CLOSE
          </button>
        </div>
      </div>
    </div>
  );
}
