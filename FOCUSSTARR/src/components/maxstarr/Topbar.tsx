'use client';

import { useStore, createNewProject } from '@/lib/store';
import { Search, Plus } from 'lucide-react';

const viewTitles: Record<string, string> = {
  dashboard: 'FOCUS DASHBOARD',
  kanban: 'ALL TASKS',
  documents: 'DOCUMENTS',
  projects: 'PROJECTS',
  archive: 'SACRIFICE PIT',
};

export default function Topbar() {
  const { currentView, searchQuery, setSearchQuery, setModalOpen, setEditingTaskId, selectedProjectId, projects, selectedDocumentId, documents, setProjectModalOpen, setEditingProjectId, addProject, projects: allProjects, setSearchOpen, isSearchOpen } = useStore();

  const handleNewTask = () => {
    setEditingTaskId(null);
    setModalOpen(true);
  };

  const handleNewProject = () => {
    setEditingProjectId(null);
    setProjectModalOpen(true);
  };

  // Get the title based on current view
  let title = viewTitles[currentView];
  if (currentView === 'projects' && selectedProjectId) {
    const project = projects.find(p => p.id === selectedProjectId);
    if (project) {
      title = project.name.toUpperCase();
    }
  }
  if (currentView === 'documents' && selectedDocumentId) {
    const doc = documents.find(d => d.id === selectedDocumentId);
    if (doc) {
      title = doc.title ? doc.title.toUpperCase().slice(0, 30) : 'DOCUMENT';
    }
  }

  // Hide new task button on documents view when editing
  const showNewTaskButton = currentView !== 'documents' || !selectedDocumentId;

  return (
    <header className="bg-white border-b-[2px] border-black px-4 md:px-6 h-[60px] flex items-center gap-3 md:gap-4 sticky top-0 z-[90]">
      {/* Mobile Menu Button Space */}
      <div className="w-10 lg:hidden" />
      
      {/* Title */}
      <h1
        className="text-lg md:text-[22px] tracking-wide text-black flex-1 truncate"
        style={{ fontFamily: 'Bebas Neue, sans-serif' }}
      >
        {title}
      </h1>

      {/* Search Bar - Hidden on very small screens */}
      <div 
        className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 border-[2px] border-black rounded-lg bg-white min-w-[180px] md:min-w-[220px] cursor-pointer transition-all duration-150 hover:shadow-[2px_2px_0_black]"
        onClick={() => setSearchOpen(!isSearchOpen)}
      >
        <Search className="w-3.5 h-3.5 text-[var(--gray-400)]" />
        <input
          type="text"
          placeholder="Search tasks..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onClick={(e) => e.stopPropagation()}
          className="border-none outline-none bg-transparent flex-1 text-sm cursor-pointer"
        />
      </div>

      {/* New Project Button */}
      {showNewTaskButton && (
        <button
          onClick={handleNewProject}
          className="px-3 md:px-4 py-2 bg-[var(--brand-yellow)] text-black text-[10px] md:text-xs font-bold tracking-wider border-[2px] border-black rounded-lg cursor-pointer transition-all duration-150 shadow-[4px_4px_0_var(--brand-yellow-dark)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0_var(--brand-yellow-dark)] active:translate-x-0 active:translate-y-0 active:shadow-none whitespace-nowrap"
          style={{ fontFamily: 'var(--font-space-mono), monospace' }}
        >
          + NEW PROJECT
        </button>
      )}
      
      {/* New Task Button */}
      {showNewTaskButton && (
        <button
          onClick={handleNewTask}
          className="px-3 md:px-4 py-2 bg-[var(--brand-red)] text-white text-[10px] md:text-xs font-bold tracking-wider border-[2px] border-black rounded-lg cursor-pointer transition-all duration-150 shadow-[4px_4px_0_var(--brand-red-dark)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0_var(--brand-red-dark)] active:translate-x-0 active:translate-y-0 active:shadow-none whitespace-nowrap"
          style={{ fontFamily: 'var(--font-space-mono), monospace' }}
        >
          + NEW TASK
        </button>
      )}
    </header>
  );
}
