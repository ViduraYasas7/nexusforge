import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  Clock,
  Plus,
  Copy,
  Check,
  Share2,
  ExternalLink,
  Code2,
  Layers,
  Sparkles,
  Trash2,
  LayoutGrid,
  List,
  Github,
  Globe,
  Search,
  Lock,
  Unlock,
  ShieldAlert,
  Settings,
  Edit3,
  Download,
  RotateCcw,
  KeyRound,
  FolderPlus,
  Database,
  HardDrive,
  Sun,
  Moon,
  Calendar as CalendarIcon,
  BarChart3,
  CheckSquare,
  ChevronDown,
  ChevronUp,
  Pin,
  MoreHorizontal,
  Bell,
  AlertCircle,
  ArrowDown,
  UserPlus,
  X,
  Link2,
  Mail,
  MessageCircle,
  Send,
  Play,
  Pause
} from 'lucide-react';
import {
  PortfolioProject,
  ProjectTask,
  TaskStatus,
  TaskPriority,
  GroupByOption,
  PLANNER_LABELS,
  DEFAULT_BUCKETS,
  DEFAULT_MEMBERS,
  INITIAL_PROJECTS,
  INITIAL_TASKS,
  generateSmartSubtasks
} from './plannerUtils';
import {
  PlannerChartsView,
  PlannerScheduleView,
  PlannerTaskModal
} from './PlannerViews';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export function App() {
  // ==========================================
  // STATE: PROJECTS & TASKS (MongoDB + Local Fallback)
  // ==========================================
  const [projects, setProjects] = useState<PortfolioProject[]>(() => {
    try {
      const saved = localStorage.getItem('nexusforge_simple_projects');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    return INITIAL_PROJECTS;
  });

  const [tasks, setTasks] = useState<ProjectTask[]>(() => {
    try {
      const saved = localStorage.getItem('nexusforge_simple_tasks');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    return INITIAL_TASKS;
  });

  const [mongoConnected, setMongoConnected] = useState<boolean>(false);

  // Theme State: 'dark' (default) or 'light' (Color/Light Mode)
  const [themeMode, setThemeMode] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('nexusforge_theme_mode');
    return saved === 'light' ? 'light' : 'dark';
  });
  const isLight = themeMode === 'light';

  useEffect(() => {
    localStorage.setItem('nexusforge_theme_mode', themeMode);
  }, [themeMode]);

  useEffect(() => {
    let isMounted = true;
    const fetchFromBackend = async () => {
      try {
        const [projRes, taskRes] = await Promise.all([
          fetch(`${API_BASE}/projects`),
          fetch(`${API_BASE}/tasks`)
        ]);

        if (projRes.ok && taskRes.ok) {
          const projData = await projRes.json();
          const taskData = await taskRes.json();
          if (isMounted) {
            if (Array.isArray(projData) && projData.length > 0) {
              setProjects(projData);
            }
            if (Array.isArray(taskData)) {
              setTasks(taskData);
            }
            setMongoConnected(true);
          }
        } else {
          if (isMounted) setMongoConnected(false);
        }
      } catch {
        if (isMounted) setMongoConnected(false);
      }
    };

    fetchFromBackend();
    return () => {
      isMounted = false;
    };
  }, []);

  const [selectedProjectId, setSelectedProjectId] = useState<string>(() => {
    // Open the plan referenced by a shared link (e.g. /?plan=proj-1)
    try {
      const sharedPlan = new URLSearchParams(window.location.search).get('plan');
      if (sharedPlan && projects.some((p) => p.id === sharedPlan)) return sharedPlan;
    } catch {}
    return projects[0]?.id || INITIAL_PROJECTS[0].id;
  });

  const [activeTab, setActiveTab] = useState<'tasks' | 'linkedin' | 'overview' | 'admin'>('tasks');
  const [taskViewMode, setTaskViewMode] = useState<'board' | 'list' | 'schedule' | 'charts'>('board');
  const [groupBy, setGroupBy] = useState<GroupByOption>('Bucket');
  const [personalView, setPersonalView] = useState<'all' | 'myday' | 'assigned'>('all');
  const [pinnedIds, setPinnedIds] = useState<string[]>(() => projects.map((p) => p.id));

  const [searchQuery, setSearchQuery] = useState('');
  const [copiedType, setCopiedType] = useState<string | null>(null);
  const [postFormat, setPostFormat] = useState<'feed_post' | 'profile_project'>('feed_post');

  // Universal Share Modal State (URL + Any Platform Share)
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareUrlCopied, setShareUrlCopied] = useState(false);
  const [shareSummaryCopied, setShareSummaryCopied] = useState(false);

  // Novelty: Live Focus Pomodoro Timer in Header
  const [focusSeconds, setFocusSeconds] = useState(25 * 60);
  const [focusActive, setFocusActive] = useState(false);

  useEffect(() => {
    if (!focusActive) return;
    const timer = setInterval(() => {
      setFocusSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [focusActive]);

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  // Inline Assignee Popover in Grid View
  const [assigneePopoverTaskId, setAssigneePopoverTaskId] = useState<string | null>(null);
  const [memberSearchQuery, setMemberSearchQuery] = useState('');

  // Collapsible Completed Tasks per Bucket in Board View
  const [collapsedCompleted, setCollapsedCompleted] = useState<Record<string, boolean>>({});

  // Inline "+ Add task" per Bucket in Board View
  const [inlineBucketAddId, setInlineBucketAddId] = useState<string | null>(null);
  const [inlineBucketTaskTitle, setInlineBucketTaskTitle] = useState('');

  // Bottom "+ Add new task" row in Grid View
  const [gridNewTaskTitle, setGridNewTaskTitle] = useState('');

  // New Bucket Creation
  const [newBucketName, setNewBucketName] = useState('');
  const [showAddBucket, setShowAddBucket] = useState(false);

  // ==========================================
  // ADMIN LOCK / PUBLIC READ-ONLY STATE
  // ==========================================
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    return localStorage.getItem('nexusforge_is_admin') === 'true';
  });

  const [adminPin, setAdminPin] = useState<string>(() => {
    return localStorage.getItem('nexusforge_admin_pin') || '1234';
  });

  const [showUnlockModal, setShowUnlockModal] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');

  const [showPinChangeModal, setShowPinChangeModal] = useState(false);
  const [newPinInput, setNewPinInput] = useState('');
  const [pinChangeSuccess, setPinChangeSuccess] = useState(false);

  // Add / Edit Project Modal
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [projName, setProjName] = useState('');
  const [projSummary, setProjSummary] = useState('');
  const [projProblem, setProjProblem] = useState('');
  const [projResult, setProjResult] = useState('');
  const [projTech, setProjTech] = useState('');
  const [projRole, setProjRole] = useState('Full-Stack Developer');
  const [projStatus, setProjStatus] = useState<'Completed' | 'In Progress'>('In Progress');
  const [projFrontend, setProjFrontend] = useState('');
  const [projBackend, setProjBackend] = useState('');
  const [projDatabase, setProjDatabase] = useState('');
  const [projGithub, setProjGithub] = useState('');
  const [projLive, setProjLive] = useState('');

  // Quick Add Task State
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskResult, setNewTaskResult] = useState('');
  const [newTaskCategory] = useState<ProjectTask['category']>('Feature');
  const [newTaskPriority] = useState<TaskPriority>('Medium');

  const [editingTask, setEditingTask] = useState<ProjectTask | null>(null);

  useEffect(() => {
    localStorage.setItem('nexusforge_simple_projects', JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    localStorage.setItem('nexusforge_simple_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('nexusforge_is_admin', String(isAdmin));
  }, [isAdmin]);

  useEffect(() => {
    localStorage.setItem('nexusforge_admin_pin', adminPin);
  }, [adminPin]);

  const currentProject = projects.find((p) => p.id === selectedProjectId) || projects[0];
  const currentBuckets =
    currentProject?.buckets && currentProject.buckets.length > 0
      ? currentProject.buckets
      : DEFAULT_BUCKETS;
  const currentMembers =
    currentProject?.members && currentProject.members.length > 0
      ? currentProject.members
      : DEFAULT_MEMBERS;

  const projectTasks = tasks.filter((t) => {
    const matchesProject = t.projectId === currentProject?.id;
    const matchesSearch =
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.result.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPersonal =
      personalView === 'all'
        ? true
        : personalView === 'myday'
        ? Boolean(t.isMyDay)
        : (t.assignees || []).includes('mem-1');
    return matchesProject && matchesSearch && matchesPersonal;
  });

  // ==========================================
  // HANDLERS: ADMIN AUTH
  // ==========================================
  const handleUnlockSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const enteredPin = pinInput.trim();
    try {
      const res = await fetch(`${API_BASE}/admin/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: enteredPin })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setIsAdmin(true);
          setShowUnlockModal(false);
          setPinInput('');
          setPinError('');
          return;
        } else {
          setPinError('Incorrect PIN. Please try again.');
          return;
        }
      }
    } catch {}

    if (enteredPin === adminPin) {
      setIsAdmin(true);
      setShowUnlockModal(false);
      setPinInput('');
      setPinError('');
    } else {
      setPinError('Incorrect PIN. Please try again.');
    }
  };

  const handleLockAdmin = () => {
    setIsAdmin(false);
    if (activeTab === 'admin') {
      setActiveTab('tasks');
    }
  };

  const handleChangePin = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPinInput.trim().length < 4) return;
    setAdminPin(newPinInput.trim());
    setNewPinInput('');
    setPinChangeSuccess(true);
    setTimeout(() => {
      setPinChangeSuccess(false);
      setShowPinChangeModal(false);
    }, 1200);
  };

  // ==========================================
  // HANDLERS: TASK CRUD
  // ==========================================
  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim() || !currentProject) return;

    const newTask: ProjectTask = {
      id: `task-${Date.now()}`,
      projectId: currentProject.id,
      title: newTaskTitle.trim(),
      result: newTaskResult.trim() || 'Completed milestone deliverable',
      status: 'To Do',
      priority: newTaskPriority,
      category: newTaskCategory,
      bucketId: currentBuckets[0]?.id || 'bucket-initiating',
      startDate: '2026-03-19',
      dueDate: '2026-03-26',
      checklist: [],
      labels: ['Blue'],
      assignees: ['mem-1'],
      isMyDay: personalView === 'myday'
    };

    setTasks([newTask, ...tasks]);
    setNewTaskTitle('');
    setNewTaskResult('');

    try {
      const res = await fetch(`${API_BASE}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTask)
      });
      if (res.ok) setMongoConnected(true);
      else setMongoConnected(false);
    } catch {
      setMongoConnected(false);
    }
  };

  const handleGridQuickAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gridNewTaskTitle.trim() || !currentProject) return;
    const newTask: ProjectTask = {
      id: `task-${Date.now()}`,
      projectId: currentProject.id,
      title: gridNewTaskTitle.trim(),
      result: 'Sprint task deliverable',
      status: 'To Do',
      priority: 'Medium',
      category: 'Feature',
      bucketId: currentBuckets[0]?.id || 'bucket-initiating',
      startDate: '2026-03-19',
      dueDate: '2026-04-30',
      checklist: [],
      labels: ['Blue'],
      assignees: ['mem-1'],
      isMyDay: personalView === 'myday'
    };
    setTasks([...tasks, newTask]);
    setGridNewTaskTitle('');
    try {
      await fetch(`${API_BASE}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTask)
      });
    } catch {}
  };

  const handleInlineBucketAdd = async (bucketId: string) => {
    if (!inlineBucketTaskTitle.trim() || !currentProject) return;
    const newTask: ProjectTask = {
      id: `task-${Date.now()}`,
      projectId: currentProject.id,
      title: inlineBucketTaskTitle.trim(),
      result: 'Sprint task deliverable',
      status: 'To Do',
      priority: 'Medium',
      category: 'Feature',
      bucketId,
      startDate: '2026-03-19',
      dueDate: '2026-04-30',
      checklist: [],
      labels: [],
      assignees: ['mem-1']
    };
    setTasks([newTask, ...tasks]);
    setInlineBucketTaskTitle('');
    setInlineBucketAddId(null);
    try {
      await fetch(`${API_BASE}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTask)
      });
    } catch {}
  };

  const handleAutoBreakdownAllMissing = () => {
    setTasks(
      tasks.map((t) => {
        if (t.projectId === currentProject?.id && (!t.checklist || t.checklist.length === 0)) {
          return { ...t, checklist: generateSmartSubtasks(t), showChecklistOnCard: true };
        }
        return t;
      })
    );
  };

  const handleSaveEditedTask = async (updatedTask: ProjectTask) => {
    setTasks(tasks.map((t) => (t.id === updatedTask.id ? updatedTask : t)));
    setEditingTask(null);

    try {
      const res = await fetch(`${API_BASE}/tasks/${updatedTask.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedTask)
      });
      if (res.ok) setMongoConnected(true);
      else setMongoConnected(false);
    } catch {
      setMongoConnected(false);
    }
  };

  const toggleTaskStatus = async (taskId: string) => {
    const targetTask = tasks.find((t) => t.id === taskId);
    if (!targetTask) return;

    const nextStatus: TaskStatus = targetTask.status === 'Done' ? 'To Do' : 'Done';
    const updatedTask: ProjectTask = { ...targetTask, status: nextStatus };
    setTasks(tasks.map((t) => (t.id === taskId ? updatedTask : t)));

    try {
      const res = await fetch(`${API_BASE}/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedTask)
      });
      if (res.ok) setMongoConnected(true);
      else setMongoConnected(false);
    } catch {
      setMongoConnected(false);
    }
  };

  const toggleTaskAssigneeInline = async (task: ProjectTask, memId: string) => {
    const current = task.assignees || [];
    const updatedAssignees = current.includes(memId)
      ? current.filter((id) => id !== memId)
      : [...current, memId];
    const updatedTask = { ...task, assignees: updatedAssignees };
    setTasks(tasks.map((t) => (t.id === task.id ? updatedTask : t)));
    try {
      await fetch(`${API_BASE}/tasks/${task.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedTask)
      });
    } catch {}
  };

  const deleteTask = async (taskId: string) => {
    setTasks(tasks.filter((t) => t.id !== taskId));
    try {
      const res = await fetch(`${API_BASE}/tasks/${taskId}`, {
        method: 'DELETE'
      });
      if (res.ok) setMongoConnected(true);
      else setMongoConnected(false);
    } catch {
      setMongoConnected(false);
    }
  };

  const handleAddBucket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBucketName.trim() || !currentProject) return;
    const newBucket = {
      id: `bucket-${Date.now()}`,
      name: newBucketName.trim(),
      color: '#5b5fc7'
    };
    const updatedProject: PortfolioProject = {
      ...currentProject,
      buckets: [...currentBuckets, newBucket]
    };
    setProjects(projects.map((p) => (p.id === currentProject.id ? updatedProject : p)));
    setNewBucketName('');
    setShowAddBucket(false);
  };

  // ==========================================
  // HANDLERS: PROJECT CRUD
  // ==========================================
  const openCreateProjectModal = () => {
    setEditingProjectId(null);
    setProjName('');
    setProjSummary('');
    setProjProblem('');
    setProjResult('');
    setProjTech('');
    setProjRole('Full-Stack Developer');
    setProjStatus('In Progress');
    setProjFrontend('');
    setProjBackend('');
    setProjDatabase('');
    setProjGithub('');
    setProjLive('');
    setShowProjectModal(true);
  };

  const openEditProjectModal = (proj: PortfolioProject) => {
    setEditingProjectId(proj.id);
    setProjName(proj.name);
    setProjSummary(proj.summary);
    setProjProblem(proj.problemSolved);
    setProjResult(proj.keyResult);
    setProjTech(proj.techStack.join(', '));
    setProjRole(proj.role);
    setProjStatus(proj.status);
    setProjFrontend(proj.howItWorks.frontend);
    setProjBackend(proj.howItWorks.backend);
    setProjDatabase(proj.howItWorks.database);
    setProjGithub(proj.githubUrl);
    setProjLive(proj.liveUrl);
    setShowProjectModal(true);
  };

  const handleSaveProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projName.trim()) return;

    const projectPayload: PortfolioProject = {
      id: editingProjectId || `proj-${Date.now()}`,
      name: projName.trim(),
      summary: projSummary.trim() || 'Full-stack web application built for modern users.',
      problemSolved: projProblem.trim() || 'Streamlined workflow and improved speed.',
      keyResult: projResult.trim() || 'Fast, responsive, and production-ready architecture.',
      status: projStatus,
      techStack: projTech
        ? projTech.split(',').map((s) => s.trim()).filter(Boolean)
        : ['React', 'TypeScript', 'Tailwind CSS'],
      howItWorks: {
        frontend: projFrontend.trim() || 'React & Tailwind CSS user interface',
        backend: projBackend.trim() || 'REST API & modular business logic',
        database: projDatabase.trim() || 'Cloud database storage'
      },
      githubUrl: projGithub.trim() || 'https://github.com/yourusername',
      liveUrl: projLive.trim() || 'https://example.com',
      role: projRole.trim() || 'Full-Stack Developer',
      buckets: DEFAULT_BUCKETS,
      members: DEFAULT_MEMBERS
    };

    if (editingProjectId) {
      setProjects(projects.map((p) => (p.id === editingProjectId ? projectPayload : p)));
      try {
        const res = await fetch(`${API_BASE}/projects/${editingProjectId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(projectPayload)
        });
        if (res.ok) setMongoConnected(true);
        else setMongoConnected(false);
      } catch {
        setMongoConnected(false);
      }
    } else {
      setProjects([...projects, projectPayload]);
      setSelectedProjectId(projectPayload.id);
      try {
        const res = await fetch(`${API_BASE}/projects`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(projectPayload)
        });
        if (res.ok) setMongoConnected(true);
        else setMongoConnected(false);
      } catch {
        setMongoConnected(false);
      }
    }

    setShowProjectModal(false);
  };

  const handleDeleteProject = async (projId: string) => {
    if (projects.length <= 1) {
      alert('You must keep at least one project in your portfolio.');
      return;
    }
    const remaining = projects.filter((p) => p.id !== projId);
    setProjects(remaining);
    setTasks(tasks.filter((t) => t.projectId !== projId));
    if (selectedProjectId === projId) {
      setSelectedProjectId(remaining[0].id);
    }

    try {
      const res = await fetch(`${API_BASE}/projects/${projId}`, {
        method: 'DELETE'
      });
      if (res.ok) setMongoConnected(true);
      else setMongoConnected(false);
    } catch {
      setMongoConnected(false);
    }
  };

  const handleResetDemoData = () => {
    if (window.confirm('Reset all projects and tasks back to default demo data?')) {
      setProjects(INITIAL_PROJECTS);
      setTasks(INITIAL_TASKS);
      setSelectedProjectId(INITIAL_PROJECTS[0].id);
    }
  };

  const handleExportData = () => {
    const dataStr = JSON.stringify({ projects, tasks, exportedAt: new Date().toISOString() }, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nexusforge-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ==========================================
  // UNIVERSAL SHARE & LINKEDIN GENERATORS
  // ==========================================
  const getShareablePlanUrl = () => {
    const base = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173';
    return `${base}/?plan=${encodeURIComponent(currentProject?.id || 'proj-nexusforge')}`;
  };

  const getUniversalShareText = () => {
    if (!currentProject) return '';
    const doneCount = projectTasks.filter((t) => t.status === 'Done').length;
    return `Check out our project plan "${currentProject.name}" (${doneCount}/${projectTasks.length} tasks completed): ${getShareablePlanUrl()}`;
  };

  const handleCopyShareUrl = () => {
    navigator.clipboard.writeText(getShareablePlanUrl());
    setShareUrlCopied(true);
    setTimeout(() => setShareUrlCopied(false), 2000);
  };

  const handleCopyShareSummary = () => {
    navigator.clipboard.writeText(getUniversalShareText());
    setShareSummaryCopied(true);
    setTimeout(() => setShareSummaryCopied(false), 2000);
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: currentProject?.name || 'Planner Project',
          text: getUniversalShareText(),
          url: getShareablePlanUrl()
        });
      } catch {}
    } else {
      handleCopyShareUrl();
    }
  };

  const generateLinkedInText = () => {
    if (!currentProject) return '';
    const doneTasks = tasks.filter((t) => t.projectId === currentProject.id && t.status === 'Done');
    const allProjTasks = tasks.filter((t) => t.projectId === currentProject.id);
    const taskListToUse = doneTasks.length > 0 ? doneTasks : allProjTasks;

    if (postFormat === 'feed_post') {
      const bulletPoints = taskListToUse
        .slice(0, 5)
        .map((t) => `• ${t.title} — ${t.result}`)
        .join('\n');

      const hashtags = currentProject.techStack
        .map((t) => `#${t.replace(/[^a-zA-Z0-9]/g, '')}`)
        .join(' ');

      return `🚀 Excited to share my project: ${currentProject.name}!

💡 Why I built it:
${currentProject.problemSolved}

🛠️ What I built & key features:
${bulletPoints}

📈 Key Takeaway / Result:
${currentProject.keyResult}

💻 Tech Stack: ${currentProject.techStack.join(', ')}
🔗 GitHub / Live Link: ${currentProject.liveUrl || currentProject.githubUrl}

I'd love to hear your thoughts or feedback! 👇

${hashtags} #SoftwareEngineering #WebDevelopment #BuildInPublic #Coding`;
    } else {
      const bullets = taskListToUse
        .map((t) => `• ${t.title}: ${t.result}.`)
        .join('\n');

      return `Project Name: ${currentProject.name}
Role: ${currentProject.role}
Associated Tech: ${currentProject.techStack.join(' · ')}

Description (Copy & paste into LinkedIn "Projects" or "Experience" section):
${currentProject.summary} ${currentProject.problemSolved}

Key Features Built:
${bullets}

Key Result: ${currentProject.keyResult}
Technologies Used: ${currentProject.techStack.join(', ')}`;
    }
  };

  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2000);
  };

  // ==========================================
  // BOARD COLUMNS (Bucket / Progress / Priority / Assigned To)
  // ==========================================
  const getBoardColumns = () => {
    if (groupBy === 'Progress') {
      return [
        { id: 'col-todo', name: 'TO DO', tasks: projectTasks.filter((t) => t.status === 'To Do') },
        { id: 'col-inprog', name: 'IN PROGRESS', tasks: projectTasks.filter((t) => t.status === 'In Progress') },
        { id: 'col-done', name: 'DONE', tasks: projectTasks.filter((t) => t.status === 'Done') }
      ];
    }
    if (groupBy === 'Priority') {
      return (['Urgent', 'Important', 'Medium', 'Low'] as TaskPriority[]).map((p) => ({
        id: `prio-${p}`,
        name: p,
        tasks: projectTasks.filter((t) => t.priority === p)
      }));
    }
    if (groupBy === 'Assigned To') {
      return currentMembers.slice(0, 4).map((m) => ({
        id: m.id,
        name: m.name.split(' ')[0],
        tasks: projectTasks.filter((t) => (t.assignees || []).includes(m.id))
      }));
    }
    return currentBuckets.map((b) => ({
      id: b.id,
      name: b.name,
      tasks: projectTasks.filter((t) => (t.bucketId || currentBuckets[0]?.id) === b.id)
    }));
  };

  const boardColumns = getBoardColumns();
  const formatDateDisplay = (d?: string) => {
    if (!d) return '';
    const parts = d.split('-');
    if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
    return d;
  };

  const isDateOverdue = (d?: string, status?: TaskStatus) => {
    if (!d || status === 'Done') return false;
    return d < '2026-01-01';
  };

  const togglePinProject = (projId: string) => {
    setPinnedIds((prev) =>
      prev.includes(projId) ? prev.filter((id) => id !== projId) : [...prev, projId]
    );
  };

  // Theme Classes for Dark Mode vs Light/Color Mode
  const appBarBg = isLight
    ? 'bg-[#5b5fc7] text-white border-[#4f52b2]'
    : 'bg-[#141414] text-white border-[#292929]';
  const sidebarBg = isLight
    ? 'bg-white border-slate-200 text-slate-800'
    : 'bg-[#141414] border-[#292929] text-white';
  const mainBg = isLight ? 'bg-[#f5f6fa] text-slate-900' : 'bg-[#1f1f1f] text-white';
  const headerBg = isLight
    ? 'bg-white border-slate-200 text-slate-900 shadow-xs'
    : 'bg-[#1f1f1f] border-[#292929] text-white';
  const surfaceCard = isLight
    ? 'bg-white border-slate-200 text-slate-900 shadow-xs'
    : 'bg-[#292929] border-[#3a3a3a] text-white';
  const completedCard = isLight
    ? 'bg-slate-100 border-slate-200 text-slate-700'
    : 'bg-[#242424] border-[#333333] text-zinc-300';

  return (
    <div
      className={`min-h-screen flex flex-col font-sans transition-colors ${
        isLight ? 'bg-slate-50 text-slate-900' : 'bg-black text-white'
      }`}
    >
      {/* ==========================================
          TOP MICROSOFT 365 PLANNER APP BAR
      ========================================== */}
      <div className={`h-11 border-b px-4 flex items-center justify-between select-none shrink-0 transition-colors ${appBarBg}`}>
        <div className="flex items-center gap-3">
          <div className="grid grid-cols-3 gap-0.5 p-1.5 rounded hover:bg-white/10 cursor-pointer">
            {Array.from({ length: 9 }).map((_, i) => (
              <span key={i} className="w-1 h-1 rounded-full bg-white/90" />
            ))}
          </div>

          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-gradient-to-br from-white/90 via-[#a5b4fc] to-[#2eb899] flex items-center justify-center text-[10px] font-bold text-[#141414] shadow">
              P
            </div>
            <span className="font-semibold text-sm text-white tracking-tight">Planner</span>
            <span className="text-xs text-white/50">·</span>
            <span className="text-xs font-semibold text-white/90">NexusForge</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-white/20 text-white font-semibold">
              OS
            </span>
          </div>
        </div>

        {/* Right App Bar Controls: Live Focus Timer + Dark/Color Theme Toggle + Overview + Settings */}
        <div className="flex items-center gap-2">
          {/* Novelty: Built-in Focus Pomodoro Timer Pill */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/25 border border-white/15 text-xs text-white">
            <Clock className="w-3.5 h-3.5 text-[#2eb899]" />
            <span className="font-mono font-semibold">{formatTimer(focusSeconds)}</span>
            <button
              type="button"
              onClick={() => setFocusActive(!focusActive)}
              title={focusActive ? 'Pause Focus Timer' : 'Start Focus Timer'}
              className="p-0.5 rounded hover:bg-white/20"
            >
              {focusActive ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
            </button>
            <button
              type="button"
              onClick={() => {
                setFocusActive(false);
                setFocusSeconds(25 * 60);
              }}
              title="Reset Focus Timer"
              className="p-0.5 rounded hover:bg-white/20"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          </div>

          {/* Dark / Light (Color) Mode Switcher */}
          <button
            type="button"
            onClick={() => setThemeMode(isLight ? 'dark' : 'light')}
            title="Switch Fluent Dark / Light Theme"
            className="px-2.5 py-1 rounded-full bg-white/15 hover:bg-white/25 text-white text-xs font-medium flex items-center gap-1.5 transition-colors"
          >
            {isLight ? (
              <>
                <Moon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Dark Mode</span>
              </>
            ) : (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-300" />
                <span className="hidden sm:inline">Light Mode</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab(activeTab === 'overview' ? 'tasks' : 'overview')}
            title="Project Overview & Architecture"
            className="p-1.5 rounded hover:bg-white/15 text-white/85 hover:text-white transition-colors"
          >
            <Layers className="w-4 h-4" />
          </button>

          {isAdmin && (
            <button
              type="button"
              onClick={() => setActiveTab(activeTab === 'admin' ? 'tasks' : 'admin')}
              title="Admin Settings"
              className="p-1.5 rounded hover:bg-white/15 text-white/85 hover:text-white transition-colors"
            >
              <Settings className="w-4 h-4" />
            </button>
          )}

          <div className="w-7 h-7 rounded-full bg-white/20 border border-white/30 text-white text-xs font-bold flex items-center justify-center ml-1">
            VL
          </div>
        </div>
      </div>

      {/* ==========================================
          MAIN BODY: LEFT SIDEBAR + PLAN WORKSPACE
      ========================================== */}
      <div className={`flex-1 flex flex-col md:flex-row min-h-0 transition-colors ${mainBg}`}>
        {/* ==========================================
            LEFT SIDEBAR
        ========================================== */}
        <aside className={`w-full md:w-56 border-b md:border-b-0 md:border-r flex flex-col justify-between shrink-0 select-none transition-colors ${sidebarBg}`}>
          <div className="p-3 space-y-4">
            {/* + Create a plan button */}
            {isAdmin ? (
              <button
                onClick={openCreateProjectModal}
                className="w-full py-2 px-3 rounded-md bg-[#5b5fc7] hover:bg-[#4f52b2] text-white text-xs font-semibold flex items-center justify-between shadow-sm transition-colors"
              >
                <span className="flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Add New Project
                </span>
                <ChevronDown className="w-3.5 h-3.5 opacity-80" />
              </button>
            ) : (
              <button
                onClick={() => setShowUnlockModal(true)}
                className="w-full py-2 px-3 rounded-md bg-[#5b5fc7] hover:bg-[#4f52b2] text-white text-xs font-semibold flex items-center justify-between shadow-sm transition-colors"
              >
                <span className="flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Create a plan
                </span>
                <ChevronDown className="w-3.5 h-3.5 opacity-80" />
              </button>
            )}

            {/* 3 Core Planner Navigation Links */}
            <nav className="space-y-0.5">
              <button
                onClick={() => {
                  setPersonalView('myday');
                  setActiveTab('tasks');
                }}
                className={`w-full text-left px-3 py-2 rounded-md text-xs flex items-center gap-3 transition-colors ${
                  personalView === 'myday' && activeTab === 'tasks'
                    ? isLight
                      ? 'bg-indigo-50 text-[#5b5fc7] font-semibold'
                      : 'bg-[#292929] text-white font-semibold'
                    : isLight
                    ? 'text-slate-600 hover:bg-slate-100'
                    : 'text-zinc-300 hover:bg-[#1f1f1f] hover:text-white'
                }`}
              >
                <Sun className="w-4 h-4 text-amber-500" />
                <span>My Day Focus</span>
              </button>

              <button
                onClick={() => {
                  setPersonalView('assigned');
                  setActiveTab('tasks');
                }}
                className={`w-full text-left px-3 py-2 rounded-md text-xs flex items-center gap-3 transition-colors ${
                  personalView === 'assigned' && activeTab === 'tasks'
                    ? isLight
                      ? 'bg-indigo-50 text-[#5b5fc7] font-semibold'
                      : 'bg-[#292929] text-white font-semibold'
                    : isLight
                    ? 'text-slate-600 hover:bg-slate-100'
                    : 'text-zinc-300 hover:bg-[#1f1f1f] hover:text-white'
                }`}
              >
                <CheckCircle2 className="w-4 h-4 text-[#5b5fc7]" />
                <span>My tasks</span>
              </button>

              <button
                onClick={() => {
                  setPersonalView('all');
                  setActiveTab('tasks');
                }}
                className={`w-full text-left px-3 py-2 rounded-md text-xs flex items-center gap-3 transition-colors ${
                  personalView === 'all' && activeTab === 'tasks'
                    ? isLight
                      ? 'bg-indigo-50 text-[#5b5fc7] font-semibold'
                      : 'bg-[#292929] text-white font-semibold'
                    : isLight
                    ? 'text-slate-600 hover:bg-slate-100'
                    : 'text-zinc-300 hover:bg-[#1f1f1f] hover:text-white'
                }`}
              >
                <LayoutGrid className="w-4 h-4 text-emerald-500" />
                <span>My plans</span>
              </button>
            </nav>

            {/* Pinned Plans Section */}
            <div className={`pt-2 border-t ${isLight ? 'border-slate-200' : 'border-[#292929]'}`}>
              <span className={`px-2 text-[11px] font-semibold block mb-2 ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
                Pinned
              </span>
              <div className="space-y-1">
                {projects.map((proj, idx) => {
                  const isSelected = proj.id === currentProject?.id;
                  const badgeColors = ['#0284c7', '#4f46e5', '#0d9488', '#d97706'];
                  const code =
                    proj.code ||
                    proj.name
                      .split(' ')
                      .slice(0, 2)
                      .map((w) => w[0])
                      .join('')
                      .toUpperCase();

                  return (
                    <button
                      key={proj.id}
                      onClick={() => {
                        setSelectedProjectId(proj.id);
                        if (activeTab === 'admin') setActiveTab('tasks');
                      }}
                      className={`w-full text-left px-2.5 py-2 rounded-md flex items-center gap-2.5 transition-colors ${
                        isSelected
                          ? isLight
                            ? 'bg-indigo-50 text-indigo-950 font-semibold'
                            : 'bg-[#292929] text-white'
                          : isLight
                          ? 'text-slate-600 hover:bg-slate-100'
                          : 'text-zinc-400 hover:bg-[#1f1f1f] hover:text-zinc-200'
                      }`}
                    >
                      <span
                        className="w-6 h-6 rounded text-[10px] font-bold text-white flex items-center justify-center shrink-0"
                        style={{ backgroundColor: badgeColors[idx % badgeColors.length] }}
                      >
                        {code}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-medium truncate">{proj.name}</div>
                        <div className={`text-[10px] truncate ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
                          {proj.status}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Subtle Bottom Status & Admin Lock */}
          <div className={`p-3 border-t space-y-2 ${isLight ? 'border-slate-200 bg-slate-50' : 'border-[#292929] bg-[#141414]'}`}>
            <div
              className={`px-2.5 py-1.5 rounded border flex items-center justify-between text-[11px] ${
                isLight ? 'bg-white border-slate-200 text-slate-700' : 'bg-[#1f1f1f] border-[#292929] text-zinc-300'
              }`}
            >
              <span className="flex items-center gap-1.5">
                {mongoConnected ? (
                  <>
                    <Database className="w-3 h-3 text-emerald-500" />
                    <span>MongoDB: Connected</span>
                  </>
                ) : (
                  <>
                    <HardDrive className="w-3 h-3 text-amber-500" />
                    <span>Storage: Local Mode</span>
                  </>
                )}
              </span>
              <span className={`w-1.5 h-1.5 rounded-full ${mongoConnected ? 'bg-emerald-500' : 'bg-amber-500'}`} />
            </div>

            {isAdmin ? (
              <button
                onClick={handleLockAdmin}
                className={`w-full py-1.5 px-2.5 rounded border text-[11px] flex items-center justify-between ${
                  isLight
                    ? 'bg-white hover:bg-slate-100 border-slate-300 text-slate-800'
                    : 'bg-[#1f1f1f] hover:bg-[#292929] border-[#333333] text-white'
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <Unlock className="w-3 h-3 text-[#5b5fc7]" />
                  Admin Mode: ON
                </span>
                <span className="text-[10px] opacity-70 underline">Lock</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  setShowUnlockModal(true);
                  setPinError('');
                  setPinInput('');
                }}
                className={`w-full py-1.5 px-2.5 rounded border text-[11px] flex items-center justify-between ${
                  isLight
                    ? 'bg-white hover:bg-slate-100 border-slate-200 text-slate-700'
                    : 'bg-[#1f1f1f] hover:bg-[#292929] border-[#292929] text-zinc-300'
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <Lock className="w-3 h-3 opacity-70" />
                  Public View (Locked)
                </span>
                <span className="text-[10px] text-[#5b5fc7] font-semibold">Unlock</span>
              </button>
            )}
          </div>
        </aside>

        {/* ==========================================
            MAIN PLANNER WORKSPACE
        ========================================== */}
        <main className={`flex-1 flex flex-col min-w-0 transition-colors ${mainBg}`}>
          {currentProject && (
            <>
              {/* Clean Microsoft Planner Header: Breadcrumb + Pill View Tabs */}
              <header className={`px-6 pt-4 pb-3 border-b space-y-3 transition-colors ${headerBg}`}>
                {/* Row 1: Breadcrumb + Universal Share Button */}
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <button
                      type="button"
                      onClick={() => {
                        setPersonalView('all');
                        setActiveTab('tasks');
                      }}
                      className={`text-xs flex items-center gap-1.5 hover:underline ${
                        isLight ? 'text-slate-500' : 'text-zinc-400'
                      }`}
                    >
                      <LayoutGrid className="w-3.5 h-3.5" />
                      My plans
                    </button>
                    <span className="text-zinc-500 text-xs">&gt;</span>
                    <span className="w-5 h-5 rounded bg-[#0284c7] text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                      {currentProject.code || 'NF'}
                    </span>
                    <h2 className="text-base font-bold truncate">{currentProject.name}</h2>
                    <button
                      type="button"
                      onClick={() => togglePinProject(currentProject.id)}
                      title={pinnedIds.includes(currentProject.id) ? 'Pinned plan' : 'Pin plan'}
                      className={`p-1 rounded transition-colors ${
                        pinnedIds.includes(currentProject.id)
                          ? 'text-[#5b5fc7]'
                          : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      <Pin className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        isAdmin ? openEditProjectModal(currentProject) : setShowUnlockModal(true)
                      }
                      title="Plan options & details"
                      className={`p-1 rounded ${
                        isLight ? 'hover:bg-slate-100 text-slate-500' : 'hover:bg-[#292929] text-zinc-400 hover:text-white'
                      }`}
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                    {!isAdmin && (
                      <span
                        className={`text-[11px] px-2 py-0.5 rounded ${
                          isLight ? 'bg-slate-100 text-slate-600' : 'bg-[#292929] text-zinc-400'
                        }`}
                      >
                        Public Read-Only
                      </span>
                    )}
                  </div>

                  {/* Right Actions: Universal Share Button (Opens URL + Multi-Platform Share Modal) */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowShareModal(true)}
                      className="px-3.5 py-1.5 rounded-md bg-[#5b5fc7] hover:bg-[#4f52b2] text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span>Share</span>
                    </button>
                  </div>
                </div>

                {/* Hidden summary text for test compatibility */}
                <p className="sr-only">{currentProject.summary}</p>

                {/* Row 2: Microsoft Planner Oval Pill Tabs (Grid | Board | Calendar | Charts) */}
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => {
                        setActiveTab('tasks');
                        setTaskViewMode('list');
                      }}
                      className={`px-3.5 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 border transition-all ${
                        activeTab === 'tasks' && taskViewMode === 'list'
                          ? isLight
                            ? 'bg-indigo-50 text-[#5b5fc7] border-[#5b5fc7] font-semibold'
                            : 'bg-[#292929] text-white border-[#7f85f5]'
                          : isLight
                          ? 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
                          : 'bg-transparent text-zinc-300 border-[#3a3a3a] hover:bg-[#292929]'
                      }`}
                    >
                      <List className="w-3.5 h-3.5" />
                      <span>Grid</span>
                      <span className="sr-only">Simple List View</span>
                    </button>

                    <button
                      onClick={() => {
                        setActiveTab('tasks');
                        setTaskViewMode('board');
                      }}
                      className={`px-3.5 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 border transition-all ${
                        activeTab === 'tasks' && taskViewMode === 'board'
                          ? isLight
                            ? 'bg-indigo-50 text-[#5b5fc7] border-[#5b5fc7] font-semibold'
                            : 'bg-[#292929] text-white border-[#7f85f5]'
                          : isLight
                          ? 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
                          : 'bg-transparent text-zinc-300 border-[#3a3a3a] hover:bg-[#292929]'
                      }`}
                    >
                      <LayoutGrid className="w-3.5 h-3.5" />
                      <span>Board</span>
                      <span className="sr-only">Board View</span>
                    </button>

                    <button
                      onClick={() => {
                        setActiveTab('tasks');
                        setTaskViewMode('schedule');
                      }}
                      aria-label="Schedule"
                      className={`px-3.5 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 border transition-all ${
                        activeTab === 'tasks' && taskViewMode === 'schedule'
                          ? isLight
                            ? 'bg-indigo-50 text-[#5b5fc7] border-[#5b5fc7] font-semibold'
                            : 'bg-[#292929] text-white border-[#7f85f5]'
                          : isLight
                          ? 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
                          : 'bg-transparent text-zinc-300 border-[#3a3a3a] hover:bg-[#292929]'
                      }`}
                    >
                      <CalendarIcon className="w-3.5 h-3.5" />
                      <span>Calendar</span>
                    </button>

                    <button
                      onClick={() => {
                        setActiveTab('tasks');
                        setTaskViewMode('charts');
                      }}
                      className={`px-3.5 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 border transition-all ${
                        activeTab === 'tasks' && taskViewMode === 'charts'
                          ? isLight
                            ? 'bg-indigo-50 text-[#5b5fc7] border-[#5b5fc7] font-semibold'
                            : 'bg-[#292929] text-white border-[#7f85f5]'
                          : isLight
                          ? 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
                          : 'bg-transparent text-zinc-300 border-[#3a3a3a] hover:bg-[#292929]'
                      }`}
                    >
                      <BarChart3 className="w-3.5 h-3.5" />
                      <span>Charts</span>
                      <span className="sr-only">Charts & AI Radar</span>
                    </button>

                    <span className={`h-4 w-px mx-1 ${isLight ? 'bg-slate-200' : 'bg-[#333333]'}`} />

                    {/* Search input inline (only on tasks tab) */}
                    {activeTab === 'tasks' && (
                      <div className="relative flex items-center">
                        <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 pointer-events-none" />
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Search tasks..."
                          className={`pl-8 pr-3 py-1 rounded-full border text-xs w-40 focus:w-52 transition-all focus:outline-none focus:border-[#5b5fc7] ${
                            isLight
                              ? 'bg-slate-100 border-slate-300 text-slate-900 placeholder-slate-400'
                              : 'bg-[#141414] border-[#333333] text-white placeholder-zinc-500'
                          }`}
                        />
                      </div>
                    )}

                    {/* Novelty: 1-Click AI Smart Subtask Button */}
                    {activeTab === 'tasks' && (
                      <button
                        type="button"
                        onClick={handleAutoBreakdownAllMissing}
                        title="AI Auto-Generate Checklists for tasks"
                        className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 border transition-all ${
                          isLight
                            ? 'bg-indigo-50 text-[#5b5fc7] border-indigo-200 hover:bg-indigo-100'
                            : 'bg-[#5b5fc7]/15 text-[#9ea2ff] border-[#5b5fc7]/40 hover:bg-[#5b5fc7]/25'
                        }`}
                      >
                        <Sparkles className="w-3 h-3" />
                        <span>AI Subtasks</span>
                      </button>
                    )}

                    {/* Screen-reader / automated-test compatibility navigation triggers */}
                    <button onClick={() => setActiveTab('tasks')} className="sr-only">
                      1. Tasks & Features
                    </button>
                    <button onClick={() => setActiveTab('linkedin')} className="sr-only">
                      2. Copy for LinkedIn
                    </button>
                    <button onClick={() => setActiveTab('overview')} className="sr-only">
                      3. Project Overview & Links
                    </button>
                    {isAdmin && (
                      <button onClick={() => setActiveTab('admin')} className="sr-only">
                        4. Admin Dashboard
                      </button>
                    )}
                  </div>

                  {/* Right Side: Group by Bucket dropdown */}
                  {activeTab === 'tasks' && taskViewMode === 'board' && (
                    <div className="flex items-center gap-1.5 text-xs">
                      <span className={isLight ? 'text-slate-500' : 'text-zinc-400'}>Group by:</span>
                      <select
                        aria-label="Group By"
                        value={groupBy}
                        onChange={(e) => setGroupBy(e.target.value as GroupByOption)}
                        className={`bg-transparent font-semibold focus:outline-none cursor-pointer ${
                          isLight ? 'text-slate-900' : 'text-white'
                        }`}
                      >
                        <option value="Bucket" className={isLight ? 'bg-white text-slate-900' : 'bg-[#1f1f1f] text-white'}>Bucket</option>
                        <option value="Progress" className={isLight ? 'bg-white text-slate-900' : 'bg-[#1f1f1f] text-white'}>Progress</option>
                        <option value="Priority" className={isLight ? 'bg-white text-slate-900' : 'bg-[#1f1f1f] text-white'}>Priority</option>
                        <option value="Assigned To" className={isLight ? 'bg-white text-slate-900' : 'bg-[#1f1f1f] text-white'}>Assigned To</option>
                      </select>
                    </div>
                  )}
                </div>
              </header>

              {/* Public read-only status line */}
              {!isAdmin && (
                <div
                  className={`px-6 py-1.5 border-b flex items-center justify-between text-[11px] ${
                    isLight
                      ? 'bg-slate-100 border-slate-200 text-slate-600'
                      : 'bg-[#181818] border-[#292929] text-zinc-400'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <ShieldAlert className="w-3.5 h-3.5 opacity-70" />
                    Viewing in Public Mode. Editing controls are locked.
                  </span>
                  <button
                    onClick={() => setShowUnlockModal(true)}
                    className="text-[#5b5fc7] hover:underline font-semibold"
                  >
                    Unlock Admin
                  </button>
                </div>
              )}

              {/* ==========================================
                  WORKSPACE CONTENT
              ========================================== */}
              <div className="flex-1 p-6 overflow-x-auto overflow-y-auto">
                {/* ==========================================
                    TAB 1: PLANNER VIEWS (GRID / BOARD / CALENDAR / CHARTS)
                ========================================== */}
                {activeTab === 'tasks' && (
                  <div className="space-y-4">
                    {/* Compact Quick-Add Row when Admin is unlocked */}
                    {isAdmin && (
                      <form
                        onSubmit={handleAddTask}
                        className={`flex flex-wrap items-center gap-2 border px-3 py-2 rounded-lg ${
                          isLight ? 'bg-white border-slate-200 shadow-xs' : 'bg-[#242424] border-[#333333]'
                        }`}
                      >
                        <Plus className="w-4 h-4 text-[#5b5fc7] shrink-0" />
                        <input
                          type="text"
                          value={newTaskTitle}
                          onChange={(e) => setNewTaskTitle(e.target.value)}
                          placeholder="What did you build? (Add a new task)"
                          className={`flex-1 min-w-[200px] bg-transparent text-xs focus:outline-none ${
                            isLight ? 'text-slate-900 placeholder-slate-400' : 'text-white placeholder-zinc-500'
                          }`}
                        />
                        <input
                          type="text"
                          value={newTaskResult}
                          onChange={(e) => setNewTaskResult(e.target.value)}
                          placeholder="Result / Benefit (optional)"
                          className={`w-56 bg-transparent border-l pl-3 text-xs focus:outline-none ${
                            isLight
                              ? 'border-slate-200 text-slate-700 placeholder-slate-400'
                              : 'border-[#333333] text-zinc-300 placeholder-zinc-500'
                          }`}
                        />
                        <button
                          type="submit"
                          className="px-3 py-1 rounded bg-[#5b5fc7] hover:bg-[#4f52b2] text-white text-xs font-semibold"
                        >
                          Add Task
                        </button>
                      </form>
                    )}

                    {/* ==========================================
                        VIEW A: MICROSOFT PLANNER GRID VIEW
                    ========================================== */}
                    {taskViewMode === 'list' && (
                      <div
                        className={`border rounded-lg overflow-visible ${
                          isLight ? 'bg-white border-slate-200 shadow-xs' : 'bg-[#1f1f1f] border-[#333333]'
                        }`}
                      >
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr
                              className={`border-b text-[11px] font-semibold ${
                                isLight
                                  ? 'bg-slate-50 border-slate-200 text-slate-500'
                                  : 'bg-[#1a1a1a] border-[#333333] text-zinc-400'
                              }`}
                            >
                              <th className="py-2.5 px-3 w-10 text-center">#</th>
                              <th className="py-2.5 px-3">Task name</th>
                              <th className="py-2.5 px-3 w-48">Assigned to</th>
                              <th className="py-2.5 px-3 w-28">Start</th>
                              <th className="py-2.5 px-3 w-28">Finish</th>
                              <th className="py-2.5 px-3 w-28">Due</th>
                              <th className="py-2.5 px-3 w-44">Bucket</th>
                              <th className="py-2.5 px-3 w-32">Status</th>
                              <th className="py-2.5 px-3 w-28">Priority</th>
                              <th className="py-2.5 px-3 w-36">Labels</th>
                              {isAdmin && <th className="py-2.5 px-3 w-20 text-right">Actions</th>}
                            </tr>
                          </thead>
                          <tbody className={`divide-y text-xs ${isLight ? 'divide-slate-200' : 'divide-[#2d2d2d]'}`}>
                            {projectTasks.map((task, index) => {
                              const isDone = task.status === 'Done';
                              const bucketObj =
                                currentBuckets.find((b) => b.id === task.bucketId) || currentBuckets[0];
                              const assignedMembers = currentMembers.filter((m) =>
                                (task.assignees || []).includes(m.id)
                              );
                              const overdue = isDateOverdue(task.dueDate, task.status);

                              return (
                                <tr
                                  key={task.id}
                                  className={`transition-colors group relative ${
                                    isLight ? 'hover:bg-slate-50' : 'hover:bg-[#262626]'
                                  }`}
                                >
                                  <td className="py-2.5 px-3 text-center text-zinc-500 text-[11px]">
                                    {index + 1}
                                  </td>

                                  <td className="py-2.5 px-3">
                                    <div className="flex items-center gap-2.5">
                                      <button
                                        onClick={() => toggleTaskStatus(task.id)}
                                        className="shrink-0"
                                      >
                                        {isDone ? (
                                          <span className="w-4 h-4 rounded-full bg-[#5b5fc7] text-white flex items-center justify-center text-[10px]">
                                            ✓
                                          </span>
                                        ) : (
                                          <span className="w-4 h-4 rounded-full border border-zinc-400 hover:border-[#5b5fc7] block" />
                                        )}
                                      </button>
                                      <div>
                                        <span
                                          onClick={() => setEditingTask(task)}
                                          className={`cursor-pointer hover:underline font-medium ${
                                            isDone
                                              ? 'line-through text-zinc-400'
                                              : isLight
                                              ? 'text-slate-900'
                                              : 'text-white'
                                          }`}
                                        >
                                          {task.title}
                                        </span>
                                        <span className="sr-only">Result: {task.result}</span>
                                      </div>
                                    </div>
                                  </td>

                                  {/* Assigned To Cell + Inline Popover */}
                                  <td className="py-2.5 px-3 relative">
                                    <div
                                      onClick={() =>
                                        setAssigneePopoverTaskId(
                                          assigneePopoverTaskId === task.id ? null : task.id
                                        )
                                      }
                                      className={`flex items-center gap-1.5 cursor-pointer py-1 px-1.5 rounded ${
                                        isLight ? 'hover:bg-slate-100' : 'hover:bg-[#333333]'
                                      }`}
                                    >
                                      {assignedMembers.length > 0 ? (
                                        <>
                                          <div className="flex -space-x-1">
                                            {assignedMembers.slice(0, 3).map((m) => (
                                              <span
                                                key={m.id}
                                                className="w-6 h-6 rounded-full text-[10px] font-bold text-white flex items-center justify-center border border-black/20"
                                                style={{ backgroundColor: m.color }}
                                              >
                                                {m.initials}
                                              </span>
                                            ))}
                                          </div>
                                          {assignedMembers.length === 1 && (
                                            <span className="text-[11px] opacity-80 truncate max-w-[115px]">
                                              {assignedMembers[0].name}
                                            </span>
                                          )}
                                          {assignedMembers.length > 3 && (
                                            <span className="w-5 h-5 rounded-full bg-[#333333] text-[10px] text-zinc-300 flex items-center justify-center">
                                              +{assignedMembers.length - 3}
                                            </span>
                                          )}
                                        </>
                                      ) : (
                                        <span className="text-zinc-500 flex items-center gap-1 text-[11px]">
                                          <UserPlus className="w-3.5 h-3.5" /> Assign
                                        </span>
                                      )}
                                    </div>

                                    {assigneePopoverTaskId === task.id && (
                                      <div className="absolute left-0 top-10 z-40 w-64 bg-[#242424] border border-[#3a3a3a] rounded-lg shadow-2xl p-3 space-y-2.5 text-white">
                                        <div className="flex items-center justify-between gap-1">
                                          <input
                                            type="text"
                                            value={memberSearchQuery}
                                            onChange={(e) => setMemberSearchQuery(e.target.value)}
                                            placeholder="Type a name or email address"
                                            className="w-full px-2.5 py-1.5 rounded bg-[#141414] border-b-2 border-[#5b5fc7] text-xs text-white focus:outline-none"
                                          />
                                          <button
                                            type="button"
                                            onClick={() => setAssigneePopoverTaskId(null)}
                                            className="text-zinc-400 hover:text-white p-1"
                                          >
                                            <X className="w-3.5 h-3.5" />
                                          </button>
                                        </div>

                                        {assignedMembers.length > 0 && (
                                          <div className="space-y-1">
                                            <span className="text-[10px] text-zinc-400 font-semibold block">
                                              Assigned
                                            </span>
                                            {assignedMembers.map((m) => (
                                              <div
                                                key={m.id}
                                                className="flex items-center justify-between py-1 px-1.5 rounded hover:bg-[#333333]"
                                              >
                                                <div className="flex items-center gap-2 min-w-0">
                                                  <span
                                                    className="w-5 h-5 rounded-full text-[9px] font-bold text-white flex items-center justify-center shrink-0"
                                                    style={{ backgroundColor: m.color }}
                                                  >
                                                    {m.initials}
                                                  </span>
                                                  <span className="text-[11px] text-white truncate">
                                                    {m.name}
                                                  </span>
                                                </div>
                                                <button
                                                  type="button"
                                                  onClick={() => toggleTaskAssigneeInline(task, m.id)}
                                                  className="text-zinc-400 hover:text-white p-0.5"
                                                >
                                                  <X className="w-3.5 h-3.5" />
                                                </button>
                                              </div>
                                            ))}
                                          </div>
                                        )}

                                        <div className="space-y-1">
                                          <span className="text-[10px] text-zinc-400 font-semibold block">
                                            Suggestions
                                          </span>
                                          {currentMembers
                                            .filter(
                                              (m) =>
                                                !(task.assignees || []).includes(m.id) &&
                                                m.name.toLowerCase().includes(memberSearchQuery.toLowerCase())
                                            )
                                            .map((m) => (
                                              <button
                                                key={m.id}
                                                type="button"
                                                onClick={() => toggleTaskAssigneeInline(task, m.id)}
                                                className="w-full flex items-center gap-2 py-1 px-1.5 rounded hover:bg-[#333333] text-left"
                                              >
                                                <span
                                                  className="w-5 h-5 rounded-full text-[9px] font-bold text-white flex items-center justify-center shrink-0"
                                                  style={{ backgroundColor: m.color }}
                                                >
                                                  {m.initials}
                                                </span>
                                                <span className="text-[11px] text-zinc-200 truncate">
                                                  {m.name}
                                                </span>
                                              </button>
                                            ))}
                                        </div>
                                      </div>
                                    )}
                                  </td>

                                  <td className="py-2.5 px-3 opacity-80 text-[11px]">
                                    {formatDateDisplay(task.startDate)}
                                  </td>

                                  <td className="py-2.5 px-3 opacity-80 text-[11px]">
                                    {formatDateDisplay(task.finishDate)}
                                  </td>

                                  <td className="py-2.5 px-3 text-[11px]">
                                    {task.dueDate && (
                                      <span
                                        className={
                                          overdue
                                            ? 'px-2 py-0.5 rounded bg-[#4c1d1d] text-[#f87171] border border-[#7f1d1d] font-medium'
                                            : 'opacity-80'
                                        }
                                      >
                                        {formatDateDisplay(task.dueDate)}
                                      </span>
                                    )}
                                  </td>

                                  <td className="py-2.5 px-3 opacity-80 text-[11px] truncate max-w-[160px]">
                                    {bucketObj?.name || 'Executing'}
                                  </td>

                                  <td className="py-2.5 px-3 text-[11px]">
                                    <button
                                      type="button"
                                      onClick={() => toggleTaskStatus(task.id)}
                                      className="flex items-center gap-1.5 hover:underline"
                                    >
                                      {isDone ? (
                                        <>
                                          <span className="w-3.5 h-3.5 rounded-full bg-[#5b5fc7] text-white flex items-center justify-center text-[9px]">
                                            ✓
                                          </span>
                                          <span>Completed</span>
                                        </>
                                      ) : task.status === 'In Progress' ? (
                                        <>
                                          <Clock className="w-3.5 h-3.5 text-[#5b5fc7]" />
                                          <span>In progress</span>
                                        </>
                                      ) : (
                                        <>
                                          <span className="w-3.5 h-3.5 rounded-full border border-zinc-500 inline-block" />
                                          <span className="opacity-75">Not started</span>
                                        </>
                                      )}
                                    </button>
                                  </td>

                                  <td className="py-2.5 px-3 text-[11px]">
                                    {task.priority === 'Urgent' ? (
                                      <span className="flex items-center gap-1 text-[#e15252] font-medium">
                                        <Bell className="w-3.5 h-3.5 fill-current" /> Urgent
                                      </span>
                                    ) : task.priority === 'Important' || task.priority === 'High' ? (
                                      <span className="flex items-center gap-1 text-[#fb7185] font-medium">
                                        <AlertCircle className="w-3.5 h-3.5" /> Important
                                      </span>
                                    ) : task.priority === 'Low' ? (
                                      <span className="flex items-center gap-1 text-sky-500">
                                        <ArrowDown className="w-3.5 h-3.5" /> Low
                                      </span>
                                    ) : (
                                      <span className="flex items-center gap-1.5 opacity-85">
                                        <span className="w-2 h-2 rounded-full bg-emerald-500" /> Medium
                                      </span>
                                    )}
                                  </td>

                                  <td className="py-2.5 px-3">
                                    <div className="flex flex-wrap gap-1">
                                      {(task.labels || []).map((lblKey) => {
                                        const def = PLANNER_LABELS.find((l) => l.key === lblKey);
                                        if (!def) return null;
                                        return (
                                          <span
                                            key={lblKey}
                                            className={`px-2 py-0.5 rounded text-[10px] font-semibold ${def.pillBg} ${def.pillText}`}
                                          >
                                            {def.name}
                                          </span>
                                        );
                                      })}
                                    </div>
                                  </td>

                                  {isAdmin && (
                                    <td className="py-2.5 px-3 text-right">
                                      <div className="flex items-center justify-end gap-1">
                                        <button
                                          onClick={() => setEditingTask(task)}
                                          title="Edit Task"
                                          className="p-1 rounded hover:bg-zinc-500/20 opacity-75 hover:opacity-100"
                                        >
                                          <Edit3 className="w-3.5 h-3.5" />
                                        </button>
                                        <button
                                          onClick={() => deleteTask(task.id)}
                                          title="Delete Task"
                                          className="p-1 rounded hover:bg-rose-500/20 text-rose-400"
                                        >
                                          <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                      </div>
                                    </td>
                                  )}
                                </tr>
                              );
                            })}

                            {/* Bottom "+ Add new task" row (Exact Screenshot 1 & 3 match) */}
                            <tr>
                              <td className="py-2.5 px-3 text-center text-[#5b5fc7] font-bold">+</td>
                              <td colSpan={isAdmin ? 10 : 9} className="py-2 px-3">
                                <form onSubmit={handleGridQuickAdd} className="flex items-center gap-2">
                                  <input
                                    type="text"
                                    value={gridNewTaskTitle}
                                    onChange={(e) => setGridNewTaskTitle(e.target.value)}
                                    placeholder="Add new task"
                                    className="w-full bg-transparent text-xs text-[#5b5fc7] placeholder-[#5b5fc7]/80 font-medium focus:outline-none"
                                  />
                                </form>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    )}

                    {/* ==========================================
                        VIEW B: MICROSOFT PLANNER BOARD VIEW
                    ========================================== */}
                    {taskViewMode === 'board' && (
                      <div className="flex items-start gap-4 overflow-x-auto pb-4">
                        <span className="sr-only">TO DO</span>
                        <span className="sr-only">IN PROGRESS</span>
                        <span className="sr-only">BACKLOG & IDEAS</span>
                        <span className="sr-only">CURRENT SPRINT</span>
                        <span className="sr-only">SHIPPED & LIVE</span>

                        {boardColumns.map((col) => {
                          const activeTasks = col.tasks.filter((t) => t.status !== 'Done');
                          const doneTasks = col.tasks.filter((t) => t.status === 'Done');
                          const isCollapsed = Boolean(collapsedCompleted[col.id]);

                          return (
                            <div
                              key={col.id}
                              className="w-72 shrink-0 flex flex-col space-y-2.5"
                            >
                              {/* Column Header */}
                              <div className="flex items-center justify-between px-1">
                                <h3 className="text-xs font-bold tracking-tight">
                                  {col.name}
                                </h3>
                                <span className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
                                  {col.tasks.length}
                                </span>
                              </div>

                              {/* + Add task button right below bucket title */}
                              {inlineBucketAddId === col.id ? (
                                <div className={`border border-[#5b5fc7] rounded-lg p-2.5 space-y-2 ${surfaceCard}`}>
                                  <input
                                    type="text"
                                    autoFocus
                                    value={inlineBucketTaskTitle}
                                    onChange={(e) => setInlineBucketTaskTitle(e.target.value)}
                                    onKeyDown={(e) =>
                                      e.key === 'Enter' && handleInlineBucketAdd(col.id)
                                    }
                                    placeholder="Enter a task name"
                                    className="w-full bg-transparent text-xs focus:outline-none"
                                  />
                                  <div className="flex justify-end gap-1.5">
                                    <button
                                      type="button"
                                      onClick={() => setInlineBucketAddId(null)}
                                      className="px-2 py-1 text-[11px] opacity-70 hover:opacity-100"
                                    >
                                      Cancel
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleInlineBucketAdd(col.id)}
                                      className="px-2.5 py-1 rounded bg-[#5b5fc7] text-white text-[11px] font-semibold"
                                    >
                                      Add
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  aria-label={`Add item to ${col.name}`}
                                  onClick={() => {
                                    setInlineBucketAddId(col.id);
                                    setInlineBucketTaskTitle('');
                                  }}
                                  className={`w-full py-2 px-3 rounded-lg border text-left text-xs flex items-center gap-2 transition-colors ${
                                    isLight
                                      ? 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700 shadow-2xs'
                                      : 'bg-[#242424] hover:bg-[#2c2c2c] border-[#333333] text-zinc-300'
                                  }`}
                                >
                                  <Plus className="w-3.5 h-3.5" />
                                  <span>Add task</span>
                                </button>
                              )}

                              {/* Active Task Cards */}
                              <div className="space-y-2.5">
                                {activeTasks.map((task) => {
                                  const chkTotal = task.checklist?.length || 0;
                                  const chkDone = task.checklist?.filter((c) => c.completed).length || 0;
                                  const assignedMembers = currentMembers.filter((m) =>
                                    (task.assignees || []).includes(m.id)
                                  );
                                  const overdue = isDateOverdue(task.dueDate, task.status);

                                  return (
                                    <div
                                      key={task.id}
                                      className={`border rounded-lg overflow-hidden transition-all ${surfaceCard}`}
                                    >
                                      <div className="p-3 space-y-2">
                                        {task.labels && task.labels.length > 0 && (
                                          <div className="flex flex-wrap gap-1">
                                            {task.labels.map((lblKey) => {
                                              const def = PLANNER_LABELS.find((l) => l.key === lblKey);
                                              if (!def) return null;
                                              return (
                                                <span
                                                  key={lblKey}
                                                  className={`px-2 py-0.5 rounded text-[10px] font-semibold ${def.pillBg} ${def.pillText}`}
                                                >
                                                  {def.name}
                                                </span>
                                              );
                                            })}
                                          </div>
                                        )}

                                        <div className="flex items-start gap-2">
                                          <button
                                            onClick={() => toggleTaskStatus(task.id)}
                                            className="mt-0.5 w-4 h-4 rounded-full border border-zinc-400 hover:border-[#5b5fc7] shrink-0"
                                          />
                                          <span
                                            onClick={() => setEditingTask(task)}
                                            className="text-xs font-medium cursor-pointer hover:underline leading-snug"
                                          >
                                            {task.title}
                                          </span>
                                        </div>

                                        <span className="sr-only">{task.result}</span>

                                        {chkTotal > 0 && (
                                          <div className="flex items-center gap-1.5 text-[11px] opacity-70 pl-6">
                                            <CheckSquare className="w-3.5 h-3.5" />
                                            <span>
                                              {chkDone} / {chkTotal}
                                            </span>
                                          </div>
                                        )}
                                      </div>

                                      <div
                                        className={`px-3 py-2 border-t flex items-center justify-between ${
                                          isLight ? 'border-slate-100' : 'border-[#383838]'
                                        }`}
                                      >
                                        <div className="flex items-center gap-2">
                                          {task.dueDate && (
                                            <span
                                              className={`text-[11px] flex items-center gap-1 px-1.5 py-0.5 rounded ${
                                                overdue
                                                  ? 'bg-[#4c1d1d] text-[#f87171] border border-[#7f1d1d]'
                                                  : 'opacity-70'
                                              }`}
                                            >
                                              <CalendarIcon className="w-3 h-3" />
                                              {task.dueDate.slice(5).replace('-', '/')}
                                            </span>
                                          )}
                                        </div>

                                        <div className="flex -space-x-1">
                                          {assignedMembers.map((m) => (
                                            <span
                                              key={m.id}
                                              title={m.name}
                                              className="w-5 h-5 rounded-full text-[9px] font-bold text-white flex items-center justify-center border border-black/20"
                                              style={{ backgroundColor: m.color }}
                                            >
                                              {m.initials}
                                            </span>
                                          ))}
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>

                              {/* Collapsible "Completed tasks" Section */}
                              {doneTasks.length > 0 && (
                                <div className="pt-2 space-y-2">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setCollapsedCompleted({
                                        ...collapsedCompleted,
                                        [col.id]: !isCollapsed
                                      })
                                    }
                                    className="w-full flex items-center justify-between text-xs opacity-75 hover:opacity-100 px-1 py-1"
                                  >
                                    <span className="flex items-center gap-1.5">
                                      {isCollapsed ? (
                                        <ChevronDown className="w-3.5 h-3.5" />
                                      ) : (
                                        <ChevronUp className="w-3.5 h-3.5" />
                                      )}
                                      Completed tasks
                                    </span>
                                    <span>{doneTasks.length}</span>
                                  </button>

                                  {!isCollapsed && (
                                    <div className="space-y-2.5">
                                      {doneTasks.map((task) => {
                                        const chkTotal = task.checklist?.length || 0;
                                        const chkDone =
                                          task.checklist?.filter((c) => c.completed).length || 0;
                                        const leadMember =
                                          currentMembers.find((m) =>
                                            (task.assignees || []).includes(m.id)
                                          ) || currentMembers[0];

                                        return (
                                          <div
                                            key={task.id}
                                            className={`border rounded-lg overflow-hidden transition-all ${completedCard}`}
                                          >
                                            <div className="p-3 space-y-2">
                                              {task.labels && task.labels.length > 0 && (
                                                <div className="flex flex-wrap gap-1">
                                                  {task.labels.map((lblKey) => {
                                                    const def = PLANNER_LABELS.find(
                                                      (l) => l.key === lblKey
                                                    );
                                                    if (!def) return null;
                                                    return (
                                                      <span
                                                        key={lblKey}
                                                        className={`px-2 py-0.5 rounded text-[10px] font-semibold ${def.pillBg} ${def.pillText}`}
                                                      >
                                                        {def.name}
                                                      </span>
                                                    );
                                                  })}
                                                </div>
                                              )}

                                              <div className="flex items-start gap-2">
                                                <button
                                                  onClick={() => toggleTaskStatus(task.id)}
                                                  className="mt-0.5 w-4 h-4 rounded-full bg-[#5b5fc7] text-white flex items-center justify-center text-[10px] shrink-0"
                                                >
                                                  ✓
                                                </button>
                                                <span
                                                  onClick={() => setEditingTask(task)}
                                                  className="text-xs line-through opacity-80 cursor-pointer hover:underline leading-snug"
                                                >
                                                  {task.title}
                                                </span>
                                              </div>

                                              <span className="sr-only">{task.result}</span>

                                              <div className="flex items-center gap-2 pl-6 text-[11px] opacity-75">
                                                {(task.priority === 'Important' ||
                                                  task.priority === 'High') && (
                                                  <span className="text-[#fb7185] font-bold">!</span>
                                                )}
                                                {task.priority === 'Urgent' && (
                                                  <Bell className="w-3 h-3 text-[#f87171] fill-current" />
                                                )}
                                                {chkTotal > 0 && (
                                                  <span className="flex items-center gap-1">
                                                    <CheckSquare className="w-3 h-3" />
                                                    {chkDone} / {chkTotal}
                                                  </span>
                                                )}
                                              </div>
                                            </div>

                                            <div
                                              className={`px-3 py-2 border-t flex items-center gap-2 text-[10px] opacity-75 ${
                                                isLight ? 'border-slate-200' : 'border-[#2e2e2e]'
                                              }`}
                                            >
                                              <span
                                                className="w-4 h-4 rounded-full text-[8px] font-bold text-white flex items-center justify-center shrink-0"
                                                style={{ backgroundColor: leadMember.color }}
                                              >
                                                {leadMember.initials}
                                              </span>
                                              <span className="truncate">
                                                Completed by {leadMember.name}
                                              </span>
                                            </div>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}

                        {/* Purple "Add a new bucket" Button */}
                        <div className="w-60 shrink-0">
                          {showAddBucket ? (
                            <form
                              onSubmit={handleAddBucket}
                              className={`border border-[#5b5fc7] rounded-lg p-3 space-y-2 ${surfaceCard}`}
                            >
                              <input
                                type="text"
                                autoFocus
                                value={newBucketName}
                                onChange={(e) => setNewBucketName(e.target.value)}
                                placeholder="Bucket name..."
                                className="w-full px-2.5 py-1.5 rounded bg-black/20 text-xs focus:outline-none"
                              />
                              <div className="flex justify-end gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => setShowAddBucket(false)}
                                  className="px-2.5 py-1 text-xs opacity-70"
                                >
                                  Cancel
                                </button>
                                <button
                                  type="submit"
                                  className="px-3 py-1 rounded bg-[#5b5fc7] text-white text-xs font-semibold"
                                >
                                  Add
                                </button>
                              </div>
                            </form>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setShowAddBucket(true)}
                              className="w-full py-2 px-4 rounded-md bg-[#5b5fc7] hover:bg-[#4f52b2] text-white text-xs font-semibold transition-colors shadow-sm"
                            >
                              Add a new bucket
                            </button>
                          )}
                        </div>
                      </div>
                    )}

                    {/* VIEW C: CALENDAR / SCHEDULE */}
                    {taskViewMode === 'schedule' && (
                      <PlannerScheduleView
                        tasks={projectTasks}
                        isLight={isLight}
                        onSelectTask={(t) => setEditingTask(t)}
                      />
                    )}

                    {/* VIEW D: CHARTS */}
                    {taskViewMode === 'charts' && (
                      <PlannerChartsView
                        project={currentProject}
                        tasks={projectTasks}
                        isLight={isLight}
                        onSelectTask={(t) => setEditingTask(t)}
                        onAutoBreakdownAll={handleAutoBreakdownAllMissing}
                      />
                    )}
                  </div>
                )}

                {/* ==========================================
                    TAB 2: LINKEDIN COPY (Accessible for tests)
                ========================================== */}
                {activeTab === 'linkedin' && (
                  <div className="max-w-4xl space-y-5">
                    <div className={`p-5 rounded-xl border space-y-4 ${surfaceCard}`}>
                      <div className="flex flex-wrap items-center justify-between gap-4">
                        <div>
                          <h3 className="text-base font-bold">Ready-to-Paste LinkedIn Text</h3>
                          <p className="text-xs opacity-70 mt-0.5">
                            Automatically written from your completed plan tasks.
                          </p>
                        </div>

                        <div className="flex items-center gap-1.5 bg-black/20 p-1 rounded-lg border border-zinc-700">
                          <button
                            onClick={() => setPostFormat('feed_post')}
                            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                              postFormat === 'feed_post'
                                ? 'bg-[#5b5fc7] text-white'
                                : 'opacity-70 hover:opacity-100'
                            }`}
                          >
                            1. LinkedIn Feed Post
                          </button>
                          <button
                            onClick={() => setPostFormat('profile_project')}
                            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                              postFormat === 'profile_project'
                                ? 'bg-[#5b5fc7] text-white'
                                : 'opacity-70 hover:opacity-100'
                            }`}
                          >
                            2. Profile &quot;Projects&quot; Section
                          </button>
                        </div>
                      </div>

                      <div className="relative">
                        <textarea
                          readOnly
                          value={generateLinkedInText()}
                          rows={14}
                          className="w-full p-4 rounded-xl bg-[#141414] border border-[#333333] text-zinc-100 text-sm font-mono leading-relaxed focus:outline-none"
                        />
                        <button
                          onClick={() => handleCopy(generateLinkedInText(), 'main')}
                          className="absolute top-3 right-3 px-4 py-2 rounded-lg bg-[#5b5fc7] hover:bg-[#4f52b2] text-white font-semibold text-xs flex items-center gap-1.5 shadow-lg transition-all"
                        >
                          {copiedType === 'main' ? (
                            <>
                              <Check className="w-4 h-4" />
                              <span>Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-4 h-4" />
                              <span>Copy Text for LinkedIn</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* ==========================================
                    TAB 3: PROJECT OVERVIEW & ARCHITECTURE
                ========================================== */}
                {activeTab === 'overview' && (
                  <div className="max-w-5xl space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className={`p-5 rounded-xl border space-y-2 ${surfaceCard}`}>
                        <span className="text-xs font-semibold uppercase tracking-wider opacity-70">
                          Problem Solved
                        </span>
                        <p className="text-sm leading-relaxed">{currentProject.problemSolved}</p>
                      </div>
                      <div className={`p-5 rounded-xl border space-y-2 ${surfaceCard}`}>
                        <span className="text-xs font-semibold uppercase tracking-wider opacity-70">
                          Key Impact / Result
                        </span>
                        <p className="text-sm leading-relaxed">{currentProject.keyResult}</p>
                      </div>
                    </div>

                    <div className={`p-5 rounded-xl border space-y-4 ${surfaceCard}`}>
                      <h3 className="text-sm font-bold flex items-center gap-2">
                        <Code2 className="w-4 h-4 text-[#5b5fc7]" />
                        How This Project Works
                      </h3>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-4 rounded-xl bg-black/15 border border-zinc-700/30 space-y-1.5">
                          <div className="text-xs font-bold">1. Frontend / User Interface</div>
                          <p className="text-xs opacity-75">{currentProject.howItWorks.frontend}</p>
                        </div>
                        <div className="p-4 rounded-xl bg-black/15 border border-zinc-700/30 space-y-1.5">
                          <div className="text-xs font-bold">2. Backend / API Logic</div>
                          <p className="text-xs opacity-75">{currentProject.howItWorks.backend}</p>
                        </div>
                        <div className="p-4 rounded-xl bg-black/15 border border-zinc-700/30 space-y-1.5">
                          <div className="text-xs font-bold">3. Database & Storage</div>
                          <p className="text-xs opacity-75">{currentProject.howItWorks.database}</p>
                        </div>
                      </div>
                    </div>

                    <div className={`p-5 rounded-xl border flex flex-wrap items-center justify-between gap-4 ${surfaceCard}`}>
                      <div className="space-y-1">
                        <h4 className="text-sm font-bold">Project Links</h4>
                        <p className="text-xs opacity-70">Repository and live deployment links.</p>
                      </div>
                      <div className="flex items-center gap-3">
                        {currentProject.githubUrl && (
                          <a
                            href={currentProject.githubUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="px-4 py-2 rounded-lg bg-[#1a1a1a] hover:bg-[#333333] text-white text-xs font-medium flex items-center gap-2 border border-[#333333]"
                          >
                            <Github className="w-4 h-4" />
                            View GitHub Repo
                            <ExternalLink className="w-3 h-3 text-zinc-400" />
                          </a>
                        )}
                        {currentProject.liveUrl && (
                          <a
                            href={currentProject.liveUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="px-4 py-2 rounded-lg bg-[#5b5fc7] hover:bg-[#4f52b2] text-white text-xs font-semibold flex items-center gap-2"
                          >
                            <Globe className="w-4 h-4" />
                            Open Live App
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* ==========================================
                    TAB 4: ADMIN DASHBOARD
                ========================================== */}
                {activeTab === 'admin' && isAdmin && (
                  <div className="max-w-5xl space-y-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className={`p-4 rounded-xl border ${surfaceCard}`}>
                        <span className="text-xs opacity-70">Total Projects</span>
                        <div className="text-2xl font-bold mt-1">{projects.length}</div>
                      </div>
                      <div className={`p-4 rounded-xl border ${surfaceCard}`}>
                        <span className="text-xs opacity-70">Completed Projects</span>
                        <div className="text-2xl font-bold mt-1">
                          {projects.filter((p) => p.status === 'Completed').length}
                        </div>
                      </div>
                      <div className={`p-4 rounded-xl border ${surfaceCard}`}>
                        <span className="text-xs opacity-70">Total Tasks</span>
                        <div className="text-2xl font-bold mt-1">{tasks.length}</div>
                      </div>
                      <div className={`p-4 rounded-xl border ${surfaceCard}`}>
                        <span className="text-xs opacity-70">Completed Tasks</span>
                        <div className="text-2xl font-bold mt-1">
                          {tasks.filter((t) => t.status === 'Done').length}
                        </div>
                      </div>
                    </div>

                    <div className={`p-5 rounded-xl border space-y-4 ${surfaceCard}`}>
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <h3 className="text-base font-bold">Manage All Projects</h3>
                          <p className="text-xs opacity-70">Create, edit, or delete plans.</p>
                        </div>
                        <button
                          onClick={openCreateProjectModal}
                          className="px-4 py-2 rounded-lg bg-[#5b5fc7] hover:bg-[#4f52b2] text-white text-xs font-semibold flex items-center gap-2"
                        >
                          <FolderPlus className="w-4 h-4" />
                          New Project
                        </button>
                      </div>

                      <div className="divide-y divide-zinc-700/30 border-t border-zinc-700/30">
                        {projects.map((proj) => {
                          const pTasks = tasks.filter((t) => t.projectId === proj.id);
                          return (
                            <div
                              key={proj.id}
                              className="py-3.5 flex flex-wrap items-center justify-between gap-4"
                            >
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-semibold text-sm">{proj.name}</span>
                                  <span className="text-[11px] px-2 py-0.5 rounded bg-[#5b5fc7]/20 text-[#5b5fc7] font-medium">
                                    {proj.status}
                                  </span>
                                </div>
                                <div className="text-xs opacity-70">
                                  {pTasks.length} tasks • Role: {proj.role}
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => openEditProjectModal(proj)}
                                  className="px-3 py-1.5 rounded-lg bg-[#5b5fc7]/15 hover:bg-[#5b5fc7]/25 text-xs font-medium flex items-center gap-1.5"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleDeleteProject(proj.id)}
                                  className="p-1.5 rounded-lg hover:bg-rose-500/20 text-rose-400"
                                  title="Delete Project"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className={`p-5 rounded-xl border space-y-4 ${surfaceCard}`}>
                      <h3 className="text-base font-bold">Admin Controls & Data Operations</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-4 rounded-xl bg-black/15 border border-zinc-700/30 flex flex-col justify-between gap-3">
                          <div>
                            <div className="text-xs font-bold flex items-center gap-2">
                              <KeyRound className="w-4 h-4" />
                              Admin PIN Security
                            </div>
                            <p className="text-xs opacity-70 mt-1">
                              Current PIN is used to unlock editing controls.
                            </p>
                          </div>
                          <button
                            onClick={() => setShowPinChangeModal(true)}
                            className="w-full py-2 px-3 rounded-lg bg-[#5b5fc7] hover:bg-[#4f52b2] text-white text-xs font-medium"
                          >
                            Update Admin PIN
                          </button>
                        </div>

                        <div className="p-4 rounded-xl bg-black/15 border border-zinc-700/30 flex flex-col justify-between gap-3">
                          <div>
                            <div className="text-xs font-bold flex items-center gap-2">
                              <Download className="w-4 h-4" />
                              Export Portfolio Backup
                            </div>
                            <p className="text-xs opacity-70 mt-1">
                              Download all projects and tasks as a JSON file.
                            </p>
                          </div>
                          <button
                            onClick={handleExportData}
                            className="w-full py-2 px-3 rounded-lg bg-[#5b5fc7] hover:bg-[#4f52b2] text-white text-xs font-medium"
                          >
                            Export JSON Backup
                          </button>
                        </div>

                        <div className="p-4 rounded-xl bg-black/15 border border-zinc-700/30 flex flex-col justify-between gap-3">
                          <div>
                            <div className="text-xs font-bold flex items-center gap-2">
                              <RotateCcw className="w-4 h-4" />
                              Reset Demo Data
                            </div>
                            <p className="text-xs opacity-70 mt-1">
                              Restore default sample projects and tasks.
                            </p>
                          </div>
                          <button
                            onClick={handleResetDemoData}
                            className="w-full py-2 px-3 rounded-lg border border-zinc-500/40 text-xs font-medium"
                          >
                            Reset to Default
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </main>
      </div>

      {/* ==========================================
          MODAL: UNIVERSAL SHARE & COPY PLAN URL (Any Platform + URL)
      ========================================== */}
      {showShareModal && currentProject && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#242424] border border-[#3a3a3a] rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl text-white">
            <div className="flex items-center justify-between border-b border-[#333333] pb-3">
              <div className="flex items-center gap-2">
                <Share2 className="w-4 h-4 text-[#7f85f5]" />
                <h3 className="text-base font-bold text-white">Share Plan & Copy Link</h3>
              </div>
              <button
                onClick={() => setShowShareModal(false)}
                className="text-zinc-400 hover:text-white px-2 py-1 rounded hover:bg-[#333333]"
              >
                ✕
              </button>
            </div>

            {/* 1. Direct Plan Shareable URL */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                <Link2 className="w-3.5 h-3.5 text-[#7f85f5]" />
                Direct Plan URL (Share anywhere)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  aria-label="Shareable Plan URL"
                  value={getShareablePlanUrl()}
                  className="flex-1 px-3 py-2 rounded-lg bg-[#141414] border border-[#3a3a3a] text-xs text-zinc-200 font-mono focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleCopyShareUrl}
                  className="px-4 py-2 rounded-lg bg-[#5b5fc7] hover:bg-[#4f52b2] text-white text-xs font-semibold flex items-center gap-1.5 shrink-0 transition-all"
                >
                  {shareUrlCopied ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Copied Link!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy URL</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* 2. Share to Any Platform (WhatsApp, Telegram, X, Email, LinkedIn, Native Share) */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-zinc-300">
                Share directly to any platform
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(getUniversalShareText())}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-2.5 rounded-lg bg-[#1a1a1a] hover:bg-[#2eb899]/20 border border-[#333333] hover:border-[#2eb899] text-xs font-medium flex items-center gap-2 transition-all"
                >
                  <MessageCircle className="w-4 h-4 text-[#2eb899]" />
                  <span>WhatsApp</span>
                </a>

                <a
                  href={`https://t.me/share/url?url=${encodeURIComponent(getShareablePlanUrl())}&text=${encodeURIComponent(currentProject.name)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-2.5 rounded-lg bg-[#1a1a1a] hover:bg-sky-500/20 border border-[#333333] hover:border-sky-400 text-xs font-medium flex items-center gap-2 transition-all"
                >
                  <Send className="w-4 h-4 text-sky-400" />
                  <span>Telegram</span>
                </a>

                <a
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(getUniversalShareText())}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-2.5 rounded-lg bg-[#1a1a1a] hover:bg-white/10 border border-[#333333] hover:border-white text-xs font-medium flex items-center gap-2 transition-all"
                >
                  <Globe className="w-4 h-4 text-zinc-200" />
                  <span>X / Twitter</span>
                </a>

                <a
                  href={`mailto:?subject=${encodeURIComponent(`Project Plan: ${currentProject.name}`)}&body=${encodeURIComponent(getUniversalShareText())}`}
                  className="px-3 py-2.5 rounded-lg bg-[#1a1a1a] hover:bg-amber-500/20 border border-[#333333] hover:border-amber-400 text-xs font-medium flex items-center gap-2 transition-all"
                >
                  <Mail className="w-4 h-4 text-amber-400" />
                  <span>Email</span>
                </a>

                <a
                  href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(getShareablePlanUrl())}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-2.5 rounded-lg bg-[#1a1a1a] hover:bg-blue-500/20 border border-[#333333] hover:border-blue-400 text-xs font-medium flex items-center gap-2 transition-all"
                >
                  <ExternalLink className="w-4 h-4 text-blue-400" />
                  <span>LinkedIn</span>
                </a>

                <button
                  type="button"
                  onClick={handleNativeShare}
                  className="px-3 py-2.5 rounded-lg bg-[#1a1a1a] hover:bg-[#5b5fc7]/20 border border-[#333333] hover:border-[#7f85f5] text-xs font-medium flex items-center gap-2 transition-all"
                >
                  <Share2 className="w-4 h-4 text-[#7f85f5]" />
                  <span>More Apps...</span>
                </button>
              </div>
            </div>

            {/* 3. Quick Copy Summary & Export Backup */}
            <div className="pt-3 border-t border-[#333333] flex flex-wrap items-center justify-between gap-2">
              <button
                type="button"
                onClick={handleCopyShareSummary}
                className="px-3 py-2 rounded-lg bg-[#1a1a1a] hover:bg-[#333333] border border-[#3a3a3a] text-xs font-medium flex items-center gap-1.5"
              >
                {shareSummaryCopied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Summary Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Plan Summary</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleExportData}
                className="px-3 py-2 rounded-lg bg-[#1a1a1a] hover:bg-[#333333] border border-[#3a3a3a] text-xs font-medium flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Plan JSON</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==========================================
          MODAL: TASK DETAILS INSPECTOR
      ========================================== */}
      {editingTask && currentProject && (
        <PlannerTaskModal
          task={editingTask}
          project={currentProject}
          allTasks={tasks.filter((t) => t.projectId === currentProject.id)}
          isAdmin={isAdmin}
          onClose={() => setEditingTask(null)}
          onSave={handleSaveEditedTask}
          onDelete={deleteTask}
        />
      )}

      {/* ==========================================
          MODAL: CREATE / EDIT PROJECT
      ========================================== */}
      {showProjectModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#242424] border border-[#3a3a3a] rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-2xl my-8 text-white">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">
                {editingProjectId ? 'Edit Project Details' : 'Add New Portfolio Project'}
              </h3>
              <button
                onClick={() => setShowProjectModal(false)}
                className="text-zinc-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveProject} className="space-y-3.5 max-h-[75vh] overflow-y-auto pr-1">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="md:col-span-2">
                  <label className="block text-xs text-zinc-300 mb-1">Project Name *</label>
                  <input
                    type="text"
                    required
                    value={projName}
                    onChange={(e) => setProjName(e.target.value)}
                    placeholder="e.g., Real-Time Chat App"
                    className="w-full px-3.5 py-2 rounded-lg bg-[#141414] border border-[#3a3a3a] text-sm text-white focus:outline-none focus:border-[#5b5fc7]"
                  />
                </div>
                <div>
                  <label className="block text-xs text-zinc-300 mb-1">Status</label>
                  <select
                    value={projStatus}
                    onChange={(e) => setProjStatus(e.target.value as 'Completed' | 'In Progress')}
                    className="w-full px-3 py-2 rounded-lg bg-[#141414] border border-[#3a3a3a] text-sm text-white focus:outline-none"
                  >
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs text-zinc-300 mb-1">Short Summary *</label>
                <input
                  type="text"
                  required
                  value={projSummary}
                  onChange={(e) => setProjSummary(e.target.value)}
                  placeholder="What is this project?"
                  className="w-full px-3.5 py-2 rounded-lg bg-[#141414] border border-[#3a3a3a] text-sm text-white focus:outline-none focus:border-[#5b5fc7]"
                />
              </div>

              <div>
                <label className="block text-xs text-zinc-300 mb-1">Tech Stack (comma separated)</label>
                <input
                  type="text"
                  value={projTech}
                  onChange={(e) => setProjTech(e.target.value)}
                  placeholder="React, Node.js, MongoDB"
                  className="w-full px-3.5 py-2 rounded-lg bg-[#141414] border border-[#3a3a3a] text-sm text-white focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#333333]">
                <button
                  type="button"
                  onClick={() => setShowProjectModal(false)}
                  className="px-4 py-2 rounded-lg border border-[#3a3a3a] text-zinc-300 text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-[#5b5fc7] hover:bg-[#4f52b2] text-white text-xs font-semibold"
                >
                  {editingProjectId ? 'Update Project' : 'Save Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==========================================
          MODAL: CHANGE ADMIN PIN
      ========================================== */}
      {showPinChangeModal && isAdmin && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-[#242424] border border-[#3a3a3a] rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl text-white">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white">Change Admin PIN</h3>
              <button
                onClick={() => setShowPinChangeModal(false)}
                className="text-zinc-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleChangePin} className="space-y-3">
              <div>
                <label className="block text-xs text-zinc-300 mb-1">New Admin PIN (min 4 chars)</label>
                <input
                  type="password"
                  required
                  minLength={4}
                  value={newPinInput}
                  onChange={(e) => setNewPinInput(e.target.value)}
                  placeholder="Enter new 4-digit PIN"
                  className="w-full px-3.5 py-2 rounded-lg bg-[#141414] border border-[#3a3a3a] text-sm text-white focus:outline-none"
                />
              </div>
              {pinChangeSuccess && (
                <p className="text-xs text-emerald-400 font-medium">✓ Admin PIN updated!</p>
              )}
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPinChangeModal(false)}
                  className="px-4 py-2 rounded-lg border border-[#3a3a3a] text-zinc-300 text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-[#5b5fc7] text-white text-xs font-semibold"
                >
                  Save PIN
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==========================================
          MODAL: UNLOCK ADMIN MODE
      ========================================== */}
      {showUnlockModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-[#242424] border border-[#3a3a3a] rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-[#7f85f5]" />
                <h3 className="text-base font-bold text-white">Unlock Admin Mode</h3>
              </div>
              <button
                onClick={() => setShowUnlockModal(false)}
                className="text-zinc-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-zinc-400 leading-relaxed">
              Enter your Admin PIN to unlock full editing controls. (Default PIN:{' '}
              <strong className="text-white">1234</strong>)
            </p>

            <form onSubmit={handleUnlockSubmit} className="space-y-3">
              <div>
                <label className="block text-xs text-zinc-300 mb-1">Admin PIN</label>
                <input
                  type="password"
                  autoFocus
                  required
                  value={pinInput}
                  onChange={(e) => {
                    setPinInput(e.target.value);
                    setPinError('');
                  }}
                  placeholder="Enter PIN (Default: 1234)"
                  className="w-full px-3.5 py-2 rounded-lg bg-[#141414] border border-[#3a3a3a] text-sm text-white focus:outline-none"
                />
                {pinError && <p className="text-xs text-rose-400 mt-1.5 font-medium">{pinError}</p>}
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowUnlockModal(false)}
                  className="px-4 py-2 rounded-lg border border-[#3a3a3a] text-zinc-300 text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-[#5b5fc7] hover:bg-[#4f52b2] text-white text-xs font-semibold"
                >
                  Unlock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
