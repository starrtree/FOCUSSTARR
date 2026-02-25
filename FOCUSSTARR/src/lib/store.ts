import { create } from 'zustand';
import { Task, Project, Block, ViewType, AppState, Subtask, Document, BlockType, ProjectCategory } from './types';

// UUID generator
const uuid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36);

// Initial tasks data - motivational templates
const initialTasks: Task[] = [
  {
    id: 't1',
    title: 'Define Your North Star',
    project: 'Your Journey',
    priority: 'high',
    status: 'doing',
    due: '',
    durationHours: 0,
    durationMinutes: 30,
    tags: ['Focus', 'Vision'],
    progress: 0,
    notes: "What is the one thing that, if accomplished, would make everything else easier? Write your North Star here and let it guide your focus.",
    subtasks: [
      { id: uuid(), text: "Clarify your #1 priority", done: false },
      { id: uuid(), text: "Break it into actionable steps", done: false },
      { id: uuid(), text: "Commit to showing up daily", done: false }
    ],
    isArchived: false
  },
];

// Initial projects data - single template project
const initialProjects: Project[] = [
  { id: 'p1', name: 'Your Journey', color: 'yellow', icon: '⭐', tasks: 1, completed: 0, due: 'Now', order: 0, isArchived: false, category: null },
];

// Initial project categories
const initialProjectCategories: ProjectCategory[] = [
  { id: 'cat-focus', name: 'Focus Areas', order: 0 },
  { id: 'cat-energy', name: 'Energy Projects', order: 1 },
  { id: 'cat-magnet', name: 'Magnet Goals', order: 2 },
];

// Initial tags - thematic and motivational
const initialTags = ['Focus', 'Vision', 'Energy', 'Momentum', 'Breakthrough', 'Daily', 'Priority', 'Flow', 'Power'];

// Helper to create a block
const createBlock = (type: BlockType, content: string = '', meta: Block['meta'] = {}): Block => ({
  id: uuid(),
  type,
  content,
  meta,
});

