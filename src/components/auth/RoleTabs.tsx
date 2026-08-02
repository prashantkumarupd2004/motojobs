'use client';
import { Building2, Users } from 'lucide-react';

export type Role = 'CANDIDATE' | 'RECRUITER';

interface RoleTabsProps {
  value: Role;
  onChange: (next: Role) => void;
}

const TABS = [
  { value: 'CANDIDATE', label: 'Job Seeker', Icon: Users },
  { value: 'RECRUITER', label: 'Employer', Icon: Building2 },
] as const;

export default function RoleTabs({ value, onChange }: RoleTabsProps) {
  return (
    <div
      role="radiogroup"
      aria-label="Account type"
      className="grid grid-cols-2 border-b border-[#E2E8F0]"
    >
      {TABS.map(({ value: v, label, Icon }) => {
        const active = value === v;
        return (
          <button
            key={v}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(v)}
            className={`-mb-px flex items-center justify-center gap-2 pb-3.5 text-[14px] font-semibold border-b-2 transition-colors duration-200 ${
              active
                ? 'border-[#2563EB] text-[#2563EB]'
                : 'border-transparent text-[#334155] hover:text-[#0F172A]'
            }`}
          >
            <Icon className="w-[17px] h-[17px]" strokeWidth={1.8} />
            {label}
          </button>
        );
      })}
    </div>
  );
}
