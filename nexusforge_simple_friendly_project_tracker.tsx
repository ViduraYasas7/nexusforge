import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Plus,
  CheckCircle2,
  Circle,
  Clock,
  Folder,
  Linkedin,
  Copy,
  Trash2,
  Edit3,
  ExternalLink,
  Github,
  Sparkles,
  LayoutGrid,
  ListChecks,
  Search,
  Download,
  Upload,
  X,
  ArrowRight,
  Layers,
  Award,
  Check
} from 'lucide-react';

// --- SIMPLE, EASY-TO-UNDERSTAND INITIAL DATA ---
const INITIAL_PROJECTS = [
  {
    id: 'proj-1',
    name: 'Real-Time Chat Application',
    summary: 'A fast, modern messaging web app with instant room creation, typing indicators, and file sharing.',
    problemSolved: 'Built to provide a lightweight, zero-lag communication tool for study groups and remote teams.',
    keyResult: 'Supports 500+ active users with <20ms message delivery',
    status: 'Completed',
    techStack: ['React', 'Node.js', 'Socket.io', 'Tailwind CSS', 'MongoDB'],
    howItWorks: {
      frontend: 'React + Tailwind CSS responsive chat interface',
      backend: 'Node.js & Express API with Socket.io WebSockets',
      database: 'MongoDB for message history & user profiles'
    },
    githubUrl: 'https://github.com/yourusername/real-time-chat',
    liveUrl: 'https://chat-demo.example.com',
    role: 'Full-Stack Developer'
  },
  {
    id: 'proj-2',
    name: 'StoryHub Publishing Platform',
    summary: 'An interactive storytelling and blogging platform where writers can publish chapters and get reader feedback.',
    problemSolved: 'Gave independent writers a clean, distraction-free reading and publishing experience.',
    keyResult: '100% Lighthouse SEO score & fast mobile reading view',
    status: 'In Progress',
    techStack: ['Next.js', 'TypeScript', 'PostgreSQL', 'Prisma', 'Tailwind CSS'],
    howItWorks: {
      frontend: 'Next.js App Router with rich-text markdown editor',
      backend: 'Server Actions & REST API endpoints with Auth',
      database: 'PostgreSQL database managed with Prisma ORM'
    },
    githubUrl: 'https://github.com/yourusername/storyhub',
    liveUrl: 'https://storyhub.example.com',
    role: 'Creator & Lead Developer'
  },
  {
    id: 'proj-3',
    name: 'GasMate Delivery Tracker',
    summary: 'Smart utility booking and cylinder delivery tracking system with live order status updates.',
    problemSolved: 'Simplified scheduling and tracking local utility deliveries without phone call delays.',
    keyResult: 'Reduced booking steps from 6 screens down to 2 clicks',
    status: 'Completed',
    techStack: ['React', 'Firebase', 'Google Maps API', 'Tailwind CSS'],
    howItWorks: {
      frontend: 'Mobile-first React web app with live map pins',
      backend: 'Firebase Cloud Functions & real-time notifications',
      database: 'Firestore NoSQL real-time order database'
    },
    githubUrl: 'https://github.com/yourusername/gasmate',
    liveUrl: 'https://gasmate.example.com',
    role: 'Frontend & Mobile Developer'
  }
];

const INITIAL_TASKS = [
  {
    id: 'task-1',
    projectId: 'proj-1',
    title: 'Built instant WebSocket messaging with live typing indicators',
    result: 'Messages appear in under 20ms without refreshing the page',
    status: 'Done',
    priority: 'High',
    category: 'Backend'
  },
  {
    id: 'task-2',
    projectId: 'proj-1',
    title: 'Designed responsive dark & light mode chat interface',
    result: 'Works smoothly on both mobile phones and desktop screens',
    status: 'Done',
    priority: 'Medium',
    category: 'Frontend'
  },
  {
    id: 'task-3',
    projectId: 'proj-1',
    title: 'Added secure JWT user login and private room invites',
    result: 'Protected private conversations with encrypted session tokens',
    status: 'Done',
    priority: 'High',
    category: 'Security'
  },
  {
    id: 'task-4',
    projectId: 'proj-2',
    title: 'Created distraction-free chapter editor with auto-save',
    result: 'Prevents writers from losing drafts if their browser closes',
    status: 'Done',
    priority: 'High',
    category: 'Frontend'
  },
  {
    id: 'task-5',
    projectId: 'proj-2',
    title: 'Set up PostgreSQL database schema for stories, tags, and comments',
    result: 'Fast search and filtering by genre and reading time',
    status: 'In Progress',
    priority: 'High',
    category: 'Database'
  },
  {
    id: 'task-6',
    projectId: 'proj-2',
    title: 'Add one-click social sharing card for published stories',
    result: 'Helps authors share their work on LinkedIn and X',
    status: 'To Do',
    priority: 'Medium',
    category: 'Feature'
  },
  {
    id: 'task-7',
    projectId: 'proj-3',
    title: 'Integrated live delivery status stepper (Booked -> Out for Delivery -> Delivered)',
    result: 'Customers can see exact order progress in real time',
    status: 'Done',
    priority: 'High',
    category: 'Frontend'
  },
  {
    id: 'task-8',
    projectId: 'proj-3',
    title: 'Connected Firebase authentication and order history',
    result: '1-click reorder for returning customers',
    status: 'Done',
    priority: 'Medium',
    category: 'Backend'
  }
];

