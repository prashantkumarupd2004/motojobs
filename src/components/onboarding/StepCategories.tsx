'use client';

import { LayoutGrid } from 'lucide-react';
import { JOB_CATEGORIES } from '@/lib/automotive';
import { Field } from '@/components/form';
import ChipSelect from './ChipSelect';
import SectionTitle from './SectionTitle';
import type { StepProps } from './wizard-state';

const OPTIONS = JOB_CATEGORIES.map((c) => ({
  value: c.id,
  label: c.label,
  blurb: c.blurb,
}));

export default function StepCategories({ state, patch, errors }: StepProps) {
  return (
    <section className="space-y-6 animate-fade-in">
      <SectionTitle icon={LayoutGrid} title="Choose your preferred job categories" />

      <Field
        label="Job categories"
        required
        error={errors.jobCategories}
        hint="Pick every area you would take a job in. More categories means more matches."
      >
        <ChipSelect
          options={OPTIONS}
          value={state.jobCategories}
          onChange={(jobCategories) => patch({ jobCategories })}
          max={6}
        />
      </Field>
    </section>
  );
}
