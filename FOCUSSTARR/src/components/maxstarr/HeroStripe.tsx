'use client';

import { cn } from '@/lib/utils';

export default function HeroStripe() {
  return (
    <div className="bg-black px-4 md:px-6 py-2.5 md:py-3 flex items-center gap-2 md:gap-3 border-b-[2px] border-black flex-wrap">
      <div
        className="text-xs md:text-[15px] tracking-[1px] md:tracking-[2px] text-[var(--brand-yellow)]"
        style={{ fontFamily: 'Bebas Neue, sans-serif' }}
      >
        WEEK 8 — EXECUTION MODE
      </div>
      <div className="w-1.5 h-1.5 bg-[var(--brand-red)] rounded-full hidden sm:block" />
      <div
        className="text-[10px] md:text-xs text-[var(--gray-400)] hidden md:block"
        style={{ fontFamily: 'var(--font-space-mono), monospace' }}
      >
        Finish what you start. One thing at a time.
      </div>
      <div className="ml-auto flex gap-1.5 md:gap-2">
        <span
          className={cn(
            "text-[9px] md:text-[10px] font-bold px-1.5 md:px-2 py-0.5 rounded-full border-[1.5px] border-black tracking-wider",
            "bg-[var(--brand-red)] text-white"
          )}
          style={{ fontFamily: 'var(--font-space-mono), monospace' }}
        >
          URGENT
        </span>
        <span
          className={cn(
            "text-[9px] md:text-[10px] font-bold px-1.5 md:px-2 py-0.5 rounded-full border-[1.5px] border-black tracking-wider",
            "bg-[var(--brand-yellow)] text-black"
          )}
          style={{ fontFamily: 'var(--font-space-mono), monospace' }}
        >
          IN PROGRESS
        </span>
      </div>
    </div>
  );
}