// Initial documents - single template document
const initialDocuments: Document[] = [
  {
    id: 'd1',
    title: '✨ Your Vision Board',
    projectId: 'p1',
    blocks: [
      createBlock('h1', '✨ Your Vision Board'),
      createBlock('text', 'This is your space to dream, plan, and manifest. Use this document to capture your vision, track your energy, and stay aligned with your North Star.'),
      createBlock('divider'),
      createBlock('h2', '🌟 What drives you?'),
      createBlock('text', 'Write about your core motivations and what success means to you...'),
      createBlock('h2', '⚡ Energy Audit'),
      createBlock('text', 'What gives you energy? What drains it? List them here...'),
      createBlock('h2', '🧲 Your Magnet Goals'),
      createBlock('text', 'The goals that pull you forward effortlessly...'),
      createBlock('divider'),
      createBlock('callout', 'Remember: You are the architect of your reality. Every small action compounds into something magnificent.', { emoji: '⭐', bgColor: 'yellow' }),
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    wordCount: 60,
    isArchived: false,
  },
];

export const useStore = create<AppState>((set, get) => ({
  currentView: 'dashboard',
  selectedProjectId: null,
  selectedDocumentId: null,
  tasks: initialTasks,
  projects: initialProjects,
  projectCategories: initialProjectCategories,
  projectFilter: 'active',
  tags: initialTags,
  documents: initialDocuments,
  editingTaskId: null,
  isModalOpen: false,
  searchQuery: '',
  isProjectModalOpen: false,
  editingProjectId: null,
  isSettingsOpen: false,
  isSearchOpen: false,
  theme: 'light',
  soundEnabled: true,
  autoSetProjectForTask: null,

  // Actions
  setCurrentView: (view) => set({ currentView: view }),
  setSelectedProjectId: (id) => set({ selectedProjectId: id }),
  setSelectedDocumentId: (id) => set({ selectedDocumentId: id }),

  addTask: (task) => set((state) => ({ tasks: [...state.tasks, task] })),

  updateTask: (id, updates) => set((state) => ({
    tasks: state.tasks.map((task) =>
      task.id === id ? { ...task, ...updates } : task
    ),
  })),

  deleteTask: (id) => set((state) => ({
    tasks: state.tasks.filter((task) => task.id !== id),
  })),

  archiveTask: (id) => set((state) => ({
    tasks: state.tasks.map((task) =>
      task.id === id ? { ...task, isArchived: true } : task
    ),
  })),

  restoreTask: (id) => set((state) => ({
    tasks: state.tasks.map((task) =>
      task.id === id ? { ...task, isArchived: false } : task
    ),
  })),

  toggleSubtask: (taskId, subtaskId) => set((state) => {
    const tasks = state.tasks.map((task) => {
      if (task.id === taskId) {
        const newSubtasks = task.subtasks.map(st => 
          st.id === subtaskId ? { ...st, done: !st.done } : st
        );
        const doneCount = newSubtasks.filter(s => s.done).length;
        const progress = newSubtasks.length > 0 
          ? Math.round((doneCount / newSubtasks.length) * 100) 
          : task.progress;
        return { ...task, subtasks: newSubtasks, progress };
      }
      return task;
    });
    return { tasks };
  }),

  addSubtask: (taskId, text) => set((state) => {
    const tasks = state.tasks.map((task) => {
      if (task.id === taskId && text.trim()) {
        const newSubtask: Subtask = {
          id: uuid(),
          text: text.trim(),
          done: false
        };
        const newSubtasks = [...task.subtasks, newSubtask];
        const doneCount = newSubtasks.filter(s => s.done).length;
        const progress = Math.round((doneCount / newSubtasks.length) * 100);
        return { ...task, subtasks: newSubtasks, progress };
      }
      return task;
    });
    return { tasks };
  }),

  updateSubtask: (taskId, subtaskId, text) => set((state) => {
    const tasks = state.tasks.map((task) => {
      if (task.id === taskId) {
        const newSubtasks = task.subtasks.map(st =>
          st.id === subtaskId ? { ...st, text } : st
        );
        return { ...task, subtasks: newSubtasks };
      }
      return task;
    });
    return { tasks };
  }),

  deleteSubtask: (taskId, subtaskId) => set((state) => {
    const tasks = state.tasks.map((task) => {
      if (task.id === taskId) {
        const newSubtasks = task.subtasks.filter(st => st.id !== subtaskId);
        const doneCount = newSubtasks.filter(s => s.done).length;
        const progress = newSubtasks.length > 0 
          ? Math.round((doneCount / newSubtasks.length) * 100) 
          : 0;
        return { ...task, subtasks: newSubtasks, progress };
      }
      return task;
    });
    return { tasks };
  }),

  setEditingTaskId: (id) => set({ editingTaskId: id }),

  setModalOpen: (open) => set({ isModalOpen: open }),

  setSearchQuery: (query) => set({ searchQuery: query }),

  // Document actions
  createDocument: (projectId) => {
    const newDoc: Document = {
      id: uuid(),
      title: 'Untitled Document',
      projectId: projectId || null,
      blocks: [
        createBlock('h1', ''),
        createBlock('text', ''),
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      wordCount: 0,
      isArchived: false,
    };
    set((state) => ({ 
      documents: [...state.documents, newDoc],
      selectedDocumentId: newDoc.id,
    }));
  },

  updateDocument: (id, updates) => set((state) => ({
    documents: state.documents.map((doc) =>
      doc.id === id ? { ...doc, ...updates, updatedAt: new Date().toISOString() } : doc
    ),
  })),

  deleteDocument: (id) => set((state) => ({
    documents: state.documents.filter(doc => doc.id !== id),
    selectedDocumentId: state.selectedDocumentId === id ? null : state.selectedDocumentId,
  })),

  archiveDocument: (id) => set((state) => ({
    documents: state.documents.map((doc) =>
      doc.id === id ? { ...doc, isArchived: true, updatedAt: new Date().toISOString() } : doc
    ),
  })),

  restoreDocument: (id) => set((state) => ({
    documents: state.documents.map((doc) =>
      doc.id === id ? { ...doc, isArchived: false, updatedAt: new Date().toISOString() } : doc
    ),
  })),

  duplicateDocument: (id) => set((state) => {
    const original = state.documents.find(d => d.id === id);
    if (!original) return state;
    
    const newDoc: Document = {
      ...original,
      id: uuid(),
      title: `${original.title} (Copy)`,
      blocks: original.blocks.map(b => ({ ...b, id: uuid() })),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return { 
      documents: [...state.documents, newDoc],
      selectedDocumentId: newDoc.id,
    };
  }),

  // Block actions
  addBlock: (docId, block, afterBlockId) => set((state) => ({
    documents: state.documents.map((doc) => {
      if (doc.id !== docId) return doc;
      
      if (afterBlockId) {
        const index = doc.blocks.findIndex(b => b.id === afterBlockId);
        const newBlocks = [...doc.blocks];
        newBlocks.splice(index + 1, 0, block);
        return { ...doc, blocks: newBlocks, updatedAt: new Date().toISOString() };
      }
      return { ...doc, blocks: [...doc.blocks, block], updatedAt: new Date().toISOString() };
    }),
  })),

  updateBlock: (docId, blockId, updates) => set((state) => ({
    documents: state.documents.map((doc) => {
      if (doc.id !== docId) return doc;
      return {
        ...doc,
        blocks: doc.blocks.map(b => 
          b.id === blockId ? { ...b, ...updates } : b
        ),
        updatedAt: new Date().toISOString(),
      };
    }),
  })),

  deleteBlock: (docId, blockId) => set((state) => ({
    documents: state.documents.map((doc) => {
      if (doc.id !== docId) return doc;
      return {
        ...doc,
        blocks: doc.blocks.filter(b => b.id !== blockId),
        updatedAt: new Date().toISOString(),
      };
    }),
  })),

  moveBlock: (docId, blockId, newIndex) => set((state) => ({
    documents: state.documents.map((doc) => {
      if (doc.id !== docId) return doc;
      
      const blocks = [...doc.blocks];
      const currentIndex = blocks.findIndex(b => b.id === blockId);
      if (currentIndex === -1) return doc;
      
      const [block] = blocks.splice(currentIndex, 1);
      blocks.splice(newIndex, 0, block);
      
      return { ...doc, blocks, updatedAt: new Date().toISOString() };
    }),
  })),

  // Project actions
  addProject: (project) => set((state) => ({ 
    projects: [...state.projects, project] 
  })),

  updateProject: (id, updates) => set((state) => ({
    projects: state.projects.map((project) =>
      project.id === id ? { ...project, ...updates } : project
    ),
  })),

  deleteProject: (id) => set((state) => ({
    projects: state.projects.filter((project) => project.id !== id),
    selectedProjectId: state.selectedProjectId === id ? null : state.selectedProjectId,
  })),

  archiveProject: (id) => set((state) => ({
    projects: state.projects.map((project) =>
      project.id === id ? { ...project, isArchived: true } : project
    ),
    selectedProjectId: state.selectedProjectId === id ? null : state.selectedProjectId,
  })),

  restoreProject: (id) => set((state) => ({
    projects: state.projects.map((project) =>
      project.id === id ? { ...project, isArchived: false } : project
    ),
  })),

  reorderProjects: (startIndex, endIndex) => set((state) => {
    const projects = [...state.projects];
    const [removed] = projects.splice(startIndex, 1);
    projects.splice(endIndex, 0, removed);
    // Update order property
    const reordered = projects.map((p, i) => ({ ...p, order: i }));
    return { projects: reordered };
  }),

  // Modal setters
  setProjectModalOpen: (open) => set({ isProjectModalOpen: open }),
  setEditingProjectId: (id) => set({ editingProjectId: id }),
  
  // Settings
  setSettingsOpen: (open) => set({ isSettingsOpen: open }),
  setTheme: (theme) => set({ theme }),
  setSoundEnabled: (enabled) => set({ soundEnabled: enabled }),
  
  // Search
  setSearchOpen: (open) => set({ isSearchOpen: open }),
  
  // Project category actions
  addProjectCategory: (name) => set((state) => ({
    projectCategories: [...state.projectCategories, {
      id: `cat-${uuid()}`,
      name,
      order: state.projectCategories.length,
    }],
  })),
  
  updateProjectCategory: (id, name) => set((state) => ({
    projectCategories: state.projectCategories.map(cat =>
      cat.id === id ? { ...cat, name } : cat
    ),
  })),
  
  deleteProjectCategory: (id) => set((state) => ({
    projectCategories: state.projectCategories.filter(cat => cat.id !== id),
    // Remove category from projects but don't delete projects
    projects: state.projects.map(p => 
      p.category === id ? { ...p, category: null } : p
    ),
  })),
  
  setProjectFilter: (filter) => set({ projectFilter: filter }),
  
  // Auto-set project for new tasks
  setAutoSetProjectForTask: (projectId) => set({ autoSetProjectForTask: projectId }),
}));

// Helper to create a new project
export const createNewProject = (overrides: Partial<Project> = {}): Project => ({
  id: uuid(),
  name: '',
  color: 'blue',
  icon: '📁',
  tasks: 0,
  completed: 0,
  due: 'Ongoing',
  order: 0,
  isArchived: false,
  category: null,
  ...overrides,
});

// Utility functions
export const createNewTask = (overrides: Partial<Task> = {}): Task => ({
  id: uuid(),
  title: '',
  project: 'Your Journey',
  priority: 'medium',
  status: 'todo',
  due: '',
  durationHours: 0,
  durationMinutes: 30,
  tags: [],
  progress: 0,
  notes: '',
  subtasks: [],
  isArchived: false,
  ...overrides,
});

export const createNewBlock = (type: BlockType): Block => ({
  id: uuid(),
  type,
  content: '',
  meta: {},
});

// Helper to format duration
export const formatDuration = (hours: number, minutes: number): string => {
  if (hours === 0 && minutes === 0) return '--';
  const parts = [];
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  return parts.join(' ') || '--';
};

// Helper to calculate word count
export const calculateWordCount = (blocks: Block[]): number => {
  const text = blocks
    .filter(b => ['h1', 'h2', 'h3', 'text', 'comment', 'callout'].includes(b.type))
    .map(b => b.content)
    .join(' ');
  return text.trim().split(/\s+/).filter(w => w.length > 0).length;
};

// Helper to format relative time
export const formatRelativeTime = (dateStr: string): string => {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  return date.toLocaleDateString();
};

// Helper to estimate reading time
export const estimateReadTime = (wordCount: number): string => {
  const mins = Math.ceil(wordCount / 200);
  return `~${mins} min read`;
};
