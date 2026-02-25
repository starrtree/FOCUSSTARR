'use client';

import { useState } from 'react';
import { useStore, formatDuration, formatRelativeTime, calculateWordCount } from '@/lib/store';
import { Task } from '@/lib/types';
import { cn } from '@/lib/utils';
import { LayoutGrid, List, ArrowLeft, Calendar, Clock, CheckCircle, AlertCircle, Pencil, FileText, Plus, Filter, Archive, FolderOpen, X, Trash2 } from 'lucide-react';
import TaskCard from './TaskCard';
import { toast } from 'sonner';

type ViewMode = 'modular' | 'list';

export default function ProjectView() {
  const { 
    projects, 
    tasks, 
    setSelectedProjectId, 
    selectedProjectId, 
    setCurrentView, 
    updateTask, 
    setProjectModalOpen, 
    setEditingProjectId, 
    documents, 
    setSelectedDocumentId,
    setModalOpen,
    setAutoSetProjectForTask,
    projectCategories,
    projectFilter,
    setProjectFilter,
    deleteProjectCategory,
    isProjectModalOpen
  } = useStore();
  
  const [viewMode, setViewMode] = useState<ViewMode>('modular');
  const [showFilters, setShowFilters] = useState(false);

  const selectedProject = projects.find(p => p.id === selectedProjectId);
  const projectTasks = selectedProject 
    ? tasks.filter(t => t.project === selectedProject.name && !t.isArchived)
    : [];
  const projectDocuments = selectedProject
    ? documents.filter(d => d.projectId === selectedProject.id && !d.isArchived)
    : [];

  // Filter projects based on projectFilter
  const filteredProjects = projects.filter(p => {
    if (projectFilter === 'active') return !p.isArchived;
    if (projectFilter === 'archived') return p.isArchived;
    if (projectFilter === 'all') return true;
    // If filter is a category ID
    if (projectFilter.startsWith('cat-')) {
      return p.category === projectFilter && !p.isArchived;
    }
    return !p.isArchived;
  });

  // Group projects by category
  const projectsByCategory = projectCategories.map(cat => ({
    ...cat,
    projects: filteredProjects.filter(p => p.category === cat.id)
  }));

  // Projects without category
  const uncategorizedProjects = filteredProjects.filter(p => !p.category);

  const colorMap: Record<string, string> = {
    red: 'var(--brand-red)',
    blue: 'var(--brand-blue)',
    yellow: 'var(--brand-yellow)',
    gray: 'var(--gray-400)',
    green: '#22c55e',
    purple: '#a855f7',
    orange: '#f97316',
    pink: '#ec4899',
  };

  const handleNewTaskFromProject = () => {
    if (selectedProjectId) {
      setAutoSetProjectForTask(selectedProjectId);
    }
    setModalOpen(true);
  };

  // Category header component
  const CategoryHeader = ({ name, count, categoryId }: { name: string; count: number; categoryId: string }) => (
    <div className="bg-black px-4 py-3 rounded-lg mb-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <span className="text-sm font-bold text-[var(--brand-yellow)]" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
          {name.toUpperCase()}
        </span>
        <span className="text-xs text-white/60" style={{ fontFamily: 'var(--font-space-mono), monospace' }}>
          {count} {count === 1 ? 'project' : 'projects'}
        </span>
      </div>
      <button
        onClick={() => {
          if (confirm(`Delete category "${name}"? Projects will be moved to "No Category".`)) {
            deleteProjectCategory(categoryId);
            if (projectFilter === categoryId) {
              setProjectFilter('active');
            }
            toast.success(`Category "${name}" deleted`);
          }
        }}
        className="p-1 text-white/40 hover:text-[var(--brand-red)] transition-colors cursor-pointer"
        title="Delete category"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );

  // Project card for grid view
  const ProjectCard = ({ project }: { project: typeof projects[0] }) => {
    const projectTaskCount = tasks.filter(t => t.project === project.name && !t.isArchived).length;
    const completedCount = tasks.filter(t => t.project === project.name && !t.isArchived && t.status === 'done').length;
    const progress = projectTaskCount > 0 ? Math.round((completedCount / projectTaskCount) * 100) : 0;
    
    return (
      <div
        key={project.id}
        onClick={() => setSelectedProjectId(project.id)}
        className="p-5 border-[2px] border-black rounded-lg cursor-pointer transition-all duration-200 hover:shadow-[4px_4px_0_black] hover:translate-y-[-2px] group relative bg-white"
        style={{ 
          background: `linear-gradient(135deg, ${colorMap[project.color] || colorMap.gray}15 0%, ${colorMap[project.color] || colorMap.gray}05 100%)`,
          borderLeft: `5px solid ${colorMap[project.color] || colorMap.gray}`
        }}
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{project.icon}</span>
            <h3
              className="text-lg font-bold group-hover:text-[var(--brand-blue)] transition-colors"
              style={{ fontFamily: 'Bebas Neue, sans-serif' }}
            >
              {project.name}
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setEditingProjectId(project.id);
                setProjectModalOpen(true);
              }}
              className="opacity-0 group-hover:opacity-100 p-1.5 bg-white border border-black rounded hover:bg-[var(--gray-100)] transition-all cursor-pointer"
            >
              <Pencil className="w-3 h-3" />
            </button>
            <span
              className="text-xs font-bold px-2 py-0.5 rounded-full"
              style={{ 
                backgroundColor: colorMap[project.color] || colorMap.gray,
                color: project.color === 'yellow' ? 'black' : 'white'
              }}
            >
              {progress}%
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-4 text-xs text-[var(--gray-500)]" style={{ fontFamily: 'var(--font-space-mono), monospace' }}>
          <span>{projectTaskCount} tasks</span>
          <span>•</span>
          <span>{completedCount} completed</span>
        </div>
        
        {/* Progress bar */}
        <div className="mt-3 h-2 bg-[var(--gray-100)] rounded-full overflow-hidden">
          <div 
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${progress}%`, backgroundColor: colorMap[project.color] }}
          />
        </div>
      </div>
    );
  };

  if (!selectedProject) {
    return (
      <div className="max-w-[1100px] mx-auto">
        {/* Header with filters */}
        <div className="bg-white border-[2px] border-black rounded-lg shadow-[6px_6px_0_black] overflow-hidden mb-4">
          <div className="bg-black px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FolderOpen className="w-5 h-5 text-[var(--brand-yellow)]" />
              <h2
                className="text-xl text-[var(--brand-yellow)] tracking-wide"
                style={{ fontFamily: 'Bebas Neue, sans-serif' }}
              >
                VIEW PROJECTS
              </h2>
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                "flex items-center gap-2 text-[10px] px-3 py-1.5 border border-white/20 rounded transition-all cursor-pointer",
                showFilters ? "bg-[var(--brand-yellow)] text-black" : "text-white hover:bg-white/10"
              )}
              style={{ fontFamily: 'var(--font-space-mono), monospace' }}
            >
              <Filter className="w-3 h-3" /> FILTERS
            </button>
          </div>
          
          {/* Filter bar */}
          {showFilters && (
            <div className="px-4 py-3 border-t-[2px] border-black bg-[var(--gray-100)] flex flex-wrap items-center gap-2">
              <span className="text-xs text-[var(--gray-500)] mr-2" style={{ fontFamily: 'var(--font-space-mono), monospace' }}>
                Show:
              </span>
              <button
                onClick={() => setProjectFilter('active')}
                className={cn(
                  "px-3 py-1 text-xs border-[2px] border-black rounded-lg transition-all cursor-pointer",
                  projectFilter === 'active' 
                    ? "bg-[var(--brand-blue)] text-white" 
                    : "bg-white text-[var(--gray-600)] hover:bg-[var(--gray-200)]"
                )}
                style={{ fontFamily: 'var(--font-space-mono), monospace' }}
              >
                Active
              </button>
              <button
                onClick={() => setProjectFilter('archived')}
                className={cn(
                  "px-3 py-1 text-xs border-[2px] border-black rounded-lg transition-all cursor-pointer",
                  projectFilter === 'archived' 
                    ? "bg-[var(--gray-600)] text-white" 
                    : "bg-white text-[var(--gray-600)] hover:bg-[var(--gray-200)]"
                )}
                style={{ fontFamily: 'var(--font-space-mono), monospace' }}
              >
                Archived
              </button>
              <button
                onClick={() => setProjectFilter('all')}
                className={cn(
                  "px-3 py-1 text-xs border-[2px] border-black rounded-lg transition-all cursor-pointer",
                  projectFilter === 'all' 
                    ? "bg-[var(--brand-red)] text-white" 
                    : "bg-white text-[var(--gray-600)] hover:bg-[var(--gray-200)]"
                )}
                style={{ fontFamily: 'var(--font-space-mono), monospace' }}
              >
                All
              </button>
              
              <div className="w-px h-6 bg-[var(--gray-300)] mx-2" />
              
              <span className="text-xs text-[var(--gray-500)] mr-2" style={{ fontFamily: 'var(--font-space-mono), monospace' }}>
                Category:
              </span>
              {projectCategories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setProjectFilter(cat.id)}
                  className={cn(
                    "px-3 py-1 text-xs border-[2px] border-black rounded-lg transition-all cursor-pointer",
                    projectFilter === cat.id 
                      ? "bg-[var(--brand-yellow)] text-black" 
                      : "bg-white text-[var(--gray-600)] hover:bg-[var(--gray-200)]"
                  )}
                  style={{ fontFamily: 'var(--font-space-mono), monospace' }}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Projects by category */}
        <div className="space-y-6">
          {/* Projects with categories */}
          {projectsByCategory.map(cat => {
            if (cat.projects.length === 0) return null;
            return (
              <div key={cat.id}>
                <CategoryHeader name={cat.name} count={cat.projects.length} categoryId={cat.id} />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {cat.projects.map(project => (
                    <ProjectCard key={project.id} project={project} />
                  ))}
                </div>
              </div>
            );
          })}
          
          {/* Uncategorized projects */}
          {uncategorizedProjects.length > 0 && (
            <div>
              <div className="bg-black px-4 py-3 rounded-lg mb-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-[var(--brand-yellow)]" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
                    NO CATEGORY
                  </span>
                  <span className="text-xs text-white/60" style={{ fontFamily: 'var(--font-space-mono), monospace' }}>
                    {uncategorizedProjects.length} {uncategorizedProjects.length === 1 ? 'project' : 'projects'}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {uncategorizedProjects.map(project => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
            </div>
          )}
          
          {/* Empty state */}
          {filteredProjects.length === 0 && (
            <div className="bg-white border-[2px] border-black rounded-lg p-8 text-center">
              <Archive className="w-12 h-12 mx-auto mb-3 text-[var(--gray-300)]" />
              <p className="text-[var(--gray-400)]" style={{ fontFamily: 'var(--font-space-mono), monospace' }}>
                {projectFilter === 'archived' 
                  ? 'No archived projects yet' 
                  : projectFilter === 'all' 
                    ? 'No projects found'
                    : projectFilter.startsWith('cat-')
                      ? 'No projects in this category'
                      : 'No active projects'}
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Calculate stats for selected project
  const stats = {
    total: projectTasks.length,
    todo: projectTasks.filter(t => t.status === 'todo').length,
    doing: projectTasks.filter(t => t.status === 'doing').length,
    done: projectTasks.filter(t => t.status === 'done').length,
    review: projectTasks.filter(t => t.status === 'review').length,
    high: projectTasks.filter(t => t.priority === 'high').length,
  };

  const handleBack = () => {
    setSelectedProjectId(null);
  };

  const handleEditProject = () => {
    if (selectedProjectId) {
      setEditingProjectId(selectedProjectId);
      setProjectModalOpen(true);
    }
  };

  // List Item Component
  const TaskListItem = ({ task }: { task: Task }) => {
    const duration = formatDuration(task.durationHours, task.durationMinutes);
    
    const handleQuickMove = (newStatus: Task['status']) => {
      updateTask(task.id, { status: newStatus });
      toast.success(`Moved to ${newStatus}`);
    };

    return (
      <div className="flex items-center gap-4 p-3 border-b-[1px] border-[var(--gray-200)] hover:bg-[var(--gray-100)] transition-colors group">
        {/* Status indicator */}
        <div
          onClick={() => handleQuickMove(task.status === 'done' ? 'todo' : 'done')}
          className={cn(
            "w-5 h-5 rounded-full border-2 cursor-pointer flex items-center justify-center flex-shrink-0 transition-all",
            task.status === 'done' ? "bg-[#22c55e] border-[#22c55e] text-white" : 
            task.status === 'doing' ? "bg-[var(--brand-yellow)] border-[var(--brand-yellow)]" :
            task.status === 'review' ? "bg-[var(--brand-red)] border-[var(--brand-red)]" :
            "bg-white border-[var(--gray-300)]"
          )}
        >
          {task.status === 'done' && <CheckCircle className="w-3 h-3" />}
        </div>
        
        {/* Title & Meta */}
        <div className="flex-1 min-w-0">
          <div className={cn(
            "font-medium text-sm truncate",
            task.status === 'done' && "line-through text-[var(--gray-400)]"
          )}>
            {task.title}
          </div>
          <div className="flex items-center gap-2 text-[10px] text-[var(--gray-500)] mt-0.5" style={{ fontFamily: 'var(--font-space-mono), monospace' }}>
            <Clock className="w-3 h-3" /> {duration}
            {task.due && task.due !== 'idk yet' && (
              <>
                <span>•</span>
                <Calendar className="w-3 h-3" /> {task.due}
              </>
            )}
            {task.due === 'idk yet' && (
              <>
                <span>•</span>
                <span className="text-[var(--brand-yellow)]">idk yet</span>
              </>
            )}
          </div>
        </div>
        
        {/* Priority */}
        <span
          className={cn(
            "text-[9px] font-bold px-2 py-0.5 rounded border-[1.5px] border-black uppercase",
            task.priority === 'high' && "bg-[var(--brand-red)] text-white",
            task.priority === 'medium' && "bg-[var(--brand-yellow)] text-black",
            task.priority === 'low' && "bg-[var(--gray-200)] text-[var(--gray-600)]"
          )}
          style={{ fontFamily: 'var(--font-space-mono), monospace' }}
        >
          {task.priority}
        </span>
        
        {/* Tags */}
        <div className="hidden md:flex gap-1">
          {task.tags.slice(0, 2).map(tag => (
            <span
              key={tag}
              className="text-[9px] px-1.5 py-0.5 bg-[var(--gray-100)] rounded"
              style={{ fontFamily: 'var(--font-space-mono), monospace' }}
            >
              {tag}
            </span>
          ))}
        </div>
        
        {/* Actions */}
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {task.status !== 'doing' && (
            <button
              onClick={() => handleQuickMove('doing')}
              className="text-[9px] px-2 py-1 bg-[var(--brand-blue)] text-white rounded border-[1.5px] border-black"
              style={{ fontFamily: 'var(--font-space-mono), monospace' }}
            >
              START
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-[1100px] mx-auto">
      {/* Header */}
      <div 
        className="bg-white border-[2px] border-black rounded-lg shadow-[6px_6px_0_black] overflow-hidden mb-4"
        style={{ borderLeft: `6px solid ${colorMap[selectedProject.color]}` }}
      >
        <div className="bg-black px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={handleBack}
              className="flex items-center gap-1 text-[10px] px-2.5 py-1.5 bg-white/10 text-white border border-white/20 rounded cursor-pointer transition-all hover:bg-white/20"
              style={{ fontFamily: 'var(--font-space-mono), monospace' }}
            >
              <ArrowLeft className="w-3 h-3" /> BACK
            </button>
            <span className="text-xl">{selectedProject.icon}</span>
            <h2
              className="text-xl text-[var(--brand-yellow)] tracking-wide"
              style={{ fontFamily: 'Bebas Neue, sans-serif' }}
            >
              {selectedProject.name}
            </h2>
            <button
              onClick={handleEditProject}
              className="p-1.5 text-white/60 hover:text-white hover:bg-white/10 rounded transition-all cursor-pointer"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
          </div>
          
          <div className="flex items-center gap-2">
            {/* View Toggle */}
            <div className="flex items-center gap-1 bg-white/10 rounded-lg p-1">
              <button
                onClick={() => setViewMode('modular')}
                className={cn(
                  "p-1.5 rounded transition-all",
                  viewMode === 'modular' ? "bg-[var(--brand-yellow)] text-black" : "text-white hover:bg-white/10"
                )}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={cn(
                  "p-1.5 rounded transition-all",
                  viewMode === 'list' ? "bg-[var(--brand-yellow)] text-black" : "text-white hover:bg-white/10"
                )}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
            
            {/* New Task Button */}
            <button
              onClick={handleNewTaskFromProject}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[var(--brand-yellow)] text-black text-xs font-bold border-[2px] border-black rounded-lg hover:bg-[var(--brand-yellow-dark)] transition-all cursor-pointer btn-shine"
              style={{ fontFamily: 'var(--font-space-mono), monospace' }}
            >
              <Plus className="w-3.5 h-3.5" /> NEW TASK
            </button>
          </div>
        </div>
        
        {/* Stats Bar */}
        <div className="px-4 py-3 flex items-center gap-6 border-t-[2px] border-black bg-[var(--gray-100)]">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[var(--gray-400)]" />
            <span className="text-xs" style={{ fontFamily: 'var(--font-space-mono), monospace' }}>
              <span className="font-bold">{stats.total}</span> Total
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[var(--brand-blue)]" />
            <span className="text-xs" style={{ fontFamily: 'var(--font-space-mono), monospace' }}>
              <span className="font-bold">{stats.todo}</span> To Do
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[var(--brand-yellow)]" />
            <span className="text-xs" style={{ fontFamily: 'var(--font-space-mono), monospace' }}>
              <span className="font-bold">{stats.doing}</span> In Progress
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[var(--brand-red)]" />
            <span className="text-xs" style={{ fontFamily: 'var(--font-space-mono), monospace' }}>
              <span className="font-bold">{stats.review}</span> Review
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#22c55e]" />
            <span className="text-xs" style={{ fontFamily: 'var(--font-space-mono), monospace' }}>
              <span className="font-bold">{stats.done}</span> Done
            </span>
          </div>
          {stats.high > 0 && (
            <div className="flex items-center gap-2 ml-auto">
              <AlertCircle className="w-4 h-4 text-[var(--brand-red)]" />
              <span className="text-xs text-[var(--brand-red)] font-bold" style={{ fontFamily: 'var(--font-space-mono), monospace' }}>
                {stats.high} High Priority
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      {projectTasks.length === 0 ? (
        <div className="bg-white border-[2px] border-black rounded-lg p-8 text-center">
          <p className="text-[var(--gray-400)] mb-4" style={{ fontFamily: 'var(--font-space-mono), monospace' }}>
            No tasks in this project yet
          </p>
          <button
            onClick={handleNewTaskFromProject}
            className="px-4 py-2 bg-[var(--brand-yellow)] text-black text-xs font-bold border-[2px] border-black rounded-lg hover:bg-[var(--brand-yellow-dark)] transition-all cursor-pointer btn-shine"
            style={{ fontFamily: 'var(--font-space-mono), monospace' }}
          >
            <Plus className="w-3.5 h-3.5 inline mr-1.5" /> CREATE FIRST TASK
          </button>
        </div>
      ) : viewMode === 'modular' ? (
        /* Modular View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projectTasks.map(task => (
            <TaskCard key={task.id} task={task} />
          ))}
        </div>
      ) : (
        /* List View */
        <div className="bg-white border-[2px] border-black rounded-lg shadow-[4px_4px_0_black] overflow-hidden">
          <div className="divide-y divide-[var(--gray-200)]">
            {projectTasks
              .sort((a, b) => {
                const statusOrder = { doing: 0, todo: 1, review: 2, done: 3 };
                return statusOrder[a.status] - statusOrder[b.status];
              })
              .map(task => (
                <TaskListItem key={task.id} task={task} />
              ))}
          </div>
        </div>
      )}

      {/* Project Documents Section */}
      {projectDocuments.length > 0 && (
        <div className="mt-6">
          <h3
            className="text-lg tracking-wide mb-3"
            style={{ fontFamily: 'Bebas Neue, sans-serif' }}
          >
            DOCUMENTS ({projectDocuments.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {projectDocuments.map(doc => {
              const wordCount = calculateWordCount(doc.blocks);
              return (
                <div
                  key={doc.id}
                  onClick={() => {
                    setSelectedDocumentId(doc.id);
                    setCurrentView('documents');
                  }}
                  className="bg-white border-[2px] border-black rounded-lg p-4 cursor-pointer transition-all duration-200 hover:shadow-[4px_4px_0_black] hover:translate-y-[-2px] group"
                >
                  <div className="flex items-start gap-3">
                    <FileText className="w-5 h-5 text-[var(--brand-blue)] mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm group-hover:text-[var(--brand-blue)] transition-colors truncate">
                        {doc.title || 'Untitled Document'}
                      </h4>
                      <div className="flex items-center gap-2 text-[10px] text-[var(--gray-500)] mt-1" style={{ fontFamily: 'var(--font-space-mono), monospace' }}>
                        <span>{formatRelativeTime(doc.updatedAt)}</span>
                        <span>•</span>
                        <span>{wordCount} words</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
