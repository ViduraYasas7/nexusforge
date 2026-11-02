export type TaskStatus = 'To Do' | 'In Progress' | 'Done';
export type TaskPriority = 'Urgent' | 'Important' | 'High' | 'Medium' | 'Low';
export type GroupByOption = 'Bucket' | 'Progress' | 'Priority' | 'Due Date' | 'Assigned To' | 'Labels';

export interface BucketItem {
  id: string;
  name: string;
  color: string;
}

export interface TeamMember {
  id: string;
  name: string;
  email?: string;
  role: string;
  initials: string;
  color: string;
}

export interface ChecklistItem {
  id: string;
  title: string;
  completed: boolean;
}

export interface TaskComment {
  id: string;
  author: string;
  text: string;
  createdAt: string;
}

export interface TaskAttachment {
  id: string;
  name: string;
  url: string;
}

export interface PortfolioProject {
  id: string;
  code?: string;
  name: string;
  summary: string;
  problemSolved: string;
  keyResult: string;
  status: 'Completed' | 'In Progress';
  techStack: string[];
  howItWorks: {
    frontend: string;
    backend: string;
    database: string;
  };
  githubUrl: string;
  liveUrl: string;
  role: string;
  buckets?: BucketItem[];
  members?: TeamMember[];
}

export interface ProjectTask {
  id: string;
  projectId: string;
  title: string;
  result: string;
  status: TaskStatus;
  priority: TaskPriority;
  category: 'Frontend' | 'Backend' | 'Database' | 'Security' | 'Feature';
  bucketId?: string;
  startDate?: string;
  finishDate?: string;
  dueDate?: string;
  checklist?: ChecklistItem[];
  showChecklistOnCard?: boolean;
  labels?: string[];
  assignees?: string[];
  notes?: string;
  showNotesOnCard?: boolean;
  comments?: TaskComment[];
  attachments?: TaskAttachment[];
  isMyDay?: boolean;
  estimatedHours?: number;
  loggedMinutes?: number;
  blockedBy?: string;
}

export interface PlannerLabelDef {
  key: string;
  name: string;
  pillBg: string;
  pillText: string;
  dotColor: string;
}

export const PLANNER_LABELS: PlannerLabelDef[] = [
  { key: 'Blue', name: 'Blue', pillBg: 'bg-[#bae6fd]', pillText: 'text-[#0369a1]', dotColor: '#38bdf8' },
  { key: 'Pink', name: 'Pink', pillBg: 'bg-[#fbcfe8]', pillText: 'text-[#be185d]', dotColor: '#f472b6' },
  { key: 'Green', name: 'Green', pillBg: 'bg-[#bbf7d0]', pillText: 'text-[#15803d]', dotColor: '#4ade80' },
  { key: 'Yellow', name: 'Yellow', pillBg: 'bg-[#fef08a]', pillText: 'text-[#a16207]', dotColor: '#facc15' },
  { key: 'Purple', name: 'Purple', pillBg: 'bg-[#e9d5ff]', pillText: 'text-[#6b21a8]', dotColor: '#c084fc' },
  { key: 'Red', name: 'Red', pillBg: 'bg-[#fecdd3]', pillText: 'text-[#be123c]', dotColor: '#fb7185' }
];

export const DEFAULT_BUCKETS: BucketItem[] = [
  { id: 'bucket-initiating', name: 'Initiating', color: '#6366f1' },
  { id: 'bucket-planning', name: 'Planning', color: '#3b82f6' },
  { id: 'bucket-executing', name: 'Executing', color: '#10b981' },
  { id: 'bucket-monitoring', name: 'Monitoring and controlling', color: '#f59e0b' },
  { id: 'bucket-closing', name: 'Closing', color: '#8b5cf6' }
];

