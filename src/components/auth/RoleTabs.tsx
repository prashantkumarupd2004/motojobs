'use client';
import { Building2, Users } from 'lucide-react';

export type Role = 'CANDIDATE' | 'RECRUITER';

interface RoleTabsProps {
  value: Role;
  onChange: (next: Role) => void;
}

const TABS = [
  { value: 'CANDIDATE', label: 'Job Seeker', Icon: Users },
  { value: 'RECRUITER', label: 'Employer',   Icon: Building2 },
] as const;

export default function RoleTabs({ value, onChange }: RoleTabsProps) {
  return (
    <div
      role="radiogroup"
      aria-label="Account type"
      className="grid grid-cols-2 gap-2 p-1 rounded-[12px] bg-[#F1F5F9]"
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
            className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-[10px] text-[13.5px] font-semibold transition-all duration-200 ${
              active
                ? 'bg-white text-[#2563EB] shadow-[0_1px_6px_rgba(15,23,42,0.10)] border border-[#E8EDF5]'
                : 'text-[#64748B] hover:text-[#0F172A]'
            }`}
            style={active ? {} : { background: 'transparent' }}
          >
            <Icon className={`w-[15px] h-[15px] ${active ? 'text-[#2563EB]' : 'text-[#94A3B8]'}`} strokeWidth={2} />
            {label}
          </button>
        );
      })}
    </div>
  );
}
