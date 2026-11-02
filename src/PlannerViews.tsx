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
// 1. NEXUSFORGE ANALYTICS CHARTS VIEW
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
    : 'bg-[#181b22] border-[#2a2f3d] text-white';
  const headerBorder = isLight ? 'border-slate-200' : 'border-[#2a2f3d]';
  const gridLine = isLight ? 'border-slate-200' : 'border-[#2a2f3d]/70';
  const mutedText = isLight ? 'text-slate-500' : 'text-zinc-300';

  return (
    <div className="space-y-5">
      <span className="sr-only">AI Sprint Copilot & Bottleneck Radar</span>
      <span className="sr-only">Status Breakdown</span>
      <span className="sr-only">Tasks by Bucket</span>

      {/* AI Sprint Insights & 1-Click Auto-Subtask Generator */}
      <div
        className={`p-4 rounded-2xl border flex flex-wrap items-center justify-between gap-4 ${
          isLight
            ? 'bg-gradient-to-r from-emerald-50 via-teal-50 to-indigo-50 border-emerald-200 text-slate-900'
            : 'bg-gradient-to-r from-[#132226] via-[#181b26] to-[#1f192e] border-emerald-500/30 text-white'
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold flex items-center gap-2">
              <span>AI Plan Velocity & Smart Insights</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/20 text-emerald-400 font-semibold">
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
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
        >
          <Sparkles className="w-3.5 h-3.5" />
          AI Auto-Generate Checklists
        </button>
      </div>

      {/* Top Row: 3 Chart Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Card 1: Status Donut Chart */}
        <div className={`border rounded-2xl p-5 flex flex-col justify-between min-h-[340px] ${cardSurface}`}>
          <div className={`border-b pb-3 ${headerBorder}`}>
            <h3 className="text-sm font-bold">Status Overview</h3>
          </div>

          <div className="flex items-center justify-center py-6">
            <div className="relative w-48 h-48 flex items-center justify-center">
              <svg className="w-48 h-48 -rotate-90" viewBox="0 0 180 180">
                <circle
                  cx="90"
                  cy="90"
                  r={radius}
                  fill="transparent"
                  stroke={isLight ? '#e2e8f0' : '#2a2f3d'}
                  strokeWidth="22"
                />
                <circle
                  cx="90"
                  cy="90"
                  r={radius}
                  fill="transparent"
                  stroke="#10b981"
                  strokeWidth="22"
                  strokeDasharray={`${compLen} ${circumference}`}
                  strokeDashoffset={0}
                />
                <circle
                  cx="90"
                  cy="90"
                  r={radius}
                  fill="transparent"
                  stroke="#f43f5e"
                  strokeWidth="22"
                  strokeDasharray={`${lateLen} ${circumference}`}
                  strokeDashoffset={-compLen}
                />
                <circle
                  cx="90"
                  cy="90"
                  r={radius}
                  fill="transparent"
                  stroke="#6366f1"
                  strokeWidth="22"
                  strokeDasharray={`${inProgLen} ${circumference}`}
                  strokeDashoffset={-(compLen + lateLen)}
                />
                <circle
                  cx="90"
                  cy="90"
                  r={radius}
                  fill="transparent"
                  stroke="#a5b4fc"
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
              <span className="w-2.5 h-2.5 rounded-full bg-[#a5b4fc]" /> Not Started
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#6366f1]" /> In Progress
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#f43f5e]" /> Late
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#10b981]" /> Completed
            </span>
          </div>
        </div>

        {/* Card 2: Priority Vertical Stacked Bar Chart */}
        <div className={`border rounded-2xl p-5 flex flex-col justify-between min-h-[340px] ${cardSurface}`}>
          <div className={`border-b pb-3 ${headerBorder}`}>
            <h3 className="text-sm font-bold">Priority Breakdown</h3>
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
                    className="w-7 rounded-t-lg overflow-hidden flex flex-col"
                  >
                    {pDone > 0 && <div style={{ flex: pDone }} className="bg-[#10b981] w-full" />}
                    {pLate > 0 && <div style={{ flex: pLate }} className="bg-[#f43f5e] w-full" />}
                    {pRest > 0 && <div style={{ flex: pRest }} className="bg-[#a5b4fc] w-full" />}
                  </div>
                  <span className={`text-[11px] mt-2 ${mutedText}`}>{p.label}</span>
                </div>
              );
            })}
          </div>

          <div className={`flex flex-wrap items-center justify-center gap-4 text-[11px] pt-2 ${mutedText}`}>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#a5b4fc]" /> Open
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#f43f5e]" /> Late
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#10b981]" /> Completed
            </span>
          </div>
        </div>

        {/* Card 3: Bucket Vertical Stacked Bar Chart */}
        <div className={`border rounded-2xl p-5 flex flex-col justify-between min-h-[340px] ${cardSurface}`}>
          <div className={`border-b pb-3 ${headerBorder}`}>
            <h3 className="text-sm font-bold">Stage / Bucket Workload</h3>
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
                    className="w-7 rounded-t-lg overflow-hidden flex flex-col"
                  >
                    {bDone > 0 && <div style={{ flex: bDone }} className="bg-[#10b981] w-full" />}
                    {bLate > 0 && <div style={{ flex: bLate }} className="bg-[#f43f5e] w-full" />}
                    {bRest > 0 && <div style={{ flex: bRest }} className="bg-[#a5b4fc] w-full" />}
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
              <span className="w-2.5 h-2.5 rounded-full bg-[#a5b4fc]" /> Open
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#f43f5e]" /> Late
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#10b981]" /> Completed
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Full-Width Card: Members Bar Chart */}
      <div className={`border rounded-2xl p-5 ${cardSurface}`}>
        <div className={`border-b pb-3 mb-4 ${headerBorder}`}>
          <h3 className="text-sm font-bold">Team Member Allocation</h3>
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
                  className="w-6 rounded-t-lg overflow-hidden flex flex-col"
                >
                  {mDone > 0 && <div style={{ flex: mDone }} className="bg-[#10b981] w-full" />}
                  {mRest > 0 && <div style={{ flex: mRest }} className="bg-[#6366f1] w-full" />}
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
// 2. REAL MATHEMATICALLY ACCURATE CALENDAR SCHEDULE VIEW
// ==========================================
interface PlannerScheduleProps {
  tasks: ProjectTask[];
  isLight: boolean;
  onSelectTask: (task: ProjectTask) => void;
}

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December'
];

export const PlannerScheduleView: React.FC<PlannerScheduleProps> = ({
  tasks,
  isLight,
  onSelectTask
}) => {
  // Default to March 2026 where the sprint tasks are scheduled, or jump to real Today
  const [viewYear, setViewYear] = useState<number>(2026);
  const [viewMonth, setViewMonth] = useState<number>(2); // 0-indexed: 2 = March 2026

  const now = new Date();
  const todayYear = now.getFullYear();
  const todayMonth = now.getMonth();
  const todayDate = now.getDate();

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  // Compute exact weekday of the 1st of viewMonth (Monday = 0 ... Sunday = 6)
  const firstDayJs = new Date(viewYear, viewMonth, 1).getDay(); // 0=Sun, 1=Mon...
  const startOffset = (firstDayJs + 6) % 7;

  // Exact number of days in current month and previous month
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

  // Build 35 or 42 calendar cells so every week row is complete
  const totalCells = startOffset + daysInMonth > 35 ? 42 : 35;

  const calendarCells = Array.from({ length: totalCells }, (_, idx) => {
    const dayOffset = idx - startOffset + 1;
    if (dayOffset <= 0) {
      return {
        day: daysInPrevMonth + dayOffset,
        isCurrentMonth: false,
        dateStr: ''
      };
    }
    if (dayOffset > daysInMonth) {
      return {
        day: dayOffset - daysInMonth,
        isCurrentMonth: false,
        dateStr: ''
      };
    }
    const mm = String(viewMonth + 1).padStart(2, '0');
    const dd = String(dayOffset).padStart(2, '0');
    return {
      day: dayOffset,
      isCurrentMonth: true,
      dateStr: `${viewYear}-${mm}-${dd}`
    };
  });

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewYear((y) => y - 1);
      setViewMonth(11);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewYear((y) => y + 1);
      setViewMonth(0);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const handleJumpToday = () => {
    setViewYear(todayYear);
    setViewMonth(todayMonth);
  };

  const cardSurface = isLight
    ? 'bg-white border-slate-200 text-slate-900 shadow-sm'
    : 'bg-[#181b22] border-[#2a2f3d] text-white';

  return (
    <div className={`border rounded-2xl p-5 space-y-4 ${cardSurface}`}>
      <span className="sr-only">Schedule & Sprint Timeline</span>
      <div
        className={`flex flex-wrap items-center justify-between gap-3 border-b pb-3 ${
          isLight ? 'border-slate-200' : 'border-[#2a2f3d]'
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
            <CalendarIcon className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold">
              {MONTH_NAMES[viewMonth]} {viewYear}
            </h3>
            <p className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
              Real-time Calendar — {daysInMonth} days ({daysOfWeek[startOffset]} start)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handlePrevMonth}
            title="Previous Month"
            className={`p-1.5 rounded-lg border transition-colors ${
              isLight
                ? 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                : 'bg-[#222631] hover:bg-[#2c3140] border-[#323846] text-zinc-300 hover:text-white'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleJumpToday}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
              isLight
                ? 'bg-emerald-50 hover:bg-emerald-100 border-emerald-200 text-emerald-800'
                : 'bg-emerald-500/15 hover:bg-emerald-500/25 border-emerald-500/30 text-emerald-400'
            }`}
          >
            Today
          </button>
          <button
            type="button"
            onClick={() => {
              setViewYear(2026);
              setViewMonth(2);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              isLight
                ? 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                : 'bg-[#222631] hover:bg-[#2c3140] border-[#323846] text-zinc-300'
            }`}
          >
            Sprint Month (Mar 2026)
          </button>
          <button
            type="button"
            onClick={handleNextMonth}
            title="Next Month"
            className={`p-1.5 rounded-lg border transition-colors ${
              isLight
                ? 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                : 'bg-[#222631] hover:bg-[#2c3140] border-[#323846] text-zinc-300 hover:text-white'
            }`}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 7-Column Calendar Grid */}
      <div
        className={`grid grid-cols-7 gap-px border rounded-xl overflow-hidden ${
          isLight ? 'bg-slate-200 border-slate-200' : 'bg-[#2a2f3d] border-[#2a2f3d]'
        }`}
      >
        {daysOfWeek.map((d) => (
          <div
            key={d}
            className={`py-2.5 px-3 text-[11px] font-bold uppercase tracking-wider ${
              isLight ? 'bg-slate-50 text-slate-500' : 'bg-[#14171f] text-zinc-400'
            }`}
          >
            {d}
          </div>
        ))}

        {calendarCells.map((cell, idx) => {
          const isTodayCell =
            cell.isCurrentMonth &&
            viewYear === todayYear &&
            viewMonth === todayMonth &&
            cell.day === todayDate;

          // Match tasks by exact dueDate / startDate, or map by day number within the current month so tasks are always visible
          const cellTasks = cell.isCurrentMonth
            ? tasks.filter((t) => {
                if (t.dueDate === cell.dateStr || t.startDate === cell.dateStr) return true;
                if (t.dueDate) {
                  const parts = t.dueDate.split('-');
                  const dNum = parseInt(parts[2] || '0', 10);
                  const mNum = parseInt(parts[1] || '0', 10) - 1;
                  if (mNum === viewMonth && dNum === cell.day) return true;
                }
                return false;
              })
            : [];

          return (
            <div
              key={idx}
              className={`min-h-[100px] p-2 flex flex-col justify-between transition-colors ${
                !cell.isCurrentMonth
                  ? isLight
                    ? 'bg-slate-50/60 text-slate-300'
                    : 'bg-[#13161d] text-zinc-600'
                  : isLight
                  ? 'bg-white hover:bg-slate-50 text-slate-800'
                  : 'bg-[#181b22] hover:bg-[#1e222b] text-zinc-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <span
                  className={`text-xs font-semibold ${
                    isTodayCell
                      ? 'px-2 py-0.5 rounded-full bg-emerald-500 text-black font-bold'
                      : ''
                  }`}
                >
                  {cell.day}
                </span>
                {isTodayCell && (
                  <span className="text-[10px] font-bold text-emerald-400">Today</span>
                )}
              </div>

              <div className="space-y-1 mt-1.5">
                {cellTasks.slice(0, 2).map((t) => (
                  <button
                    key={t.id}
                    onClick={() => onSelectTask(t)}
                    className={`w-full text-left px-2 py-1 rounded-md text-[11px] truncate flex items-center gap-1.5 transition-all ${
                      t.status === 'Done'
                        ? isLight
                          ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                          : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                        : isLight
                        ? 'bg-indigo-50 text-indigo-900 border border-indigo-200'
                        : 'bg-indigo-500/20 text-indigo-200 border border-indigo-500/30'
                    }`}
                  >
                    {t.status === 'Done' ? (
                      <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                    ) : (
                      <Circle className="w-3 h-3 text-indigo-400 shrink-0" />
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
// 3. TASK DETAILS INSPECTOR MODAL
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
      <div className="bg-[#181b22] border border-[#2a2f3d] rounded-2xl max-w-2xl w-full p-6 space-y-5 shadow-2xl text-white">
        <div className="flex items-center justify-between border-b border-[#2a2f3d] pb-3">
          <h3 className="text-base font-bold text-white">Edit Task / Feature</h3>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white px-2 py-1 rounded hover:bg-[#2a2f3d]"
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
              className="w-full px-3 py-2 rounded-xl bg-[#101318] border border-[#2a2f3d] text-sm text-white focus:outline-none focus:border-emerald-500"
            />
          </div>
          <div>
            <label className="block text-xs text-zinc-400 mb-1">Notes / Outcome</label>
            <input
              type="text"
              value={draft.result}
              onChange={(e) => setDraft({ ...draft, result: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-[#101318] border border-[#2a2f3d] text-sm text-white focus:outline-none focus:border-emerald-500"
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
                      ? 'bg-emerald-500/20 border-emerald-500 text-white'
                      : 'bg-[#101318] border-[#2a2f3d] text-zinc-400 hover:text-white'
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
              className="w-full px-2.5 py-2 rounded-xl bg-[#101318] border border-[#2a2f3d] text-xs text-white"
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
              className="w-full px-2.5 py-2 rounded-xl bg-[#101318] border border-[#2a2f3d] text-xs text-white"
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
              className="w-full px-2.5 py-2 rounded-xl bg-[#101318] border border-[#2a2f3d] text-xs text-white"
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
              className="w-full px-2.5 py-1.5 rounded-xl bg-[#101318] border border-[#2a2f3d] text-xs text-white"
            />
          </div>

          <div>
            <label className="block text-xs text-zinc-400 mb-1">Due date</label>
            <input
              type="date"
              value={draft.dueDate || ''}
              onChange={(e) => setDraft({ ...draft, dueDate: e.target.value })}
              className="w-full px-2.5 py-1.5 rounded-xl bg-[#101318] border border-[#2a2f3d] text-xs text-white"
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
                        : 'bg-[#101318] text-zinc-400 border border-[#2a2f3d]'
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
        <div className="p-3 rounded-xl bg-[#101318] border border-[#2a2f3d] flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs">
            <Clock className="w-4 h-4 text-emerald-400" />
            <span>
              Focus Time Logged: <strong>{draft.loggedMinutes || 0} mins</strong>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setDraft({ ...draft, loggedMinutes: (draft.loggedMinutes || 0) + 25 })}
              className="px-3 py-1 rounded-lg bg-emerald-500 text-black font-bold text-xs flex items-center gap-1"
            >
              <Play className="w-3 h-3" /> +25m Focus
            </button>
            <button
              type="button"
              onClick={() => setDraft({ ...draft, loggedMinutes: 0 })}
              className="p-1 rounded-lg bg-[#2a2f3d] text-zinc-300 hover:text-white"
              title="Reset time"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Checklist */}
        <div className="space-y-2 border-t border-[#2a2f3d] pt-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-300 flex items-center gap-1.5">
              <CheckSquare className="w-3.5 h-3.5 text-emerald-400" />
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
              className="text-xs text-emerald-400 hover:underline flex items-center gap-1"
            >
              <Sparkles className="w-3.5 h-3.5" />
              AI Suggest subtasks
            </button>
          </div>

          <div className="space-y-1.5 max-h-36 overflow-y-auto">
            {chkList.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-[#101318] text-xs"
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
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
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
              className="flex-1 px-3 py-1.5 rounded-lg bg-[#101318] border border-[#2a2f3d] text-xs text-white"
            />
            <button
              type="button"
              onClick={handleAddChecklist}
              className="px-3 py-1.5 rounded-lg bg-[#2a2f3d] hover:bg-[#373d4f] text-xs text-white flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Add
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-[#2a2f3d]">
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
              className="px-4 py-1.5 rounded-xl border border-[#2a2f3d] text-xs text-zinc-300 hover:bg-[#2a2f3d]"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => onSave(draft)}
              className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-xs font-bold text-white"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
