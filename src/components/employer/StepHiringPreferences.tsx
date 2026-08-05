'use client';

import { Phone, User } from 'lucide-react';
import {
  EMPLOYER_COMPANY_SIZES,
  HIRING_CATEGORIES,
  HIRING_FREQUENCIES,
} from '@/lib/automotive';
import { Field, RadioCards, TextInput } from '@/components/form';
import ChipSelect from '@/components/onboarding/ChipSelect';
import type { EmployerStepProps } from './wizard-state';

const CATEGORY_OPTIONS = HIRING_CATEGORIES.map((c) => ({ value: c, label: c }));

const FREQUENCY_OPTIONS = HIRING_FREQUENCIES.map((f) => ({ value: f, label: f }));

const SIZE_OPTIONS = EMPLOYER_COMPANY_SIZES.map((s) => ({ value: s, label: s }));

export default function StepHiringPreferences({
  state,
  patch,
  errors,
}: EmployerStepProps) {
  return (
    <section className="space-y-7 animate-fade-in">
      <Field
        label="Hiring categories"
        required
        error={errors.hiringCategories}
        hint="Pick every role you recruit for — we use these to surface matching candidates."
      >
        <ChipSelect
          options={CATEGORY_OPTIONS}
          value={state.hiringCategories}
          onChange={(v) => patch({ hiringCategories: v })}
          columns={2}
        />
      </Field>

      <Field label="Hiring frequency" required error={errors.hiringFrequency}>
        <RadioCards
          name="hiringFrequency"
          options={FREQUENCY_OPTIONS}
          value={state.hiringFrequency}
          onChange={(v) => patch({ hiringFrequency: v })}
          columns={2}
        />
      </Field>

      <Field label="Company size" required error={errors.size}>
        <RadioCards
          name="companySize"
          options={SIZE_OPTIONS}
          value={state.size}
          onChange={(v) => patch({ size: v })}
          columns={2}
        />
      </Field>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <Field label="HR contact person" required error={errors.hrName}>
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-faint pointer-events-none z-10" />
            <TextInput
              value={state.hrName}
              onChange={(e) => patch({ hrName: e.target.value })}
              error={Boolean(errors.hrName)}
              placeholder="Rahul Sharma"
              className="pl-11"
            />
          </div>
        </Field>

        <Field label="HR contact number" required error={errors.hrPhone}>
          <div className="relative">
            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-faint pointer-events-none z-10" />
            <TextInput
              inputMode="numeric"
              maxLength={10}
              value={state.hrPhone}
              onChange={(e) => patch({ hrPhone: e.target.value.replace(/\D/g, '') })}
              error={Boolean(errors.hrPhone)}
              placeholder="9876543210"
              className="pl-11"
            />
          </div>
        </Field>
      </div>
    </section>
  );
}
