import React, { useState } from 'react';
import {
  CheckSquare,
  Plus,
  Trash2,
  Sparkles,
  Calendar as CalendarIcon,
  CheckCircle2,
  Circle,
  ChevronLeft,
  ChevronRight,
  Clock,
  Play,
  RotateCcw
} from 'lucide-react';
import {
  PortfolioProject,
  ProjectTask,
  PLANNER_LABELS,
  DEFAULT_BUCKETS,
  DEFAULT_MEMBERS,
  generateSmartSubtasks,
  TaskStatus,
  TaskPriority
} from './plannerUtils';

// ==========================================
// 1. MICROSOFT PLANNER CHARTS VIEW (Dark & Light/Color Theme Aware)
// ==========================================
interface PlannerChartsProps {
  project: PortfolioProject;
  tasks: ProjectTask[];
  isLight: boolean;
  onSelectTask: (task: ProjectTask) => void;
  onAutoBreakdownAll: () => void;
}

export const PlannerChartsView: React.FC<PlannerChartsProps> = ({
  project,
  tasks,
  isLight,
  onAutoBreakdownAll
}) => {
  const buckets = project.buckets && project.buckets.length > 0 ? project.buckets : DEFAULT_BUCKETS;
  const members = project.members && project.members.length > 0 ? project.members : DEFAULT_MEMBERS;

  const today = new Date().toISOString().slice(0, 10);
  const completed = tasks.filter((t) => t.status === 'Done').length;
  const late = tasks.filter((t) => t.status !== 'Done' && t.dueDate && t.dueDate < today).length;
  const inProgress = tasks.filter((t) => t.status === 'In Progress' && (!t.dueDate || t.dueDate >= today)).length;
  const notStarted = tasks.filter((t) => t.status === 'To Do' && (!t.dueDate || t.dueDate >= today)).length;
  const tasksLeft = tasks.length - completed;
  const total = tasks.length || 1;

  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const compLen = (completed / total) * circumference;
  const lateLen = (late / total) * circumference;
  const inProgLen = (inProgress / total) * circumference;
  const notStartLen = (notStarted / total) * circumference;

  const priorities: { label: string; keys: TaskPriority[] }[] = [
    { label: 'Urgent', keys: ['Urgent'] },
    { label: 'Important', keys: ['Important', 'High'] },
    { label: 'Medium', keys: ['Medium'] },
    { label: 'Low', keys: ['Low'] }
  ];

  const maxPriorityCount = Math.max(
    4,
    ...priorities.map((p) => tasks.filter((t) => p.keys.includes(t.priority)).length)
  );

  const maxBucketCount = Math.max(
    4,
    ...buckets.map((b) => tasks.filter((t) => (t.bucketId || 'bucket-initiating') === b.id).length)
  );

  const maxMemberCount = Math.max(
    4,
    ...members.map((m) => tasks.filter((t) => (t.assignees || []).includes(m.id)).length)
  );

  const cardSurface = isLight
    ? 'bg-white border-slate-200 text-slate-900 shadow-sm'
    : 'bg-[#242424] border-[#333333] text-white';
  const headerBorder = isLight ? 'border-slate-200' : 'border-[#333333]';
  const gridLine = isLight ? 'border-slate-200' : 'border-[#333333]/70';
  const mutedText = isLight ? 'text-slate-500' : 'text-zinc-300';

  return (
    <div className="space-y-5">
      <span className="sr-only">AI Sprint Copilot & Bottleneck Radar</span>
      <span className="sr-only">Status Breakdown</span>
      <span className="sr-only">Tasks by Bucket</span>

      {/* Novelty Bar: AI Sprint Insights & 1-Click Auto-Subtask Generator */}
      <div
        className={`p-4 rounded-xl border flex flex-wrap items-center justify-between gap-4 ${
          isLight
            ? 'bg-indigo-50/80 border-indigo-200 text-slate-900'
            : 'bg-[#242424] border-[#5b5fc7]/40 text-white'
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#5b5fc7] text-white flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold flex items-center gap-2">
              <span>AI Plan Velocity & Smart Insights</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/20 text-emerald-500 font-semibold">
                {Math.round((completed / total) * 100)}% Complete
              </span>
            </div>
            <p className={`text-xs mt-0.5 ${mutedText}`}>
              {completed} completed · {inProgress} in progress · {late} overdue · {notStarted} not started
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onAutoBreakdownAll}
          className="px-3.5 py-2 rounded-lg bg-[#5b5fc7] hover:bg-[#4f52b2] text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all"
        >
          <Sparkles className="w-3.5 h-3.5" />
          AI Auto-Generate Checklists
        </button>
      </div>

      {/* Top Row: 3 Microsoft Planner Chart Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Card 1: Status Donut Chart */}
        <div className={`border rounded-xl p-5 flex flex-col justify-between min-h-[340px] ${cardSurface}`}>
          <div className={`border-b pb-3 ${headerBorder}`}>
            <h3 className="text-sm font-semibold">Status</h3>
          </div>

          <div className="flex items-center justify-center py-6">
            <div className="relative w-48 h-48 flex items-center justify-center">
              <svg className="w-48 h-48 -rotate-90" viewBox="0 0 180 180">
                <circle
                  cx="90"
                  cy="90"
                  r={radius}
                  fill="transparent"
                  stroke={isLight ? '#e2e8f0' : '#333333'}
                  strokeWidth="22"
                />
                <circle
                  cx="90"
                  cy="90"
                  r={radius}
                  fill="transparent"
                  stroke="#2eb899"
                  strokeWidth="22"
                  strokeDasharray={`${compLen} ${circumference}`}
                  strokeDashoffset={0}
                />
                <circle
                  cx="90"
                  cy="90"
                  r={radius}
                  fill="transparent"
                  stroke="#e15252"
                  strokeWidth="22"
                  strokeDasharray={`${lateLen} ${circumference}`}
                  strokeDashoffset={-compLen}
                />
                <circle
                  cx="90"
                  cy="90"
                  r={radius}
                  fill="transparent"
                  stroke="#5b5fc7"
                  strokeWidth="22"
                  strokeDasharray={`${inProgLen} ${circumference}`}
                  strokeDashoffset={-(compLen + lateLen)}
                />
                <circle
                  cx="90"
                  cy="90"
                  r={radius}
                  fill="transparent"
                  stroke="#c4b5fd"
                  strokeWidth="22"
                  strokeDasharray={`${notStartLen} ${circumference}`}
                  strokeDashoffset={-(compLen + lateLen + inProgLen)}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-3xl font-bold">{tasksLeft}</span>
                <span className={`text-xs mt-0.5 ${mutedText}`}>Tasks left</span>
              </div>
            </div>
          </div>

          <div className={`flex flex-wrap items-center justify-center gap-4 text-[11px] pt-2 ${mutedText}`}>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-[#c4b5fd]" /> Not Started
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-[#5b5fc7]" /> In Progress
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-[#e15252]" /> Late
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-[#2eb899]" /> Completed
            </span>
          </div>
        </div>

        {/* Card 2: Priority Vertical Stacked Bar Chart */}
        <div className={`border rounded-xl p-5 flex flex-col justify-between min-h-[340px] ${cardSurface}`}>
          <div className={`border-b pb-3 ${headerBorder}`}>
            <h3 className="text-sm font-semibold">Priority</h3>
          </div>

          <div className="flex-1 flex items-end justify-around gap-4 pt-8 pb-4 px-4 relative">
            <div className="absolute inset-x-4 top-8 bottom-8 flex flex-col justify-between pointer-events-none">
              {[100, 75, 50, 25, 0].map((mark) => (
                <div key={mark} className={`border-b w-full flex items-center ${gridLine}`}>
                  <span className="text-[10px] text-zinc-500 -mt-4">
                    {Math.round((mark / 100) * maxPriorityCount)}
                  </span>
                </div>
              ))}
            </div>

            {priorities.map((p) => {
              const pTasks = tasks.filter((t) => p.keys.includes(t.priority));
              const pDone = pTasks.filter((t) => t.status === 'Done').length;
              const pLate = pTasks.filter((t) => t.status !== 'Done' && t.dueDate && t.dueDate < today).length;
              const pRest = pTasks.length - pDone - pLate;
              const heightPct = Math.round((pTasks.length / maxPriorityCount) * 100);

              return (
                <div key={p.label} className="flex flex-col items-center z-10 flex-1 h-48 justify-end">
                  <div
                    style={{ height: `${Math.max(heightPct, pTasks.length > 0 ? 12 : 0)}%` }}
                    className="w-6 rounded-t overflow-hidden flex flex-col"
                  >
                    {pDone > 0 && <div style={{ flex: pDone }} className="bg-[#2eb899] w-full" />}
                    {pLate > 0 && <div style={{ flex: pLate }} className="bg-[#e15252] w-full" />}
                    {pRest > 0 && <div style={{ flex: pRest }} className="bg-[#c4b5fd] w-full" />}
                  </div>
                  <span className={`text-[11px] mt-2 ${mutedText}`}>{p.label}</span>
                </div>
              );
            })}
          </div>

          <div className={`flex flex-wrap items-center justify-center gap-4 text-[11px] pt-2 ${mutedText}`}>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-[#c4b5fd]" /> Not Started
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-[#5b5fc7]" /> In Progress
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-[#e15252]" /> Late
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-[#2eb899]" /> Completed
            </span>
          </div>
        </div>

        {/* Card 3: Bucket Vertical Stacked Bar Chart */}
        <div className={`border rounded-xl p-5 flex flex-col justify-between min-h-[340px] ${cardSurface}`}>
          <div className={`border-b pb-3 ${headerBorder}`}>
            <h3 className="text-sm font-semibold">Bucket</h3>
          </div>

          <div className="flex-1 flex items-end justify-around gap-3 pt-8 pb-4 px-4 relative">
            <div className="absolute inset-x-4 top-8 bottom-8 flex flex-col justify-between pointer-events-none">
              {[100, 75, 50, 25, 0].map((mark) => (
                <div key={mark} className={`border-b w-full flex items-center ${gridLine}`}>
                  <span className="text-[10px] text-zinc-500 -mt-4">
                    {Math.round((mark / 100) * maxBucketCount)}
                  </span>
                </div>
              ))}
            </div>

            {buckets.map((b) => {
              const bTasks = tasks.filter((t) => (t.bucketId || 'bucket-initiating') === b.id);
              const bDone = bTasks.filter((t) => t.status === 'Done').length;
              const bLate = bTasks.filter((t) => t.status !== 'Done' && t.dueDate && t.dueDate < today).length;
              const bRest = bTasks.length - bDone - bLate;
              const heightPct = Math.round((bTasks.length / maxBucketCount) * 100);

              return (
                <div key={b.id} className="flex flex-col items-center z-10 flex-1 h-48 justify-end min-w-0">
                  <div
                    style={{ height: `${Math.max(heightPct, bTasks.length > 0 ? 12 : 0)}%` }}
                    className="w-6 rounded-t overflow-hidden flex flex-col"
                  >
                    {bDone > 0 && <div style={{ flex: bDone }} className="bg-[#2eb899] w-full" />}
                    {bLate > 0 && <div style={{ flex: bLate }} className="bg-[#e15252] w-full" />}
                    {bRest > 0 && <div style={{ flex: bRest }} className="bg-[#c4b5fd] w-full" />}
                  </div>
                  <span className={`text-[10px] mt-2 truncate max-w-[65px] ${mutedText}`} title={b.name}>
                    {b.name}
                  </span>
                </div>
              );
            })}
          </div>

          <div className={`flex flex-wrap items-center justify-center gap-4 text-[11px] pt-2 ${mutedText}`}>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-[#c4b5fd]" /> Not Started
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-[#5b5fc7]" /> In Progress
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-[#e15252]" /> Late
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-[#2eb899]" /> Completed
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Full-Width Card: Members Bar Chart */}
      <div className={`border rounded-xl p-5 ${cardSurface}`}>
        <div className={`border-b pb-3 mb-4 ${headerBorder}`}>
          <h3 className="text-sm font-semibold">Members</h3>
        </div>

        <div className="h-48 flex items-end justify-around gap-4 pt-6 pb-2 px-6 relative">
          <div className="absolute inset-x-6 top-4 bottom-8 flex flex-col justify-between pointer-events-none">
            {[100, 50, 0].map((mark) => (
              <div key={mark} className={`border-b w-full flex items-center ${gridLine}`}>
                <span className="text-[10px] text-zinc-500 -mt-4">
                  {Math.round((mark / 100) * maxMemberCount)}
                </span>
              </div>
            ))}
          </div>

          {members.map((m) => {
            const mTasks = tasks.filter((t) => (t.assignees || []).includes(m.id));
            const mDone = mTasks.filter((t) => t.status === 'Done').length;
            const mRest = mTasks.length - mDone;
            const heightPct = Math.round((mTasks.length / maxMemberCount) * 100);

            return (
              <div key={m.id} className="flex flex-col items-center z-10 flex-1 h-40 justify-end min-w-0">
                <div
                  style={{ height: `${Math.max(heightPct, mTasks.length > 0 ? 14 : 4)}%` }}
                  className="w-5 rounded-t overflow-hidden flex flex-col"
                >
                  {mDone > 0 && <div style={{ flex: mDone }} className="bg-[#2eb899] w-full" />}
                  {mRest > 0 && <div style={{ flex: mRest }} className="bg-[#c4b5fd] w-full" />}
                </div>
                <span className={`text-[11px] mt-2 truncate max-w-[110px] ${mutedText}`} title={m.name}>
                  {m.name.split(' ')[0]}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 2. MICROSOFT PLANNER CALENDAR / SCHEDULE VIEW
// ==========================================
interface PlannerScheduleProps {
  tasks: ProjectTask[];
  isLight: boolean;
  onSelectTask: (task: ProjectTask) => void;
}

const MONTHS = ['January 2026', 'February 2026', 'March 2026', 'April 2026', 'May 2026', 'June 2026'];

export const PlannerScheduleView: React.FC<PlannerScheduleProps> = ({
  tasks,
  isLight,
  onSelectTask
}) => {
  const [monthIdx, setMonthIdx] = useState(2); // March 2026
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const cardSurface = isLight
    ? 'bg-white border-slate-200 text-slate-900 shadow-sm'
    : 'bg-[#242424] border-[#333333] text-white';

  return (
    <div className={`border rounded-xl p-5 space-y-4 ${cardSurface}`}>
      <span className="sr-only">Schedule & Sprint Timeline</span>
      <div className={`flex items-center justify-between border-b pb-3 ${isLight ? 'border-slate-200' : 'border-[#333333]'}`}>
        <div className="flex items-center gap-3">
          <CalendarIcon className="w-4 h-4 text-[#5b5fc7]" />
          <h3 className="text-sm font-semibold">{MONTHS[monthIdx]}</h3>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setMonthIdx((prev) => (prev > 0 ? prev - 1 : MONTHS.length - 1))}
            className={`p-1.5 rounded transition-colors ${isLight ? 'hover:bg-slate-100 text-slate-600' : 'hover:bg-[#333333] text-zinc-400 hover:text-white'}`}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setMonthIdx(2)}
            className={`px-2.5 py-1 rounded text-xs font-medium ${isLight ? 'bg-slate-100 text-slate-800' : 'bg-[#333333] text-white'}`}
          >
            Today
          </button>
          <button
            type="button"
            onClick={() => setMonthIdx((prev) => (prev < MONTHS.length - 1 ? prev + 1 : 0))}
            className={`p-1.5 rounded transition-colors ${isLight ? 'hover:bg-slate-100 text-slate-600' : 'hover:bg-[#333333] text-zinc-400 hover:text-white'}`}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className={`grid grid-cols-7 gap-px border rounded-lg overflow-hidden ${isLight ? 'bg-slate-200 border-slate-200' : 'bg-[#333333] border-[#333333]'}`}>
        {daysOfWeek.map((d) => (
          <div
            key={d}
            className={`py-2 px-3 text-[11px] font-medium ${isLight ? 'bg-slate-50 text-slate-500' : 'bg-[#1f1f1f] text-zinc-400'}`}
          >
            {d}
          </div>
        ))}
        {Array.from({ length: 28 }, (_, i) => {
          const dayNum = i + 1;
          const dayTasks = tasks.filter((t, idx) => {
            if (t.dueDate) {
              const d = parseInt(t.dueDate.split('-')[2] || '0', 10);
              if (d === dayNum) return true;
            }
            return ((idx * 6 + 3 + monthIdx) % 28) + 1 === dayNum;
          });

          return (
            <div
              key={dayNum}
              className={`min-h-[96px] p-2 flex flex-col justify-between transition-colors ${
                isLight ? 'bg-white hover:bg-slate-50' : 'bg-[#242424] hover:bg-[#2a2a2a]'
              }`}
            >
              <span className={`text-xs ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>{dayNum}</span>
              <div className="space-y-1 mt-1">
                {dayTasks.slice(0, 2).map((t) => (
                  <button
                    key={t.id}
                    onClick={() => onSelectTask(t)}
                    className={`w-full text-left px-2 py-1 rounded text-[11px] truncate flex items-center gap-1.5 ${
                      isLight
                        ? 'bg-indigo-50 hover:bg-indigo-100 text-indigo-950 border border-indigo-200'
                        : 'bg-[#33344a] hover:bg-[#444663] text-white'
                    }`}
                  >
                    {t.status === 'Done' ? (
                      <CheckCircle2 className="w-3 h-3 text-[#5b5fc7] shrink-0" />
                    ) : (
                      <Circle className="w-3 h-3 text-zinc-400 shrink-0" />
                    )}
                    <span className={t.status === 'Done' ? 'line-through opacity-75 truncate' : 'truncate'}>
                      {t.title}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ==========================================
// 3. CLEAN MICROSOFT PLANNER TASK DETAILS MODAL
// ==========================================
interface PlannerTaskModalProps {
  task: ProjectTask;
  project: PortfolioProject;
  allTasks: ProjectTask[];
  isAdmin: boolean;
  onClose: () => void;
  onSave: (updated: ProjectTask) => void;
  onDelete: (id: string) => void;
}

export const PlannerTaskModal: React.FC<PlannerTaskModalProps> = ({
  task,
  project,
  isAdmin,
  onClose,
  onSave,
  onDelete
}) => {
  const [draft, setDraft] = useState<ProjectTask>({
    ...task,
    checklist: task.checklist || [],
    labels: task.labels || [],
    assignees: task.assignees || [],
    loggedMinutes: task.loggedMinutes || 0
  });
  const [newChecklistTitle, setNewChecklistTitle] = useState('');

  const buckets = project.buckets && project.buckets.length > 0 ? project.buckets : DEFAULT_BUCKETS;
  const members = project.members && project.members.length > 0 ? project.members : DEFAULT_MEMBERS;

  const toggleLabel = (key: string) => {
    const current = draft.labels || [];
    setDraft({
      ...draft,
      labels: current.includes(key) ? current.filter((l) => l !== key) : [...current, key]
    });
  };

  const toggleAssignee = (memId: string) => {
    const current = draft.assignees || [];
    setDraft({
      ...draft,
      assignees: current.includes(memId) ? current.filter((m) => m !== memId) : [...current, memId]
    });
  };

  const handleAddChecklist = () => {
    if (!newChecklistTitle.trim()) return;
    setDraft({
      ...draft,
      checklist: [
        ...(draft.checklist || []),
        { id: `chk-${Date.now()}`, title: newChecklistTitle.trim(), completed: false }
      ]
    });
    setNewChecklistTitle('');
  };

  const chkList = draft.checklist || [];
  const chkDone = chkList.filter((c) => c.completed).length;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#242424] border border-[#3a3a3a] rounded-xl max-w-2xl w-full p-6 space-y-5 shadow-2xl text-white">
        <div className="flex items-center justify-between border-b border-[#333333] pb-3">
          <h3 className="text-base font-semibold text-white">Edit Task / Feature</h3>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white px-2 py-1 rounded hover:bg-[#333333]"
          >
            ✕
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-xs text-zinc-400 mb-1">Task name</label>
            <input
              type="text"
              value={draft.title}
              onChange={(e) => setDraft({ ...draft, title: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-[#1a1a1a] border border-[#3a3a3a] text-sm text-white focus:outline-none focus:border-[#5b5fc7]"
            />
          </div>
          <div>
            <label className="block text-xs text-zinc-400 mb-1">Notes / Outcome</label>
            <input
              type="text"
              value={draft.result}
              onChange={(e) => setDraft({ ...draft, result: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-[#1a1a1a] border border-[#3a3a3a] text-sm text-white focus:outline-none focus:border-[#5b5fc7]"
            />
          </div>
        </div>

        {/* Assignees */}
        <div>
          <label className="block text-xs text-zinc-400 mb-1.5">Assigned to</label>
          <div className="flex flex-wrap gap-2">
            {members.map((m) => {
              const active = (draft.assignees || []).includes(m.id);
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => toggleAssignee(m.id)}
                  className={`px-2.5 py-1 rounded-full text-xs flex items-center gap-1.5 border transition-all ${
                    active
                      ? 'bg-[#5b5fc7]/25 border-[#5b5fc7] text-white'
                      : 'bg-[#1a1a1a] border-[#333333] text-zinc-400 hover:text-white'
                  }`}
                >
                  <span
                    className="w-4 h-4 rounded-full text-[9px] font-bold text-white flex items-center justify-center"
                    style={{ backgroundColor: m.color }}
                  >
                    {m.initials}
                  </span>
                  {m.name.split(' ')[0]}
                </button>
              );
            })}
          </div>
        </div>

        {/* Bucket, Progress, Priority, Start, Due */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs text-zinc-400 mb-1">Bucket</label>
            <select
              value={draft.bucketId || 'bucket-initiating'}
              onChange={(e) => setDraft({ ...draft, bucketId: e.target.value })}
              className="w-full px-2.5 py-2 rounded-lg bg-[#1a1a1a] border border-[#3a3a3a] text-xs text-white"
            >
              {buckets.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs text-zinc-400 mb-1">Progress</label>
            <select
              value={draft.status}
              onChange={(e) => setDraft({ ...draft, status: e.target.value as TaskStatus })}
              className="w-full px-2.5 py-2 rounded-lg bg-[#1a1a1a] border border-[#3a3a3a] text-xs text-white"
            >
              <option value="To Do">Not started</option>
              <option value="In Progress">In progress</option>
              <option value="Done">Completed</option>
            </select>
          </div>

          <div>
            <label className="block text-xs text-zinc-400 mb-1">Priority</label>
            <select
              value={draft.priority}
              onChange={(e) => setDraft({ ...draft, priority: e.target.value as TaskPriority })}
              className="w-full px-2.5 py-2 rounded-lg bg-[#1a1a1a] border border-[#3a3a3a] text-xs text-white"
            >
              <option value="Urgent">Urgent</option>
              <option value="Important">Important</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>

          <div>
            <label className="block text-xs text-zinc-400 mb-1">Start date</label>
            <input
              type="date"
              value={draft.startDate || ''}
              onChange={(e) => setDraft({ ...draft, startDate: e.target.value })}
              className="w-full px-2.5 py-1.5 rounded-lg bg-[#1a1a1a] border border-[#3a3a3a] text-xs text-white"
            />
          </div>

          <div>
            <label className="block text-xs text-zinc-400 mb-1">Due date</label>
            <input
              type="date"
              value={draft.dueDate || ''}
              onChange={(e) => setDraft({ ...draft, dueDate: e.target.value })}
              className="w-full px-2.5 py-1.5 rounded-lg bg-[#1a1a1a] border border-[#3a3a3a] text-xs text-white"
            />
          </div>

          <div>
            <label className="block text-xs text-zinc-400 mb-1">Labels</label>
            <div className="flex flex-wrap gap-1 pt-1">
              {PLANNER_LABELS.map((lbl) => {
                const active = (draft.labels || []).includes(lbl.key);
                return (
                  <button
                    key={lbl.key}
                    type="button"
                    onClick={() => toggleLabel(lbl.key)}
                    className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-all ${
                      active
                        ? `${lbl.pillBg} ${lbl.pillText} ring-2 ring-white`
                        : 'bg-[#1a1a1a] text-zinc-400 border border-[#333333]'
                    }`}
                  >
                    {lbl.name}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Novelty: Focus Pomodoro Timer */}
        <div className="p-3 rounded-lg bg-[#1a1a1a] border border-[#333333] flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs">
            <Clock className="w-4 h-4 text-[#2eb899]" />
            <span>
              Focus Time Logged: <strong>{draft.loggedMinutes || 0} mins</strong>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setDraft({ ...draft, loggedMinutes: (draft.loggedMinutes || 0) + 25 })}
              className="px-2.5 py-1 rounded bg-[#2eb899] text-black font-semibold text-xs flex items-center gap-1"
            >
              <Play className="w-3 h-3" /> +25m Focus
            </button>
            <button
              type="button"
              onClick={() => setDraft({ ...draft, loggedMinutes: 0 })}
              className="p-1 rounded bg-[#333333] text-zinc-300 hover:text-white"
              title="Reset time"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Checklist */}
        <div className="space-y-2 border-t border-[#333333] pt-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-300 flex items-center gap-1.5">
              <CheckSquare className="w-3.5 h-3.5 text-[#7f85f5]" />
              Checklist ({chkDone} / {chkList.length})
            </span>
            <button
              type="button"
              onClick={() =>
                setDraft({
                  ...draft,
                  checklist: [...chkList, ...generateSmartSubtasks(draft)]
                })
              }
              className="text-xs text-[#7f85f5] hover:underline flex items-center gap-1"
            >
              <Sparkles className="w-3.5 h-3.5" />
              AI Suggest subtasks
            </button>
          </div>

          <div className="space-y-1.5 max-h-36 overflow-y-auto">
            {chkList.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between px-2.5 py-1.5 rounded bg-[#1a1a1a] text-xs"
              >
                <button
                  type="button"
                  onClick={() =>
                    setDraft({
                      ...draft,
                      checklist: chkList.map((c) => (c.id === item.id ? { ...c, completed: !c.completed } : c))
                    })
                  }
                  className="flex items-center gap-2 text-left flex-1"
                >
                  {item.completed ? (
                    <CheckCircle2 className="w-4 h-4 text-[#7f85f5] shrink-0" />
                  ) : (
                    <Circle className="w-4 h-4 text-zinc-500 shrink-0" />
                  )}
                  <span className={item.completed ? 'line-through text-zinc-500' : 'text-zinc-200'}>
                    {item.title}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setDraft({ ...draft, checklist: chkList.filter((c) => c.id !== item.id) })}
                  className="text-zinc-500 hover:text-rose-400"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={newChecklistTitle}
              onChange={(e) => setNewChecklistTitle(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddChecklist())}
              placeholder="Add an item"
              className="flex-1 px-3 py-1.5 rounded bg-[#1a1a1a] border border-[#3a3a3a] text-xs text-white"
            />
            <button
              type="button"
              onClick={handleAddChecklist}
              className="px-3 py-1.5 rounded bg-[#333333] hover:bg-[#444444] text-xs text-white flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Add
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-[#333333]">
          {isAdmin ? (
            <button
              type="button"
              onClick={() => {
                onDelete(draft.id);
                onClose();
              }}
              className="text-xs text-rose-400 hover:underline flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" /> Delete task
            </button>
          ) : (
            <div />
          )}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg border border-[#3a3a3a] text-xs text-zinc-300 hover:bg-[#333333]"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => onSave(draft)}
              className="px-4 py-1.5 rounded-lg bg-[#5b5fc7] hover:bg-[#4f52b2] text-xs font-semibold text-white"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
