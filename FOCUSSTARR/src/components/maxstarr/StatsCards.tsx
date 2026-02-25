'use client';

import { useStore } from '@/lib/store';
import { cn } from '@/lib/utils';

interface StatCardProps {
  label: string;
  value: number;
  colorClass: string;
}

function StatCard({ label, value, colorClass }: StatCardProps) {
  return (
    <div className="bg-white border-[2px] border-black rounded-lg p-4 relative transition-all duration-200 hover:translate-y-[-2px] hover:shadow-[4px_4px_0_black]">
      <div className={cn("absolute top-0 left-0 right-0 h-[3px]", colorClass)} />
      <div
        className="text-[9px] text-[var(--gray-400)] tracking-wider uppercase mb-1"
        style={{ fontFamily: 'var(--font-space-mono), monospace' }}
      >
        {label}
      </div>
      <div
        className="text-[28px] leading-none text-black"
        style={{ fontFamily: 'Bebas Neue, sans-serif' }}
      >
        {value}
      </div>
    </div>
  );
}

export default function StatsCards() {
  const { tasks } = useStore();

  const activeTasks = tasks.filter(t => !t.isArchived);
  const total = activeTasks.length;
  const inProgress = activeTasks.filter(t => t.status === 'doing').length;
  const completed = activeTasks.filter(t => t.status === 'done').length;
  const backlog = activeTasks.filter(t => t.status === 'todo').length;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <StatCard label="TOTAL TASKS" value={total} colorClass="bg-[var(--brand-blue)]" />
      <StatCard label="IN PROGRESS" value={inProgress} colorClass="bg-[var(--brand-red)]" />
      <StatCard label="COMPLETED" value={completed} colorClass="bg-[var(--brand-yellow)]" />
      <StatCard label="BACKLOG" value={backlog} colorClass="bg-black" />
    </div>
  );
}
