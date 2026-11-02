const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const Project = require('./models/Project');
const Task = require('./models/Task');

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/nexusforge';

// Middleware
app.use(cors());
app.use(express.json());

const DEFAULT_BUCKETS = [
  { id: 'bucket-backlog', name: 'Backlog & Ideas', color: '#64748b' },
  { id: 'bucket-sprint', name: 'Current Sprint', color: '#3b82f6' },
  { id: 'bucket-qa', name: 'Review & QA', color: '#f59e0b' },
  { id: 'bucket-shipped', name: 'Shipped & Live', color: '#10b981' }
];

const DEFAULT_MEMBERS = [
  { id: 'mem-1', name: 'Vidura (Lead)', role: 'Lead Architect', initials: 'VL', color: '#6366f1' },
  { id: 'mem-2', name: 'Alex Chen', role: 'Frontend Dev', initials: 'AC', color: '#0ea5e9' },
  { id: 'mem-3', name: 'Sarah Miller', role: 'Backend & DevOps', initials: 'SM', color: '#10b981' },
  { id: 'mem-4', name: 'Elena Rostova', role: 'QA & Product', initials: 'ER', color: '#f43f5e' }
];

// Initial Seed Data
const INITIAL_PROJECTS = [
  {
    id: 'proj-nexusforge',
    name: 'NexusForge — Full-Stack Project & LinkedIn Studio',
    summary: 'A Microsoft Planner-inspired project management workspace and AI execution hub for tracking development sprints, subtasks, schedules, and generating LinkedIn showcase posts.',
    problemSolved: 'Eliminates fragmented project tracking by combining Microsoft Planner buckets, dynamic Group-By boards, Gantt schedules, AI task breakdown, and 1-click LinkedIn/Standup reporting.',
    keyResult: 'Full Microsoft Planner workspace + AI subtask copilot & automated 1-click LinkedIn/Standup studio',
    status: 'Completed',
    techStack: ['React', 'TypeScript', 'Tailwind CSS', 'Node.js', 'Express', 'MongoDB'],
    howItWorks: {
      frontend: 'React + TypeScript Microsoft Fluent Dark/Light UI with Board, Grid, Schedule, Charts & My Day views',
      backend: 'Express.js REST API with connection resilience guards and PIN authentication',
      database: 'MongoDB with Mongoose schemas for Buckets, Checklists, Labels, and localStorage fallback'
    },
    githubUrl: 'https://github.com/yourusername/nexusforge',
    liveUrl: 'https://nexusforge.example.com',
    role: 'Lead Full-Stack Engineer & Creator',
    buckets: DEFAULT_BUCKETS,
    members: DEFAULT_MEMBERS
  },
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
    role: 'Full-Stack Developer',
    buckets: DEFAULT_BUCKETS,
    members: DEFAULT_MEMBERS
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
    role: 'Creator & Lead Developer',
    buckets: DEFAULT_BUCKETS,
    members: DEFAULT_MEMBERS
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
    role: 'Frontend & Mobile Developer',
    buckets: DEFAULT_BUCKETS,
    members: DEFAULT_MEMBERS
  }
];

