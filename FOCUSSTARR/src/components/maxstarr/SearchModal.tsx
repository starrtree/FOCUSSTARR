'use client';

import { useEffect, useRef } from 'react';
import { useStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import { Search, X, FileText, CheckCircle, Clock, AlertCircle, ArrowRight } from 'lucide-react';

export default function SearchModal() {
  const { 
    isSearchOpen, 
    setSearchOpen,
    searchQuery,
    setSearchQuery,
    tasks,
    projects,
    documents,
    setCurrentView,
    setSelectedProjectId,
    setSelectedDocumentId,
    setEditingTaskId,
    setModalOpen
  } = useStore();

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isSearchOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isSearchOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSearchOpen(false);
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(!isSearchOpen);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchOpen, setSearchOpen]);

  if (!isSearchOpen) return null;

  const handleClose = () => {
    setSearchOpen(false);
    setSearchQuery('');
  };

  // Search results
  const searchLower = searchQuery.toLowerCase();
  
  const matchedTasks = searchQuery.length >= 2 
    ? tasks.filter(t => 
        t.title.toLowerCase().includes(searchLower) ||
        t.project.toLowerCase().includes(searchLower) ||
        t.tags.some(tag => tag.toLowerCase().includes(searchLower))
      ).slice(0, 5)
    : [];

  const matchedProjects = searchQuery.length >= 2
    ? projects.filter(p => 
        p.name.toLowerCase().includes(searchLower)
      ).slice(0, 3)
    : [];

  const matchedDocuments = searchQuery.length >= 2
    ? documents.filter(d => 
        d.title.toLowerCase().includes(searchLower) ||
        d.blocks.some(b => b.content.toLowerCase().includes(searchLower))
      ).slice(0, 3)
    : [];

  const hasResults = matchedTasks.length > 0 || matchedProjects.length > 0 || matchedDocuments.length > 0;

  const handleTaskClick = (taskId: string) => {
    setEditingTaskId(taskId);
    setModalOpen(true);
    handleClose();
  };

  const handleProjectClick = (projectId: string) => {
    setSelectedProjectId(projectId);
    setCurrentView('projects');
    handleClose();
  };

  const handleDocumentClick = (docId: string) => {
    setSelectedDocumentId(docId);
    setCurrentView('documents');
    handleClose();
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'done': return <CheckCircle className="w-3.5 h-3.5 text-green-500" />;
      case 'doing': return <Clock className="w-3.5 h-3.5 text-[var(--brand-yellow)]" />;
      case 'review': return <AlertCircle className="w-3.5 h-3.5 text-[var(--brand-red)]" />;
      default: return <Clock className="w-3.5 h-3.5 text-[var(--gray-400)]" />;
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/60 flex items-start justify-center z-[200] pt-[15vh] p-4"
      onClick={handleClose}
    >
      <div 
        className="bg-white border-[3px] border-black rounded-lg shadow-[8px_8px_0_black] w-full max-w-xl animate-in fade-in-0 zoom-in-95 duration-200 overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Search Input */}
        <div className="flex items-center gap-3 p-4 border-b-[2px] border-black">
          <Search className="w-5 h-5 text-[var(--gray-400)]" />
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search tasks, projects, documents..."
            className="flex-1 text-base outline-none"
            style={{ fontFamily: 'var(--font-body), sans-serif' }}
          />
          <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-1 bg-[var(--gray-100)] border border-[var(--gray-300)] rounded text-[10px] text-[var(--gray-500)]" style={{ fontFamily: 'var(--font-space-mono), monospace' }}>
            ESC
          </kbd>
          <button 
            onClick={handleClose}
            className="p-1 hover:bg-[var(--gray-100)] rounded transition-colors cursor-pointer"
          >
            <X className="w-4 h-4 text-[var(--gray-400)]" />
          </button>
        </div>

        {/* Results */}
        <div className="max-h-[400px] overflow-y-auto">
          {searchQuery.length < 2 ? (
            <div className="p-8 text-center text-[var(--gray-400)]">
              <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm" style={{ fontFamily: 'var(--font-space-mono), monospace' }}>
                Type at least 2 characters to search
              </p>
            </div>
          ) : !hasResults ? (
            <div className="p-8 text-center text-[var(--gray-400)]">
              <p className="text-sm" style={{ fontFamily: 'var(--font-space-mono), monospace' }}>
                No results found for "{searchQuery}"
              </p>
            </div>
          ) : (
            <div className="divide-y divide-[var(--gray-200)]">
              {/* Tasks */}
              {matchedTasks.length > 0 && (
                <div>
                  <div className="px-4 py-2 bg-[var(--gray-100)] text-[10px] font-bold text-[var(--gray-500)] uppercase tracking-wider" style={{ fontFamily: 'var(--font-space-mono), monospace' }}>
                    Tasks ({matchedTasks.length})
                  </div>
                  {matchedTasks.map(task => (
                    <button
                      key={task.id}
                      onClick={() => handleTaskClick(task.id)}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[var(--gray-100)] transition-colors text-left cursor-pointer"
                    >
                      {getStatusIcon(task.status)}
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate">{task.title}</div>
                        <div className="text-[10px] text-[var(--gray-500)]" style={{ fontFamily: 'var(--font-space-mono), monospace' }}>
                          {task.project} • {task.priority} priority
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-[var(--gray-300)]" />
                    </button>
                  ))}
                </div>
              )}

              {/* Projects */}
              {matchedProjects.length > 0 && (
                <div>
                  <div className="px-4 py-2 bg-[var(--gray-100)] text-[10px] font-bold text-[var(--gray-500)] uppercase tracking-wider" style={{ fontFamily: 'var(--font-space-mono), monospace' }}>
                    Projects ({matchedProjects.length})
                  </div>
                  {matchedProjects.map(project => (
                    <button
                      key={project.id}
                      onClick={() => handleProjectClick(project.id)}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[var(--gray-100)] transition-colors text-left cursor-pointer"
                    >
                      <span className="text-lg">{project.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate">{project.name}</div>
                        <div className="text-[10px] text-[var(--gray-500)]" style={{ fontFamily: 'var(--font-space-mono), monospace' }}>
                          {project.due}
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-[var(--gray-300)]" />
                    </button>
                  ))}
                </div>
              )}

              {/* Documents */}
              {matchedDocuments.length > 0 && (
                <div>
                  <div className="px-4 py-2 bg-[var(--gray-100)] text-[10px] font-bold text-[var(--gray-500)] uppercase tracking-wider" style={{ fontFamily: 'var(--font-space-mono), monospace' }}>
                    Documents ({matchedDocuments.length})
                  </div>
                  {matchedDocuments.map(doc => (
                    <button
                      key={doc.id}
                      onClick={() => handleDocumentClick(doc.id)}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[var(--gray-100)] transition-colors text-left cursor-pointer"
                    >
                      <FileText className="w-4 h-4 text-[var(--brand-blue)]" />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate">{doc.title || 'Untitled'}</div>
                        <div className="text-[10px] text-[var(--gray-500)]" style={{ fontFamily: 'var(--font-space-mono), monospace' }}>
                          {doc.wordCount} words
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-[var(--gray-300)]" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 border-t-[2px] border-black bg-[var(--gray-100)] flex items-center justify-between">
          <div className="flex items-center gap-3 text-[10px] text-[var(--gray-500)]" style={{ fontFamily: 'var(--font-space-mono), monospace' }}>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-white border border-[var(--gray-300)] rounded text-[9px]">↑</kbd>
              <kbd className="px-1.5 py-0.5 bg-white border border-[var(--gray-300)] rounded text-[9px]">↓</kbd>
              to navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-white border border-[var(--gray-300)] rounded text-[9px]">↵</kbd>
              to select
            </span>
          </div>
          <span className="text-[10px] text-[var(--gray-400)]" style={{ fontFamily: 'var(--font-space-mono), monospace' }}>
            ⌘K to toggle
          </span>
        </div>
      </div>
    </div>
  );
}