export const DEFAULT_MEMBERS: TeamMember[] = [
  { id: 'mem-1', name: 'YASASSRI W H V it22054890', email: 'yasassri@planner.local', role: 'Lead Architect', initials: 'YW', color: '#0284c7' },
  { id: 'mem-2', name: 'KODIKARA K A S S it22226464', email: 'kodikara@planner.local', role: 'Full-Stack Engineer', initials: 'KK', color: '#dc2626' },
  { id: 'mem-3', name: 'GUNARATHNA W.A.K.N it2214252', email: 'gunarathna@planner.local', role: 'AI & Backend Dev', initials: 'GW', color: '#65a30d' },
  { id: 'mem-4', name: 'BUDDHIKA C A S it22087256', email: 'buddhika@planner.local', role: 'QA & Systems', initials: 'BC', color: '#4f46e5' },
  { id: 'mem-5', name: 'Dharshana Kasthurirathna', email: 'dharshana@planner.local', role: 'Supervisor', initials: 'DK', color: '#0d9488' },
  { id: 'mem-6', name: 'Kaushalya Dissanayake', email: 'kaushalya@planner.local', role: 'Co-Supervisor', initials: 'KD', color: '#9333ea' }
];

export const INITIAL_PROJECTS: PortfolioProject[] = [
  {
    id: 'proj-nexusforge',
    code: 'NF',
    name: 'NexusForge — Full-Stack Project & LinkedIn Studio',
    summary: 'A clean Microsoft Planner project workspace and LinkedIn studio for managing tasks across Initiating, Planning, Executing, Monitoring, and Closing.',
    problemSolved: 'Eliminates complex project management headaches by giving teams a smooth, beginner-friendly Microsoft Planner Grid, Board, Calendar, and Charts workspace.',
    keyResult: 'Automated 1-click LinkedIn post & resume bullet generation with full offline resilience',
    status: 'Completed',
    techStack: ['React', 'TypeScript', 'Tailwind CSS', 'Node.js', 'Express', 'MongoDB'],
    howItWorks: {
      frontend: 'React + TypeScript Microsoft Planner UI with Grid, Board, Calendar & Charts',
      backend: 'Express.js REST API with connection resilience guards and PIN authentication',
      database: 'MongoDB with Mongoose schemas and automatic localStorage fallback'
    },
    githubUrl: 'https://github.com/yourusername/nexusforge',
    liveUrl: 'https://nexusforge.example.com',
    role: 'Lead Full-Stack Engineer & Creator',
    buckets: DEFAULT_BUCKETS,
    members: DEFAULT_MEMBERS
  },
  {
    id: 'proj-1',
    code: 'RC',
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
    code: 'SH',
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
    code: 'GM',
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

export const INITIAL_TASKS: ProjectTask[] = [
  {
    id: 'task-nf-1',
    projectId: 'proj-nexusforge',
    title: 'Built full-stack project & task tracker with React, Node.js, Express, and MongoDB',
    result: 'Seamless CRUD operations with automatic MongoDB synchronization and offline resilience',
    status: 'Done',
    priority: 'Important',
    category: 'Feature',
    bucketId: 'bucket-initiating',
    startDate: '2026-03-01',
    finishDate: '2026-03-15',
    dueDate: '2026-03-26',
    labels: ['Blue'],
    assignees: ['mem-1', 'mem-2'],
    isMyDay: true,
    showChecklistOnCard: true,
    checklist: [
      { id: 'chk-1', title: 'Confirm project scope and submission requirements', completed: true },
      { id: 'chk-2', title: 'Define four-component system architecture', completed: true },
      { id: 'chk-3', title: 'Identify goals and objectives', completed: true },
      { id: 'chk-4', title: 'Prepare dataset inventory', completed: true }
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
    bucketId: 'bucket-planning',
    startDate: '2026-03-16',
    finishDate: '2026-03-28',
    dueDate: '2026-03-31',
    labels: ['Green'],
    assignees: ['mem-1', 'mem-2', 'mem-3', 'mem-4'],
    isMyDay: false,
    showChecklistOnCard: true,
    checklist: [
      { id: 'chk-5', title: 'Document Scope Management Plan', completed: true },
      { id: 'chk-6', title: 'Define API requests and responses', completed: true },
      { id: 'chk-7', title: 'Prepare model evaluation plan', completed: true },
      { id: 'chk-8', title: 'Map checklist evidence and component owners', completed: true }
    ]
  },
  {
    id: 'task-nf-3',
    projectId: 'proj-nexusforge',
    title: 'Implemented Monochrome Admin Dashboard with PIN protection and Public Read-Only mode',
    result: 'Safeguards portfolio modifications for public visitors while unlocking full dashboard via PIN 1234',
    status: 'Done',
    priority: 'Urgent',
    category: 'Security',
    bucketId: 'bucket-executing',
    startDate: '2026-04-01',
    finishDate: '2026-04-20',
    dueDate: '2026-04-30',
    labels: ['Pink'],
    assignees: ['mem-4'],
    isMyDay: true,
    showChecklistOnCard: true,
    checklist: [
      { id: 'chk-9', title: 'Implement PIN verification endpoint', completed: true },
      { id: 'chk-10', title: 'Lock destructive actions in Public Read-Only mode', completed: true },
      { id: 'chk-11', title: 'Integrate all component routers into API', completed: true },
      { id: 'chk-12', title: 'Verify session creation and reuse', completed: true }
    ]
  },
  {
    id: 'task-nf-4',
    projectId: 'proj-nexusforge',
    title: 'Added automated testing suite and GitHub Actions CI pipeline for zero-bug deployments',
    result: '40 automated tests passing with automated PR validation and production build verification',
    status: 'Done',
    priority: 'Medium',
    category: 'Backend',
    bucketId: 'bucket-closing',
    startDate: '2026-05-01',
    finishDate: '2026-05-20',
    dueDate: '2026-05-30',
    labels: ['Green'],
    assignees: ['mem-1', 'mem-2', 'mem-4'],
    isMyDay: false,
    showChecklistOnCard: true,
    checklist: [
      { id: 'chk-13', title: 'Assemble evidence for all four components', completed: true },
      { id: 'chk-14', title: 'Prepare the integrated project demonstration', completed: true },
      { id: 'chk-15', title: 'Summarize project results and lessons learned', completed: true }
    ]
  },
  {
    id: 'task-nf-5',
    projectId: 'proj-nexusforge',
    title: 'Implement intent classification & smart AI subtask breakdown',
    result: '1-click AI subtask generation and real-time sprint progress tracking',
    status: 'To Do',
    priority: 'Medium',
    category: 'Feature',
    bucketId: 'bucket-executing',
    startDate: '2026-06-01',
    finishDate: '',
    dueDate: '2026-07-15',
    labels: ['Pink'],
    assignees: ['mem-4'],
    isMyDay: true,
    showChecklistOnCard: true,
    checklist: [
      { id: 'chk-16', title: 'Prepare intent model weights', completed: true },
      { id: 'chk-17', title: 'Connect FastAPI / Express route', completed: true },
      { id: 'chk-18', title: 'Validate accuracy metrics', completed: true },
      { id: 'chk-19', title: 'Deploy endpoint', completed: true }
    ]
  },
  {
    id: 'task-nf-6',
    projectId: 'proj-nexusforge',
    title: 'Report monthly status & conduct team performance reviews',
    result: 'Consistent sprint velocity and milestone tracking across all team members',
    status: 'To Do',
    priority: 'Medium',
    category: 'Feature',
    bucketId: 'bucket-monitoring',
    startDate: '2026-06-03',
    finishDate: '',
    dueDate: '2025-08-08',
    labels: ['Yellow'],
    assignees: ['mem-2', 'mem-3'],
    isMyDay: false,
    showChecklistOnCard: true,
    checklist: [
      { id: 'chk-20', title: 'Collect monthly KPI metrics', completed: false },
      { id: 'chk-21', title: 'Review bucket completion rates', completed: false }
    ]
  },
  {
    id: 'task-1',
    projectId: 'proj-1',
    title: 'Built instant WebSocket messaging with live typing indicators',
    result: 'Messages appear in under 20ms without refreshing the page',
    status: 'Done',
    priority: 'Urgent',
    category: 'Backend',
    bucketId: 'bucket-executing',
    startDate: '2026-03-01',
    dueDate: '2026-03-20',
    labels: ['Blue'],
    assignees: ['mem-1', 'mem-2'],
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
    bucketId: 'bucket-planning',
    startDate: '2026-03-10',
    dueDate: '2026-03-25',
    labels: ['Pink'],
    assignees: ['mem-2'],
    checklist: []
  },
  {
    id: 'task-3',
    projectId: 'proj-1',
    title: 'Added secure JWT user login and private room invites',
    result: 'Protected private conversations with encrypted session tokens',
    status: 'Done',
    priority: 'Important',
    category: 'Security',
    bucketId: 'bucket-closing',
    startDate: '2026-03-15',
    dueDate: '2026-03-30',
    labels: ['Green'],
    assignees: ['mem-1', 'mem-4'],
    checklist: []
  },
  {
    id: 'task-4',
    projectId: 'proj-2',
    title: 'Created distraction-free chapter editor with auto-save',
    result: 'Prevents writers from losing drafts if their browser closes',
    status: 'Done',
    priority: 'Important',
    category: 'Frontend',
    bucketId: 'bucket-executing',
    startDate: '2026-02-01',
    dueDate: '2026-02-15',
    labels: ['Blue'],
    assignees: ['mem-2'],
    checklist: []
  },
  {
    id: 'task-5',
    projectId: 'proj-2',
    title: 'Set up PostgreSQL database schema for stories, tags, and comments',
    result: 'Fast search and filtering by genre and reading time',
    status: 'In Progress',
    priority: 'Important',
    category: 'Database',
    bucketId: 'bucket-planning',
    startDate: '2026-02-10',
    dueDate: '2026-02-28',
    labels: ['Yellow'],
    assignees: ['mem-3'],
    checklist: []
  },
  {
    id: 'task-6',
    projectId: 'proj-2',
    title: 'Add one-click social sharing card for published stories',
    result: 'Helps authors share their work on LinkedIn and X',
    status: 'To Do',
    priority: 'Medium',
    category: 'Feature',
    bucketId: 'bucket-initiating',
    startDate: '2026-03-01',
    dueDate: '2026-03-10',
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
    priority: 'Important',
    category: 'Frontend',
    bucketId: 'bucket-executing',
    startDate: '2026-01-05',
    dueDate: '2026-01-14',
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
    bucketId: 'bucket-closing',
    startDate: '2026-01-15',
    dueDate: '2026-01-22',
    labels: ['Blue'],
    assignees: ['mem-3'],
    checklist: []
  }
];

export function generateSmartSubtasks(task: ProjectTask): ChecklistItem[] {
  const baseId = `ai-chk-${Date.now()}`;
  return [
    { id: `${baseId}-1`, title: 'Confirm requirements and scope', completed: task.status === 'Done' },
    { id: `${baseId}-2`, title: 'Implement core component and endpoints', completed: task.status === 'Done' },
    { id: `${baseId}-3`, title: 'Verify checklist evidence and tests', completed: false }
  ];
}

export function evaluateTaskRisk(task: ProjectTask, allTasks: ProjectTask[]): {
  level: 'Critical' | 'Warning' | 'Healthy';
  reason: string;
} {
  if (task.status === 'Done') {
    return { level: 'Healthy', reason: 'Completed' };
  }
  if (task.blockedBy) {
    const blocker = allTasks.find((t) => t.id === task.blockedBy);
    if (blocker && blocker.status !== 'Done') {
      return { level: 'Critical', reason: `Blocked by ${blocker.title}` };
    }
  }
  const today = new Date().toISOString().slice(0, 10);
  if (task.dueDate && task.dueDate < today) {
    return { level: 'Critical', reason: `Overdue (${task.dueDate})` };
  }
  return { level: 'Healthy', reason: 'On track' };
}