const INITIAL_TASKS = [
  {
    id: 'task-nf-1',
    projectId: 'proj-nexusforge',
    title: 'Built full-stack project & task tracker with React, Node.js, Express, and MongoDB',
    result: 'Seamless CRUD operations with automatic MongoDB synchronization and offline resilience',
    status: 'Done',
    priority: 'Urgent',
    category: 'Feature',
    bucketId: 'bucket-shipped',
    startDate: '2025-02-01',
    dueDate: '2025-02-10',
    labels: ['Blue', 'Green'],
    assignees: ['mem-1', 'mem-3'],
    isMyDay: true,
    estimatedHours: 8,
    loggedMinutes: 450,
    showChecklistOnCard: true,
    checklist: [
      { id: 'chk-1', title: 'Design Mongoose schemas for Projects, Buckets & Tasks', completed: true },
      { id: 'chk-2', title: 'Build Express REST API with connection health middleware', completed: true },
      { id: 'chk-3', title: 'Implement React optimistic state sync + localStorage fallback', completed: true }
    ],
    notes: 'Core architecture enabling instant response whether MongoDB daemon is online or offline.',
    comments: [
      { id: 'c-1', author: 'Vidura (Lead)', text: 'Verified 0ms fallback when local Mongo service is stopped.', createdAt: '2025-02-09T10:30:00Z' }
    ]
  },
  {
    id: 'task-nf-2',
    projectId: 'proj-nexusforge',
    title: 'Created 1-click LinkedIn Feed Post and Profile Project section generator',
    result: 'Transforms technical achievements into formatted launch posts with pain points and tech hashtags',
    status: 'Done',
    priority: 'Important',
    category: 'Feature',
    bucketId: 'bucket-shipped',
    startDate: '2025-02-11',
    dueDate: '2025-02-15',
    labels: ['Purple', 'Teal'],
    assignees: ['mem-1', 'mem-2'],
    isMyDay: false,
    estimatedHours: 5,
    loggedMinutes: 280,
    showChecklistOnCard: true,
    checklist: [
      { id: 'chk-4', title: 'Build LinkedIn Feed launch post template engine', completed: true },
      { id: 'chk-5', title: 'Add Resume & LinkedIn Profile Project bullet formatter', completed: true },
      { id: 'chk-6', title: 'Add Daily Standup & Sprint Release Notes generator', completed: true }
    ],
    notes: 'Includes 3 output modes: LinkedIn Feed Post, Profile Project Section, and Engineering Standup Summary.'
  },
  {
    id: 'task-nf-3',
    projectId: 'proj-nexusforge',
    title: 'Implemented Monochrome Admin Dashboard with PIN protection and Public Read-Only mode',
    result: 'Safeguards portfolio modifications for public visitors while unlocking full dashboard via PIN 1234',
    status: 'Done',
    priority: 'Important',
    category: 'Security',
    bucketId: 'bucket-qa',
    startDate: '2025-02-14',
    dueDate: '2025-02-18',
    labels: ['Red', 'Yellow'],
    assignees: ['mem-1', 'mem-4'],
    isMyDay: true,
    estimatedHours: 4,
    loggedMinutes: 240,
    showChecklistOnCard: true,
    checklist: [
      { id: 'chk-7', title: 'Add /api/admin/verify endpoint with PIN validation', completed: true },
      { id: 'chk-8', title: 'Lock destructive actions in Public Read-Only visitor mode', completed: true }
    ]
  },
  {
    id: 'task-nf-4',
    projectId: 'proj-nexusforge',
    title: 'Added automated testing suite and GitHub Actions CI pipeline for zero-bug deployments',
    result: '40+ automated tests passing with automated PR validation and production build verification',
    status: 'Done',
    priority: 'High',
    category: 'Backend',
    bucketId: 'bucket-shipped',
    startDate: '2025-02-18',
    dueDate: '2025-02-22',
    labels: ['Green', 'Blue'],
    assignees: ['mem-3', 'mem-4'],
    isMyDay: false,
    estimatedHours: 6,
    loggedMinutes: 360,
    showChecklistOnCard: true,
    checklist: [
      { id: 'chk-9', title: 'Write Vitest React Testing Library suite', completed: true },
      { id: 'chk-10', title: 'Write Backend API & Mongoose schema validator runner', completed: true },
      { id: 'chk-11', title: 'Configure .github/workflows/ci-tests.yml', completed: true }
    ]
  },
  {
    id: 'task-nf-5',
    projectId: 'proj-nexusforge',
    title: 'Microsoft Planner Dynamic Group-By Board, Schedule Calendar & AI Smart Subtask Copilot',
    result: 'Full Planner parity with Custom Buckets, Group By (Bucket/Progress/Priority/Due Date/Assignee), Charts, and 1-click AI Subtask breakdown',
    status: 'In Progress',
    priority: 'Urgent',
    category: 'Feature',
    bucketId: 'bucket-sprint',
    startDate: '2025-02-20',
    dueDate: '2025-03-05',
    labels: ['Purple', 'Pink', 'Blue'],
    assignees: ['mem-1', 'mem-2'],
    isMyDay: true,
    estimatedHours: 10,
    loggedMinutes: 420,
    showChecklistOnCard: true,
    checklist: [
      { id: 'chk-12', title: 'Implement custom Buckets & Group By pivot selector', completed: true },
      { id: 'chk-13', title: 'Build interactive Schedule Calendar & Analytics Charts tab', completed: true },
      { id: 'chk-14', title: 'Add AI Subtask Generator & Live Focus Pomodoro timer', completed: false }
    ]
  },
  {
    id: 'task-1',
    projectId: 'proj-1',
    title: 'Built instant WebSocket messaging with live typing indicators',
    result: 'Messages appear in under 20ms without refreshing the page',
    status: 'Done',
    priority: 'High',
    category: 'Backend',
    bucketId: 'bucket-shipped',
    startDate: '2025-01-10',
    dueDate: '2025-01-18',
    labels: ['Green', 'Blue'],
    assignees: ['mem-1', 'mem-3'],
    checklist: [
      { id: 'chk-101', title: 'Configure Socket.io room namespaces', completed: true },
      { id: 'chk-102', title: 'Emit debounced typing indicator events', completed: true }
    ]
  },
  {
    id: 'task-2',
    projectId: 'proj-1',
    title: 'Designed responsive dark & light mode chat interface',
    result: 'Works smoothly on both mobile phones and desktop screens',
    status: 'Done',
    priority: 'Medium',
    category: 'Frontend',
    bucketId: 'bucket-shipped',
    startDate: '2025-01-19',
    dueDate: '2025-01-24',
    labels: ['Purple'],
    assignees: ['mem-2'],
    checklist: [
      { id: 'chk-103', title: 'Build responsive sidebar & message drawer', completed: true }
    ]
  },
  {
    id: 'task-3',
    projectId: 'proj-1',
    title: 'Added secure JWT user login and private room invites',
    result: 'Protected private conversations with encrypted session tokens',
    status: 'Done',
    priority: 'High',
    category: 'Security',
    bucketId: 'bucket-qa',
    startDate: '2025-01-25',
    dueDate: '2025-01-30',
    labels: ['Red'],
    assignees: ['mem-1', 'mem-4'],
    checklist: []
  },
  {
    id: 'task-4',
    projectId: 'proj-2',
    title: 'Created distraction-free chapter editor with auto-save',
    result: 'Prevents writers from losing drafts if their browser closes',
    status: 'Done',
    priority: 'High',
    category: 'Frontend',
    bucketId: 'bucket-shipped',
    startDate: '2025-02-01',
    dueDate: '2025-02-08',
    labels: ['Blue', 'Teal'],
    assignees: ['mem-2'],
    checklist: []
  },
  {
    id: 'task-5',
    projectId: 'proj-2',
    title: 'Set up PostgreSQL database schema for stories, tags, and comments',
    result: 'Fast search and filtering by genre and reading time',
    status: 'In Progress',
    priority: 'High',
    category: 'Database',
    bucketId: 'bucket-sprint',
    startDate: '2025-02-10',
    dueDate: '2025-02-28',
    labels: ['Yellow'],
    assignees: ['mem-3'],
    checklist: [
      { id: 'chk-201', title: 'Create Prisma models for Story, Chapter, Tag', completed: true },
      { id: 'chk-202', title: 'Add full-text search indexes', completed: false }
    ]
  },
  {
    id: 'task-6',
    projectId: 'proj-2',
    title: 'Add one-click social sharing card for published stories',
    result: 'Helps authors share their work on LinkedIn and X',
    status: 'To Do',
    priority: 'Medium',
    category: 'Feature',
    bucketId: 'bucket-backlog',
    startDate: '2025-03-01',
    dueDate: '2025-03-10',
    labels: ['Pink'],
    assignees: ['mem-2', 'mem-4'],
    checklist: []
  },
  {
    id: 'task-7',
    projectId: 'proj-3',
    title: 'Integrated live delivery status stepper (Booked -> Out for Delivery -> Delivered)',
    result: 'Customers can see exact order progress in real time',
    status: 'Done',
    priority: 'High',
    category: 'Frontend',
    bucketId: 'bucket-shipped',
    startDate: '2025-01-05',
    dueDate: '2025-01-14',
    labels: ['Green'],
    assignees: ['mem-1', 'mem-2'],
    checklist: []
  },
  {
    id: 'task-8',
    projectId: 'proj-3',
    title: 'Connected Firebase authentication and order history',
    result: '1-click reorder for returning customers',
    status: 'Done',
    priority: 'Medium',
    category: 'Backend',
    bucketId: 'bucket-shipped',
    startDate: '2025-01-15',
    dueDate: '2025-01-22',
    labels: ['Blue'],
    assignees: ['mem-3'],
    checklist: []
  }
];

