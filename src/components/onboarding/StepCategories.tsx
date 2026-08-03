'use client';

import { LayoutGrid } from 'lucide-react';
import { JOB_TITLES } from '@/lib/automotive';
import { Field } from '@/components/form';
import ChipSelect from './ChipSelect';
import SectionTitle from './SectionTitle';
import type { StepProps } from './wizard-state';

const OPTIONS = JOB_TITLES.map((t) => ({ value: t.title, label: t.title }));

export default function StepCategories({ state, patch, errors }: StepProps) {
  return (
    <section className="space-y-6 animate-fade-in">
      <SectionTitle icon={LayoutGrid} title="Choose your preferred job categories" />

      <Field
        label="Job categories"
        required
        error={errors.jobTitles}
        hint="Pick every role you would take. More choices means more matches."
      >
        <ChipSelect
          options={OPTIONS}
          value={state.jobTitles}
          onChange={(jobTitles) => patch({ jobTitles })}
          max={8}
          columns={3}
        />
      </Field>
    </section>
  );
}
