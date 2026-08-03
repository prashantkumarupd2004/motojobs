'use client';

import type { LucideIcon } from 'lucide-react';

export default function SectionTitle({
  icon: Icon,
  title,
}: {
  icon: LucideIcon;
  title: string;
}) {
  return (
    <div className="flex items-center gap-2.5 pb-1">
      <span className="w-9 h-9 rounded-[12px] bg-brand-50 border border-brand-100 flex items-center justify-center shrink-0">
        <Icon className="w-4.5 h-4.5 text-brand-600" strokeWidth={2.1} />
      </span>
      <h2 className="text-[17px] font-bold text-ink tracking-[-0.02em]">{title}</h2>
    </div>
  );
}
