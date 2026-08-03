'use client';

import { Wrench } from 'lucide-react';
import { AUTOMOTIVE_SKILLS, OEM_BRANDS, SKILL_GROUPS } from '@/lib/automotive';
import { Field, MultiSelect } from '@/components/form';
import SectionTitle from './SectionTitle';
import type { StepProps } from './wizard-state';

const SKILLS_BY_GROUP = SKILL_GROUPS.map((group) => ({
  group,
  skills: AUTOMOTIVE_SKILLS.filter((s) => s.category === group).map((s) => s.name),
})).filter((g) => g.skills.length > 0);

export default function StepSkills({ state, patch, errors }: StepProps) {
  const toggle = (name: string) => {
    const selected = state.skills.includes(name);
    if (selected) {
      patch({ skills: state.skills.filter((s) => s !== name) });
    } else if (state.skills.length < 20) {
      patch({ skills: [...state.skills, name] });
    }
  };

  return (
    <section className="space-y-6 animate-fade-in">
      <SectionTitle icon={Wrench} title="Select your skills" />

      <Field
        label="Brands you have worked with"
        htmlFor="brandExperience"
        hint="Leave blank if you have not worked on a specific brand yet."
      >
        <MultiSelect
          id="brandExperience"
          options={OEM_BRANDS}
          value={state.brandExperience}
          onChange={(brandExperience) => patch({ brandExperience })}
          placeholder="Select brands"
          error={!!errors.brandExperience}
        />
      </Field>

      <Field
        label="Technical and professional skills"
        required
        error={errors.skills}
        hint={`${state.skills.length} of 20 selected. Recruiters search on these.`}
      >
        <div className="space-y-5">
          {SKILLS_BY_GROUP.map(({ group, skills }) => (
            <div key={group}>
              <p className="text-[11.5px] font-bold text-ink-faint uppercase tracking-[0.1em] mb-2.5">
                {group}
              </p>
              <div className="flex flex-wrap gap-2">
                {skills.map((name) => {
                  const selected = state.skills.includes(name);
                  const blocked = !selected && state.skills.length >= 20;
                  return (
                    <button
                      key={name}
                      type="button"
                      role="checkbox"
                      aria-checked={selected}
                      disabled={blocked}
                      onClick={() => toggle(name)}
                      className={`rounded-full border px-3.5 py-2 text-[13px] font-medium transition-all duration-300 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] ${
                        blocked
                          ? 'border-line bg-canvas text-ink-faint opacity-45 cursor-not-allowed'
                          : selected
                            ? 'border-brand-600 bg-brand-600 text-white shadow-[0_2px_8px_rgba(15,76,129,0.20)]'
                            : 'border-line bg-white text-ink-soft hover:border-brand-600 hover:text-brand-700'
                      }`}
                    >
                      {name}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </Field>
    </section>
  );
}