const STATUS_OPTIONS = ['To Do', 'In Progress', 'Done'];
const PRIORITY_OPTIONS = ['Low', 'Medium', 'High'];
const CATEGORY_OPTIONS = ['Frontend', 'Backend', 'Database', 'Feature', 'UI/UX', 'Security'];

export default function App() {
  // --- STATE WITH LOCALSTORAGE ---
  const [projects, setProjects] = useState(() => {
    try {
      const saved = localStorage.getItem('nexusforge_simple_projects');
      return saved ? JSON.parse(saved) : INITIAL_PROJECTS;
    } catch {
      return INITIAL_PROJECTS;
    }
  });

  const [tasks, setTasks] = useState(() => {
    try {
      const saved = localStorage.getItem('nexusforge_simple_tasks');
      return saved ? JSON.parse(saved) : INITIAL_TASKS;
    } catch {
      return INITIAL_TASKS;
    }
  });

  // Simple Navigation: Active Project + 3 Clear Tabs
  const [activeProjectId, setActiveProjectId] = useState(projects[0]?.id || 'proj-1');
  const [activeTab, setActiveTab] = useState('tasks'); // 'tasks' | 'linkedin' | 'overview'
  const [taskViewMode, setTaskViewMode] = useState('board'); // 'board' | 'list'
  const [searchQuery, setSearchQuery] = useState('');

  // Quick Add Task Bar State
  const [quickTaskTitle, setQuickTaskTitle] = useState('');
  const [quickTaskResult, setQuickTaskResult] = useState('');
  const [quickTaskStatus, setQuickTaskStatus] = useState('Done');

  // Modals for Editing Project or Task
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  // LinkedIn Generator State
  const [linkedinFormat, setLinkedinFormat] = useState('post'); // 'post' | 'profile'
  const [customLinkedinText, setCustomLinkedinText] = useState('');
  const [isTextEdited, setIsTextEdited] = useState(false);
  const [toast, setToast] = useState(null);

  const fileInputRef = useRef(null);

  useEffect(() => {
    localStorage.setItem('nexusforge_simple_projects', JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    localStorage.setItem('nexusforge_simple_tasks', JSON.stringify(tasks));
  }, [tasks]);

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 2600);
  };

  // Current selected project
  const currentProject = useMemo(() => {
    return projects.find((p) => p.id === activeProjectId) || projects[0];
  }, [projects, activeProjectId]);

  // Tasks for the selected project
  const projectTasks = useMemo(() => {
    if (!currentProject) return [];
    return tasks.filter((t) => {
      const matchesProject = t.projectId === currentProject.id;
      const matchesSearch =
        !searchQuery.trim() ||
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.result && t.result.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesProject && matchesSearch;
    });
  }, [tasks, currentProject, searchQuery]);

  // Reset custom LinkedIn edit when switching projects or format
  useEffect(() => {
    setIsTextEdited(false);
  }, [activeProjectId, linkedinFormat, tasks]);

  // --- AUTO-GENERATED LINKEDIN TEXT (CLEAN & READY TO COPY) ---
  const generatedLinkedinText = useMemo(() => {
    if (!currentProject) return '';
    const doneTasks = tasks.filter(
      (t) => t.projectId === currentProject.id && t.status === 'Done'
    );
    const tasksToUse = doneTasks.length > 0 ? doneTasks : tasks.filter((t) => t.projectId === currentProject.id);

    const techList = (currentProject.techStack || []).join(', ');
    const hashtags = (currentProject.techStack || [])
      .map((t) => `#${t.replace(/[^a-zA-Z0-9]/g, '')}`)
      .join(' ');

    if (linkedinFormat === 'post') {
      const bullets = tasksToUse
        .map((t) => `✅ ${t.title}${t.result ? ` — ${t.result}` : ''}`)
        .join('\n');

      return [
        `🚀 Excited to share my project: ${currentProject.name}!`,
        ``,
        `${currentProject.summary}`,
        ``,
        `💡 Why I built it:`,
        `${currentProject.problemSolved}`,
        ``,
        `🛠️ Key Features & What I Built:`,
        `${bullets || '✅ Built full-stack application from scratch'}`,
        ``,
        ...(currentProject.keyResult ? [`📈 Key Highlight: ${currentProject.keyResult}`] : []),
        `💻 Tech Stack: ${techList}`,
        ``,
        ...(currentProject.liveUrl ? [`🌐 Live Demo: ${currentProject.liveUrl}`] : []),
        ...(currentProject.githubUrl ? [`📂 GitHub Code: ${currentProject.githubUrl}`] : []),
        ``,
        `I'd love to hear your thoughts and feedback! 👇`,
        ``,
        `#WebDevelopment #SoftwareEngineering #Portfolio ${hashtags}`
      ].join('\n');
    } else {
      // LinkedIn Profile "Projects" Section Format
      const bullets = tasksToUse
        .map((t) => `• ${t.title}${t.result ? ` (${t.result})` : ''}`)
        .join('\n');

      return [
        `${currentProject.summary}`,
        ``,
        `Problem Solved: ${currentProject.problemSolved}`,
        ...(currentProject.keyResult ? [`Key Achievement: ${currentProject.keyResult}`] : []),
        ``,
        `Key Features Built:`,
        `${bullets}`,
        ``,
        `Technologies Used: ${techList}`,
        ...(currentProject.liveUrl ? [`Live App: ${currentProject.liveUrl}`] : []),
        ...(currentProject.githubUrl ? [`GitHub: ${currentProject.githubUrl}`] : [])
      ].join('\n');
    }
  }, [currentProject, tasks, linkedinFormat]);

  const finalLinkedinText = isTextEdited ? customLinkedinText : generatedLinkedinText;

  // --- SIMPLE HANDLERS ---
  const handleQuickAddTask = (e) => {
    e.preventDefault();
    if (!quickTaskTitle.trim() || !currentProject) return;

    const newTask = {
      id: `task-${Date.now()}`,
      projectId: currentProject.id,
      title: quickTaskTitle.trim(),
      result: quickTaskResult.trim(),
      status: quickTaskStatus,
      priority: 'High',
      category: 'Feature'
    };

    setTasks((prev) => [newTask, ...prev]);
    setQuickTaskTitle('');
    setQuickTaskResult('');
    showToast('Added feature to project!');
  };

  const toggleTaskStatus = (task) => {
    const nextOrder = {
      'To Do': 'In Progress',
      'In Progress': 'Done',
      'Done': 'To Do'
    };
    const nextStatus = nextOrder[task.status] || 'Done';
    setTasks((prev) =>
      prev.map((t) => (t.id === task.id ? { ...t, status: nextStatus } : t))
    );
    showToast(`Moved to "${nextStatus}"`);
  };

  const changeTaskStatusDirect = (taskId, newStatus) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
    );
  };

  const handleDeleteTask = (taskId) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    setIsTaskModalOpen(false);
    showToast('Task deleted');
  };

  const openEditTaskModal = (task) => {
    setEditingTask({ ...task });
    setIsTaskModalOpen(true);
  };

  const handleSaveTaskModal = (e) => {
    e.preventDefault();
    if (!editingTask.title.trim()) return;
    setTasks((prev) =>
      prev.map((t) => (t.id === editingTask.id ? editingTask : t))
    );
    setIsTaskModalOpen(false);
    showToast('Task updated!');
  };

  // Project Modal Handlers
  const openNewProjectModal = () => {
    setEditingProject({
      id: null,
      name: '',
      summary: '',
      problemSolved: '',
      keyResult: '',
      status: 'In Progress',
      techStackInput: 'React, TypeScript, Tailwind CSS, Node.js',
      frontend: '',
      backend: '',
      database: '',
      githubUrl: '',
      liveUrl: '',
      role: 'Full-Stack Developer'
    });
    setIsProjectModalOpen(true);
  };

  const openEditProjectModal = (proj) => {
    setEditingProject({
      ...proj,
      techStackInput: (proj.techStack || []).join(', '),
      frontend: proj.howItWorks?.frontend || '',
      backend: proj.howItWorks?.backend || '',
      database: proj.howItWorks?.database || ''
    });
    setIsProjectModalOpen(true);
  };

  const handleSaveProject = (e) => {
    e.preventDefault();
    if (!editingProject.name.trim()) return;

    const techArray = (editingProject.techStackInput || '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const projectData = {
      id: editingProject.id || `proj-${Date.now()}`,
      name: editingProject.name.trim(),
      summary: editingProject.summary.trim(),
      problemSolved: editingProject.problemSolved.trim(),
      keyResult: editingProject.keyResult.trim(),
      status: editingProject.status || 'In Progress',
      techStack: techArray,
      howItWorks: {
        frontend: editingProject.frontend || 'Frontend User Interface',
        backend: editingProject.backend || 'Backend API & Logic',
        database: editingProject.database || 'Database & Storage'
      },
      githubUrl: editingProject.githubUrl.trim(),
      liveUrl: editingProject.liveUrl.trim(),
      role: editingProject.role.trim() || 'Developer'
    };

    if (editingProject.id) {
      setProjects((prev) =>
        prev.map((p) => (p.id === editingProject.id ? projectData : p))
      );
      showToast('Project updated!');
    } else {
      setProjects((prev) => [...prev, projectData]);
      setActiveProjectId(projectData.id);
      showToast('New project created!');
    }

    setIsProjectModalOpen(false);
  };

  const handleDeleteProject = (projId) => {
    if (projects.length <= 1) {
      showToast('You need at least one project.');
      return;
    }
    const remaining = projects.filter((p) => p.id !== projId);
    setProjects(remaining);
    setTasks((prev) => prev.filter((t) => t.projectId !== projId));
    setActiveProjectId(remaining[0].id);
    setIsProjectModalOpen(false);
    showToast('Project removed');
  };

  // Backup & Restore
  const handleExportJSON = () => {
    const data = JSON.stringify({ projects, tasks }, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'my-linkedin-projects-backup.json';
    a.click();
    URL.revokeObjectURL(url);
    showToast('Backup downloaded!');
  };

  const handleImportJSON = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target.result);
        if (Array.isArray(parsed.projects) && Array.isArray(parsed.tasks)) {
          setProjects(parsed.projects);
          setTasks(parsed.tasks);
          setActiveProjectId(parsed.projects[0]?.id || '');
          showToast('Projects restored!');
        }
      } catch {
        showToast('Invalid backup file');
      }
    };
    reader.readAsText(file);
  };

  const copyToClipboard = (text, label = 'Copied to clipboard!') => {
    navigator.clipboard.writeText(text);
    showToast(label);
  };

  const doneCount = projectTasks.filter((t) => t.status === 'Done').length;
  const progressPercent =
    projectTasks.length > 0 ? Math.round((doneCount / projectTasks.length) * 100) : 0;

  return (
    <div className="min-h-screen bg-[#0B0F17] text-slate-100 flex flex-col md:flex-row font-sans">
      {/* =========================================================
          LEFT SIDEBAR: SIMPLE, CLEAR PROJECT LIST (LIKE LINEAR)
         ========================================================= */}
      <aside className="w-full md:w-72 bg-[#111827] border-b md:border-b-0 md:border-r border-slate-800 flex flex-col justify-between shrink-0">
        <div className="p-4 space-y-5">
          {/* App Brand */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-slate-950 font-bold shadow-md">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <h1 className="font-bold text-base text-white leading-none">
                  NexusForge
                </h1>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Project & LinkedIn Manager
                </p>
              </div>
            </div>
          </div>

          {/* Big, Obvious "+ New Project" Button */}
          <button
            onClick={openNewProjectModal}
            className="w-full py-2.5 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            Add New Project
          </button>

          {/* My Projects List */}
          <div className="space-y-1.5">
            <div className="px-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              My Projects ({projects.length})
            </div>

            <div className="space-y-1">
              {projects.map((proj) => {
                const isSelected = currentProject?.id === proj.id;
                const pTasks = tasks.filter((t) => t.projectId === proj.id);
                const pDone = pTasks.filter((t) => t.status === 'Done').length;

                return (
                  <button
                    key={proj.id}
                    onClick={() => setActiveProjectId(proj.id)}
                    className={`w-full text-left px-3 py-2.5 rounded-xl transition-all flex items-center justify-between gap-2 cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/40 font-semibold'
                        : 'text-slate-300 hover:bg-slate-800/70 hover:text-white border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Folder
                        className={`w-4 h-4 shrink-0 ${
                          isSelected ? 'text-emerald-400' : 'text-slate-400'
                        }`}
                      />
                      <span className="text-xs truncate">{proj.name}</span>
                    </div>
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-slate-900 text-slate-400 shrink-0">
                      {pDone}/{pTasks.length}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Simple Footer Backup Controls */}
        <div className="p-4 border-t border-slate-800 space-y-2 bg-slate-900/40">
          <div className="text-[11px] text-slate-400">
            All changes auto-save in your browser.
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportJSON}
              className="flex-1 py-1.5 px-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" /> Backup
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 py-1.5 px-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5" /> Restore
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleImportJSON}
              className="hidden"
            />
          </div>
        </div>
      </aside>

      {/* =========================================================
          MAIN CONTENT AREA: CLEAN, FAMILIAR & EASY TO NAVIGATE
         ========================================================= */}
      <main className="flex-1 flex flex-col min-w-0">
        {currentProject && (
          <>
            {/* PROJECT HEADER */}
            <header className="bg-[#111827]/70 border-b border-slate-800 px-6 py-5">
              <div className="max-w-5xl mx-auto flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <h2 className="text-xl font-bold text-white">
                      {currentProject.name}
                    </h2>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                      {currentProject.status}
                    </span>
                    <button
                      onClick={() => openEditProjectModal(currentProject)}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs flex items-center gap-1 cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" /> Edit Project Details
                    </button>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-300 max-w-3xl">
                    {currentProject.summary}
                  </p>
                  {/* Tech Stack Tags */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    {(currentProject.techStack || []).map((tech) => (
                      <span
                        key={tech}
                        className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 text-xs border border-slate-700"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Progress Box */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 min-w-[210px] shrink-0">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-slate-400">Completed Tasks</span>
                    <span className="font-bold text-emerald-400">
                      {doneCount} / {projectTasks.length} ({progressPercent}%)
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 transition-all duration-300"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* 3 SIMPLE STEP TABS */}
              <div className="max-w-5xl mx-auto mt-5 flex flex-wrap items-center gap-2 border-t border-slate-800/80 pt-4">
                <button
                  onClick={() => setActiveTab('tasks')}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                    activeTab === 'tasks'
                      ? 'bg-emerald-500 text-slate-950 shadow-md'
                      : 'bg-slate-800/70 text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <ListChecks className="w-4 h-4" />
                  1. Tasks & Features ({projectTasks.length})
                </button>

                <button
                  onClick={() => setActiveTab('linkedin')}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                    activeTab === 'linkedin'
                      ? 'bg-emerald-500 text-slate-950 shadow-md'
                      : 'bg-slate-800/70 text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Linkedin className="w-4 h-4" />
                  2. Copy for LinkedIn
                </button>

                <button
                  onClick={() => setActiveTab('overview')}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                    activeTab === 'overview'
                      ? 'bg-emerald-500 text-slate-950 shadow-md'
                      : 'bg-slate-800/70 text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Sparkles className="w-4 h-4" />
                  3. Project Overview & Links
                </button>
              </div>
            </header>

            {/* BODY CONTENT */}
            <div className="flex-1 p-6 max-w-5xl w-full mx-auto">
              {/* =========================================================
                  TAB 1: TASKS & FEATURES (BOARD OR LIST + 1-CLICK ADD)
                 ========================================================= */}
              {activeTab === 'tasks' && (
                <div className="space-y-6">
                  {/* Super Easy Quick-Add Bar */}
                  <form
                    onSubmit={handleQuickAddTask}
                    className="bg-[#111827] border border-slate-800 rounded-2xl p-4 shadow-lg space-y-3"
                  >
                    <div className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
                      <Plus className="w-4 h-4" />
                      Add a Feature or Task You Built for {currentProject.name}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                      <input
                        type="text"
                        value={quickTaskTitle}
                        onChange={(e) => setQuickTaskTitle(e.target.value)}
                        placeholder="What did you build? (e.g., Added Google login & user profile page)"
                        className="md:col-span-5 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                      />
                      <input
                        type="text"
                        value={quickTaskResult}
                        onChange={(e) => setQuickTaskResult(e.target.value)}
                        placeholder="Result / Benefit (Optional, e.g., Faster sign-in for users)"
                        className="md:col-span-4 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                      />
                      <select
                        value={quickTaskStatus}
                        onChange={(e) => setQuickTaskStatus(e.target.value)}
                        className="md:col-span-1 bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2.5 text-xs text-white focus:outline-none"
                      >
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                      <button
                        type="submit"
                        className="md:col-span-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl px-4 py-2.5 text-xs sm:text-sm flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Plus className="w-4 h-4 stroke-[2.5]" /> Add Task
                      </button>
                    </div>
                  </form>

                  {/* View Switcher & Search */}
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2 bg-slate-900 p-1 rounded-xl border border-slate-800">
                      <button
                        onClick={() => setTaskViewMode('board')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer ${
                          taskViewMode === 'board'
                            ? 'bg-slate-800 text-emerald-300'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        <LayoutGrid className="w-3.5 h-3.5" /> Board View (3 Columns)
                      </button>
                      <button
                        onClick={() => setTaskViewMode('list')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer ${
                          taskViewMode === 'list'
                            ? 'bg-slate-800 text-emerald-300'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        <ListChecks className="w-3.5 h-3.5" /> Simple List View
                      </button>
                    </div>

                    <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs">
                      <Search className="w-3.5 h-3.5 text-slate-400 mr-2" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search tasks..."
                        className="bg-transparent text-white placeholder-slate-500 focus:outline-none w-44"
                      />
                    </div>
                  </div>

                  {/* 3-COLUMN BOARD VIEW */}
                  {taskViewMode === 'board' ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {STATUS_OPTIONS.map((statusCol) => {
                        const colTasks = projectTasks.filter((t) => t.status === statusCol);
                        const headerColors = {
                          'To Do': 'text-slate-300 border-slate-700',
                          'In Progress': 'text-amber-300 border-amber-500/40',
                          'Done': 'text-emerald-300 border-emerald-500/40'
                        };

                        return (
                          <div
                            key={statusCol}
                            className="bg-[#111827]/90 border border-slate-800 rounded-2xl p-4 flex flex-col gap-3 min-h-[360px]"
                          >
                            <div
                              className={`flex items-center justify-between pb-2.5 border-b ${headerColors[statusCol]}`}
                            >
                              <span className="font-bold text-sm">{statusCol}</span>
                              <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-slate-900 text-slate-300">
                                {colTasks.length}
                              </span>
                            </div>

                            {colTasks.length === 0 ? (
                              <div className="flex-1 flex items-center justify-center text-xs text-slate-500 italic">
                                No tasks in {statusCol}
                              </div>
                            ) : (
                              <div className="space-y-3">
                                {colTasks.map((task) => (
                                  <div
                                    key={task.id}
                                    className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 space-y-2.5 transition-all"
                                  >
                                    <div className="flex items-start justify-between gap-2">
                                      <p className="text-xs sm:text-sm font-semibold text-white leading-snug">
                                        {task.title}
                                      </p>
                                      <button
                                        onClick={() => openEditTaskModal(task)}
                                        className="text-slate-400 hover:text-white p-1 shrink-0 cursor-pointer"
                                        title="Edit Task"
                                      >
                                        <Edit3 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>

                                    {task.result && (
                                      <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300">
                                        ✨ {task.result}
                                      </div>
                                    )}

                                    <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2">
                                      <span className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                                        {task.category || 'Feature'}
                                      </span>

                                      {/* Quick Status Dropdown right on the card */}
                                      <select
                                        value={task.status}
                                        onChange={(e) =>
                                          changeTaskStatusDirect(task.id, e.target.value)
                                        }
                                        className="bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-[11px] text-slate-200 cursor-pointer"
                                      >
                                        {STATUS_OPTIONS.map((s) => (
                                          <option key={s} value={s}>
                                            Move: {s}
                                          </option>
                                        ))}
                                      </select>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    /* SIMPLE LIST VIEW */
                    <div className="bg-[#111827] border border-slate-800 rounded-2xl divide-y divide-slate-800 overflow-hidden">
                      {projectTasks.map((task) => (
                        <div
                          key={task.id}
                          className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-900/60"
                        >
                          <div className="flex items-start gap-3">
                            <button
                              onClick={() => toggleTaskStatus(task)}
                              className="mt-0.5 cursor-pointer"
                              title="Click to change status"
                            >
                              {task.status === 'Done' ? (
                                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                              ) : task.status === 'In Progress' ? (
                                <Clock className="w-5 h-5 text-amber-400" />
                              ) : (
                                <Circle className="w-5 h-5 text-slate-500" />
                              )}
                            </button>
                            <div>
                              <div className="text-sm font-semibold text-white">
                                {task.title}
                              </div>
                              {task.result && (
                                <div className="text-xs text-emerald-300 mt-0.5">
                                  Result: {task.result}
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 self-end sm:self-center">
                            <select
                              value={task.status}
                              onChange={(e) =>
                                changeTaskStatusDirect(task.id, e.target.value)
                              }
                              className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white"
                            >
                              {STATUS_OPTIONS.map((s) => (
                                <option key={s} value={s}>
                                  {s}
                                </option>
                              ))}
                            </select>
                            <button
                              onClick={() => openEditTaskModal(task)}
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* =========================================================
                  TAB 2: ONE-CLICK COPY FOR LINKEDIN (SUPER SIMPLE)
                 ========================================================= */}
              {activeTab === 'linkedin' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  <div className="lg:col-span-5 space-y-4">
                    <div className="bg-[#111827] border border-slate-800 rounded-2xl p-5 space-y-4">
                      <h3 className="text-base font-bold text-white flex items-center gap-2">
                        <Linkedin className="w-5 h-5 text-sky-400" />
                        LinkedIn Export Studio
                      </h3>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        We automatically combined your project summary, tech stack, and{' '}
                        <span className="text-emerald-300 font-semibold">
                          {doneCount} completed tasks
                        </span>{' '}
                        into a clean LinkedIn format.
                      </p>

                      {/* Choose Format */}
                      <div className="space-y-2">
                        <label className="block text-xs font-semibold text-slate-300">
                          Choose What You Want to Copy:
                        </label>
                        <div className="grid grid-cols-1 gap-2">
                          <button
                            onClick={() => setLinkedinFormat('post')}
                            className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                              linkedinFormat === 'post'
                                ? 'bg-emerald-500/15 border-emerald-500 text-white'
                                : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
                            }`}
                          >
                            <div className="text-xs font-bold">
                              1. LinkedIn Feed Post (With Emojis & Hashtags)
                            </div>
                            <div className="text-[11px] text-slate-400 mt-0.5">
                              Best for sharing a post with screenshots or video of your app.
                            </div>
                          </button>

                          <button
                            onClick={() => setLinkedinFormat('profile')}
                            className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                              linkedinFormat === 'profile'
                                ? 'bg-emerald-500/15 border-emerald-500 text-white'
                                : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
                            }`}
                          >
                            <div className="text-xs font-bold">
                              2. LinkedIn Profile &quot;Projects&quot; Section
                            </div>
                            <div className="text-[11px] text-slate-400 mt-0.5">
                              Clean bullet points ready to paste into your LinkedIn Profile Projects tab.
                            </div>
                          </button>
                        </div>
                      </div>

                      {/* Big Copy Button */}
                      <button
                        onClick={() =>
                          copyToClipboard(
                            finalLinkedinText,
                            'Copied! Now paste it directly on LinkedIn.'
                          )
                        }
                        className="w-full py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg cursor-pointer"
                      >
                        <Copy className="w-4 h-4" />
                        Copy Text for LinkedIn
                      </button>
                    </div>
                  </div>

                  {/* Right Side: Editable Preview */}
                  <div className="lg:col-span-7">
                    <div className="bg-[#111827] border border-slate-800 rounded-2xl p-5 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                          Preview & Edit Before Copying
                        </span>
                        {isTextEdited && (
                          <button
                            onClick={() => setIsTextEdited(false)}
                            className="text-xs text-amber-300 hover:underline"
                          >
                            Reset to Auto-Generated
                          </button>
                        )}
                      </div>

                      <textarea
                        rows={16}
                        value={finalLinkedinText}
                        onChange={(e) => {
                          setCustomLinkedinText(e.target.value);
                          setIsTextEdited(true);
                        }}
                        className="w-full rounded-xl bg-slate-950 border border-slate-800 p-4 text-xs sm:text-sm text-slate-100 leading-relaxed focus:outline-none focus:border-emerald-500 font-sans"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* =========================================================
                  TAB 3: SIMPLE PROJECT OVERVIEW & ARCHITECTURE SUMMARY
                 ========================================================= */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-5 rounded-2xl bg-[#111827] border border-slate-800 space-y-2">
                      <div className="text-xs font-bold uppercase text-cyan-400">
                        1. Frontend / User Interface
                      </div>
                      <p className="text-sm text-slate-200">
                        {currentProject.howItWorks?.frontend || 'Not specified yet'}
                      </p>
                    </div>

                    <div className="p-5 rounded-2xl bg-[#111827] border border-slate-800 space-y-2">
                      <div className="text-xs font-bold uppercase text-emerald-400">
                        2. Backend / API Logic
                      </div>
                      <p className="text-sm text-slate-200">
                        {currentProject.howItWorks?.backend || 'Not specified yet'}
                      </p>
                    </div>

                    <div className="p-5 rounded-2xl bg-[#111827] border border-slate-800 space-y-2">
                      <div className="text-xs font-bold uppercase text-amber-400">
                        3. Database & Storage
                      </div>
                      <p className="text-sm text-slate-200">
                        {currentProject.howItWorks?.database || 'Not specified yet'}
                      </p>
                    </div>
                  </div>

                  <div className="p-5 rounded-2xl bg-[#111827] border border-slate-800 space-y-4">
                    <div>
                      <div className="text-xs font-bold uppercase text-slate-400 mb-1">
                        Problem Solved / Goal
                      </div>
                      <p className="text-sm text-white">
                        {currentProject.problemSolved}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 pt-3 border-t border-slate-800 text-xs">
                      {currentProject.liveUrl && (
                        <a
                          href={currentProject.liveUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3.5 py-2 rounded-xl bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5 font-semibold"
                        >
                          <ExternalLink className="w-4 h-4" /> Open Live App
                        </a>
                      )}
                      {currentProject.githubUrl && (
                        <a
                          href={currentProject.githubUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3.5 py-2 rounded-xl bg-slate-800 text-slate-200 flex items-center gap-1.5 font-semibold"
                        >
                          <Github className="w-4 h-4" /> View GitHub Repo
                        </a>
                      )}
                      <button
                        onClick={() => openEditProjectModal(currentProject)}
                        className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center gap-1.5"
                      >
                        <Edit3 className="w-4 h-4" /> Edit Details
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </main>

      {/* =========================================================
          MODAL: ADD OR EDIT PROJECT
         ========================================================= */}
      {isProjectModalOpen && editingProject && (
        <div
          className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4"
          onClick={() => setIsProjectModalOpen(false)}
        >
          <form
            onSubmit={handleSaveProject}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg rounded-2xl bg-[#111827] border border-slate-700 shadow-2xl overflow-hidden"
          >
            <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">
                {editingProject.id ? 'Edit Project Details' : 'Add New Portfolio Project'}
              </h3>
              <button
                type="button"
                onClick={() => setIsProjectModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-3.5 max-h-[75vh] overflow-y-auto text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Project Name *
                </label>
                <input
                  type="text"
                  required
                  value={editingProject.name}
                  onChange={(e) =>
                    setEditingProject({ ...editingProject, name: e.target.value })
                  }
                  placeholder="e.g., Real-Time Chat App"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Short Summary (1-2 sentences) *
                </label>
                <textarea
                  rows={2}
                  required
                  value={editingProject.summary}
                  onChange={(e) =>
                    setEditingProject({ ...editingProject, summary: e.target.value })
                  }
                  placeholder="What is this project?"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  What Problem Does It Solve?
                </label>
                <input
                  type="text"
                  value={editingProject.problemSolved}
                  onChange={(e) =>
                    setEditingProject({
                      ...editingProject,
                      problemSolved: e.target.value
                    })
                  }
                  placeholder="Why did you build it?"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Key Highlight / Metric
                  </label>
                  <input
                    type="text"
                    value={editingProject.keyResult}
                    onChange={(e) =>
                      setEditingProject({ ...editingProject, keyResult: e.target.value })
                    }
                    placeholder="e.g., 99% Lighthouse Score"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Project Status
                  </label>
                  <select
                    value={editingProject.status}
                    onChange={(e) =>
                      setEditingProject({ ...editingProject, status: e.target.value })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                    <option value="Planned">Planned</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Tech Stack (Comma separated)
                </label>
                <input
                  type="text"
                  value={editingProject.techStackInput}
                  onChange={(e) =>
                    setEditingProject({
                      ...editingProject,
                      techStackInput: e.target.value
                    })
                  }
                  placeholder="React, Node.js, Tailwind CSS, MongoDB"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-slate-800">
                <div>
                  <label className="block text-slate-400 mb-1">Frontend Used</label>
                  <input
                    type="text"
                    value={editingProject.frontend}
                    onChange={(e) =>
                      setEditingProject({ ...editingProject, frontend: e.target.value })
                    }
                    placeholder="React + Tailwind"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Backend Used</label>
                  <input
                    type="text"
                    value={editingProject.backend}
                    onChange={(e) =>
                      setEditingProject({ ...editingProject, backend: e.target.value })
                    }
                    placeholder="Node.js / Express"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Database Used</label>
                  <input
                    type="text"
                    value={editingProject.database}
                    onChange={(e) =>
                      setEditingProject({ ...editingProject, database: e.target.value })
                    }
                    placeholder="MongoDB / PostgreSQL"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Live Demo Link (Optional)
                  </label>
                  <input
                    type="url"
                    value={editingProject.liveUrl}
                    onChange={(e) =>
                      setEditingProject({ ...editingProject, liveUrl: e.target.value })
                    }
                    placeholder="https://..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    GitHub Link (Optional)
                  </label>
                  <input
                    type="url"
                    value={editingProject.githubUrl}
                    onChange={(e) =>
                      setEditingProject({ ...editingProject, githubUrl: e.target.value })
                    }
                    placeholder="https://github.com/..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>
            </div>

            <div className="px-5 py-3.5 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
              {editingProject.id ? (
                <button
                  type="button"
                  onClick={() => handleDeleteProject(editingProject.id)}
                  className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete Project
                </button>
              ) : (
                <div />
              )}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsProjectModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs"
                >
                  Save Project
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* =========================================================
          MODAL: EDIT TASK
         ========================================================= */}
      {isTaskModalOpen && editingTask && (
        <div
          className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4"
          onClick={() => setIsTaskModalOpen(false)}
        >
          <form
            onSubmit={handleSaveTaskModal}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-2xl bg-[#111827] border border-slate-700 shadow-2xl overflow-hidden"
          >
            <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">Edit Task / Feature</h3>
              <button
                type="button"
                onClick={() => setIsTaskModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Feature / Task Title
                </label>
                <input
                  type="text"
                  required
                  value={editingTask.title}
                  onChange={(e) =>
                    setEditingTask({ ...editingTask, title: e.target.value })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Result / Benefit (Shown on LinkedIn)
                </label>
                <input
                  type="text"
                  value={editingTask.result || ''}
                  onChange={(e) =>
                    setEditingTask({ ...editingTask, result: e.target.value })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Status</label>
                  <select
                    value={editingTask.status}
                    onChange={(e) =>
                      setEditingTask({ ...editingTask, status: e.target.value })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Category
                  </label>
                  <select
                    value={editingTask.category || 'Feature'}
                    onChange={(e) =>
                      setEditingTask({ ...editingTask, category: e.target.value })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  >
                    {CATEGORY_OPTIONS.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="px-5 py-3.5 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
              <button
                type="button"
                onClick={() => handleDeleteTask(editingTask.id)}
                className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" /> Delete
              </button>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsTaskModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* SIMPLE TOAST NOTIFICATION */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs shadow-xl">
          <Check className="w-4 h-4 stroke-[3]" />
          <span>{toast}</span>
        </div>
      )}
    </div>
  );
}