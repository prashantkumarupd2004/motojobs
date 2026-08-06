'use client';

import { useMemo } from 'react';
import { Target } from 'lucide-react';
import {
  CITIES_BY_STATE,
  INDIAN_STATES,
  INTERESTED_ROLES,
  LANGUAGES,
  OEM_BRANDS,
} from '@/lib/automotive';
import { useTaxonomy } from '@/hooks/useTaxonomy';
import { Field, MultiSelect, SearchableSelect, TextInput } from '@/components/form';
import SectionTitle from './SectionTitle';
import type { StepProps } from './wizard-state';

export default function StepPreferences({ state, patch, errors }: StepProps) {
  const jobTypes = useTaxonomy('EMPLOYMENT_TYPE');
  const cities = useMemo(
    () => CITIES_BY_STATE[state.preferredState] ?? [],
    [state.preferredState]
  );

  return (
    <section className="space-y-6 animate-fade-in">
      <SectionTitle icon={Target} title="Job preferences" />

      <Field
        label="Preferred job role"
        required
        error={errors.interestedRole}
        htmlFor="role"
        hint="Search across sales, service, spare parts, body shop, EV and more."
      >
        <SearchableSelect
          id="role"
          options={INTERESTED_ROLES}
          value={state.interestedRole}
          onChange={(interestedRole) => patch({ interestedRole })}
          placeholder="Search for a role"
          error={!!errors.interestedRole}
        />
      </Field>

      <Field label="Preferred brand" error={errors.preferredBrand} htmlFor="preferredBrand" hint="Optional.">
        <SearchableSelect
          id="preferredBrand"
          options={OEM_BRANDS}
          value={state.preferredBrand}
          onChange={(preferredBrand) => patch({ preferredBrand })}
          placeholder="Any brand"
          error={!!errors.preferredBrand}
        />
      </Field>

      <div className="grid sm:grid-cols-2 gap-5">
        <Field label="Preferred state" required error={errors.preferredState} htmlFor="preferredState">
          <SearchableSelect
            id="preferredState"
            options={INDIAN_STATES}
            value={state.preferredState}
            onChange={(preferredState) => patch({ preferredState, preferredCity: '' })}
            placeholder="Select a state"
            error={!!errors.preferredState}
          />
        </Field>

        <Field
          label="Preferred city"
          required
          error={errors.preferredCity}
          htmlFor="preferredCity"
          hint={state.preferredState ? undefined : 'Select a state first.'}
        >
          <SearchableSelect
            id="preferredCity"
            options={cities}
            value={state.preferredCity}
            onChange={(preferredCity) => patch({ preferredCity })}
            placeholder="Select a city"
            allowCustom
            disabled={!state.preferredState}
            error={!!errors.preferredCity}
          />
        </Field>
      </div>

      <div className="grid sm:grid-cols-2 gap-5">
        <Field label="Expected salary" htmlFor="expectedSalary" hint="Annual CTC in ₹">
          <TextInput
            id="expectedSalary"
            type="number"
            min={0}
            value={state.expectedSalary}
            onChange={(e) => patch({ expectedSalary: e.target.value })}
            placeholder="480000"
          />
        </Field>

        <Field label="Employment type" required error={errors.employmentType} htmlFor="employmentType">
          <SearchableSelect
            id="employmentType"
            options={jobTypes.map((t) => t.label)}
            value={state.employmentType}
            onChange={(employmentType) => patch({ employmentType })}
            placeholder="Select type"
            error={!!errors.employmentType}
          />
        </Field>
      </div>

      <Field
        label="Languages known"
        required
        error={errors.languages}
        htmlFor="languages"
        hint="Field and showroom roles often need a specific local language."
      >
        <MultiSelect
          id="languages"
          options={LANGUAGES}
          value={state.languages}
          onChange={(languages) => patch({ languages })}
          placeholder="Select languages"
          max={8}
          error={!!errors.languages}
        />
      </Field>

      <Field label="Referral code" htmlFor="referral" hint="Optional.">
        <TextInput
          id="referral"
          value={state.referralCode}
          onChange={(e) => patch({ referralCode: e.target.value })}
          placeholder="MOTO1234"
        />
      </Field>

      <div>
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={state.acceptTerms}
            onChange={(e) => patch({ acceptTerms: e.target.checked })}
            className="mt-0.5 w-4 h-4 rounded border-line cursor-pointer accent-brand-600"
          />
          <span className="text-[13px] text-ink-muted leading-[1.6]">
            I confirm these details are accurate and accept the{' '}
            <a href="/terms" className="font-semibold text-brand-600 hover:text-brand-700">
              Terms &amp; Conditions
            </a>
            .
          </span>
        </label>
        {errors.acceptTerms && (
          <p className="mt-2 text-[12.5px] font-medium text-critical" role="alert">
            {errors.acceptTerms}
          </p>
        )}
      </div>
    </section>
  );
}