const ADMIN_PIN = process.env.ADMIN_PIN || '1234';

// Middleware to check MongoDB connection status
const checkMongoConnection = (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({ error: 'MongoDB is currently offline', offline: true });
  }
  next();
};

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    server: 'NexusForge API',
    mongoConnected: mongoose.connection.readyState === 1
  });
});

// Admin PIN verification endpoint
app.post('/api/admin/verify', (req, res) => {
  const { pin } = req.body;
  const adminPin = process.env.ADMIN_PIN || '1234';
  if (String(pin).trim() === String(adminPin).trim()) {
    return res.json({ success: true });
  }
  return res.json({ success: false });
});

app.post('/api/auth/verify-pin', (req, res) => {
  const { pin } = req.body;
  const adminPin = process.env.ADMIN_PIN || '1234';
  if (String(pin).trim() === String(adminPin).trim()) {
    return res.json({ success: true, message: 'PIN verified' });
  }
  return res.status(401).json({ success: false, error: 'Invalid PIN' });
});

// ==========================================
// PROJECTS API ENDPOINTS
// ==========================================

// GET /api/projects -> Returns all projects (auto-seeds if empty)
app.get('/api/projects', checkMongoConnection, async (req, res) => {
  try {
    let projects = await Project.find().sort({ createdAt: 1 });
    if (projects.length === 0) {
      console.log('Seeding initial projects to MongoDB...');
      projects = await Project.insertMany(INITIAL_PROJECTS);
    }
    res.json(projects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

// POST /api/projects -> Creates a new project
app.post('/api/projects', checkMongoConnection, async (req, res) => {
  try {
    const projectData = {
      ...req.body,
      id: req.body.id || `proj-${Date.now()}`
    };
    const project = new Project(projectData);
    const saved = await project.save();
    res.status(201).json(saved);
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(400).json({ error: 'Failed to create project', details: error.message });
  }
});

// PUT /api/projects/:id -> Updates an existing project by its id field
app.put('/api/projects/:id', checkMongoConnection, async (req, res) => {
  try {
    const updated = await Project.findOneAndUpdate(
      { id: req.params.id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!updated) {
      return res.status(404).json({ error: 'Project not found' });
    }
    res.json(updated);
  } catch (error) {
    console.error('Error updating project:', error);
    res.status(400).json({ error: 'Failed to update project', details: error.message });
  }
});

// DELETE /api/projects/:id -> Deletes a project by id and deletes all associated tasks
app.delete('/api/projects/:id', checkMongoConnection, async (req, res) => {
  try {
    const deleted = await Project.findOneAndDelete({ id: req.params.id });
    if (!deleted) {
      return res.status(404).json({ error: 'Project not found' });
    }
    // Delete all tasks under this project
    await Task.deleteMany({ projectId: req.params.id });
    res.json({ message: 'Project and associated tasks deleted successfully', id: req.params.id });
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({ error: 'Failed to delete project' });
  }
});

// ==========================================
// TASKS API ENDPOINTS
// ==========================================

// GET /api/tasks -> Returns all tasks (auto-seeds if empty)
app.get('/api/tasks', checkMongoConnection, async (req, res) => {
  try {
    const filter = req.query.projectId ? { projectId: req.query.projectId } : {};
    let tasks = await Task.find(filter).sort({ createdAt: -1 });

    if (tasks.length === 0 && !req.query.projectId) {
      const totalCount = await Task.countDocuments();
      if (totalCount === 0) {
        console.log('Seeding initial tasks to MongoDB...');
        tasks = await Task.insertMany(INITIAL_TASKS);
      }
    }
    res.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

// POST /api/tasks -> Creates a new task
app.post('/api/tasks', checkMongoConnection, async (req, res) => {
  try {
    const taskData = {
      ...req.body,
      id: req.body.id || `task-${Date.now()}`
    };
    const task = new Task(taskData);
    const saved = await task.save();
    res.status(201).json(saved);
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(400).json({ error: 'Failed to create task', details: error.message });
  }
});

// PUT /api/tasks/:id -> Updates a task by its id field
app.put('/api/tasks/:id', checkMongoConnection, async (req, res) => {
  try {
    const updated = await Task.findOneAndUpdate(
      { id: req.params.id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!updated) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.json(updated);
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(400).json({ error: 'Failed to update task', details: error.message });
  }
});

// DELETE /api/tasks/:id -> Deletes a task by its id field
app.delete('/api/tasks/:id', checkMongoConnection, async (req, res) => {
  try {
    const deleted = await Task.findOneAndDelete({ id: req.params.id });
    if (!deleted) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.json({ message: 'Task deleted successfully', id: req.params.id });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

// Connect to MongoDB and start server
mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log(`Connected to MongoDB at ${MONGO_URI}`);
    app.listen(PORT, () => {
      console.log(`NexusForge backend API running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err.message);
    // Start server even if MongoDB is offline so health/diagnostics are reachable
    app.listen(PORT, () => {
      console.log(`NexusForge backend API running on port ${PORT} (MongoDB offline)`);
    });
  });
