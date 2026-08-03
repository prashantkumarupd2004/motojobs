'use client';

import { useMemo } from 'react';
import { IdCard, UserCircle2 } from 'lucide-react';
import {
  CITIES_BY_STATE,
  INDIAN_STATES,
  MAX_IMAGE_BYTES,
  MAX_RESUME_BYTES,
  PASSING_YEARS,
} from '@/lib/automotive';
import { Field, FileUpload, SearchableSelect, TextInput } from '@/components/form';
import SectionTitle from './SectionTitle';
import type { StepProps } from './wizard-state';

const GENDERS = ['Male', 'Female', 'Other', 'Prefer not to say'] as const;

/** Youngest permitted DOB: candidates must be at least 14 to hold an apprenticeship. */
const MAX_DOB = `${PASSING_YEARS[0] - 14}-12-31`;

export default function StepPersonal({ state, patch, errors }: StepProps) {
  const cities = useMemo(
    () => CITIES_BY_STATE[state.currentState] ?? [],
    [state.currentState]
  );

  return (
    <section className="space-y-6 animate-fade-in">
      <SectionTitle icon={UserCircle2} title="Personal information" />

      <div className="grid sm:grid-cols-2 gap-5">
        <Field label="Full name" required error={errors.fullName} htmlFor="fullName">
          <TextInput
            id="fullName"
            value={state.fullName}
            onChange={(e) => patch({ fullName: e.target.value })}
            placeholder="Prashant Kumar"
            error={!!errors.fullName}
          />
        </Field>

        <Field label="Mobile number" required error={errors.phone} htmlFor="phone">
          <TextInput
            id="phone"
            type="tel"
            inputMode="numeric"
            maxLength={10}
            value={state.phone}
            onChange={(e) => patch({ phone: e.target.value.replace(/\D/g, '') })}
            placeholder="9876543210"
            error={!!errors.phone}
          />
        </Field>
      </div>

      <Field label="Email address" htmlFor="email" hint="Verified at sign-up. Contact support to change it.">
        <TextInput id="email" type="email" value={state.email} disabled readOnly />
      </Field>

      <Field label="Profile photo" hint="JPG, PNG or WEBP. Up to 2MB.">
        <FileUpload
          accept=".jpg,.jpeg,.png,.webp"
          maxBytes={MAX_IMAGE_BYTES}
          value={state.photo?.url}
          fileName={state.photo?.name}
          onChange={(photo) => patch({ photo })}
          label="Upload a photo"
          hint="A clear headshot works best"
        />
      </Field>

      <div className="grid sm:grid-cols-2 gap-5">
        <Field label="Date of birth" htmlFor="dob" error={errors.dateOfBirth}>
          <TextInput
            id="dob"
            type="date"
            value={state.dateOfBirth}
            max={MAX_DOB}
            onChange={(e) => patch({ dateOfBirth: e.target.value })}
            error={!!errors.dateOfBirth}
          />
        </Field>

        <Field label="Gender" htmlFor="gender">
          <SearchableSelect
            id="gender"
            options={GENDERS}
            value={state.gender}
            onChange={(gender) => patch({ gender })}
            placeholder="Select"
          />
        </Field>
      </div>

      <div className="grid sm:grid-cols-2 gap-5">
        <Field label="Current state" required error={errors.currentState} htmlFor="state">
          <SearchableSelect
            id="state"
            options={INDIAN_STATES}
            value={state.currentState}
            // Cities are state-scoped, so a state change invalidates the city.
            onChange={(currentState) => patch({ currentState, currentCity: '' })}
            placeholder="Select your state"
            error={!!errors.currentState}
          />
        </Field>

        <Field
          label="Current city"
          required
          error={errors.currentCity}
          htmlFor="city"
          hint={state.currentState ? 'Not listed? Type your city and pick the custom option.' : 'Select a state first.'}
        >
          <SearchableSelect
            id="city"
            options={cities}
            value={state.currentCity}
            onChange={(currentCity) => patch({ currentCity })}
            placeholder="Search for your city"
            allowCustom
            disabled={!state.currentState}
            error={!!errors.currentCity}
          />
        </Field>
      </div>

      <div className="pt-1">
        <SectionTitle icon={IdCard} title="PAN details" />
        <p className="text-[13px] text-ink-muted leading-[1.6] mt-2 mb-5">
          Optional, and only used for payroll once you are hired. Your documents are stored
          privately and are never shown to employers.
        </p>

        <div className="grid sm:grid-cols-2 gap-5">
          <Field label="PAN number" error={errors.panNumber} htmlFor="pan" hint="Format: ABCDE1234F">
            <TextInput
              id="pan"
              value={state.panNumber}
              maxLength={10}
              onChange={(e) => patch({ panNumber: e.target.value.toUpperCase() })}
              placeholder="ABCDE1234F"
              error={!!errors.panNumber}
            />
          </Field>

          <Field label="Upload PAN card" hint="PDF or image. Up to 5MB.">
            <FileUpload
              accept=".pdf,.jpg,.jpeg,.png,.webp"
              maxBytes={MAX_RESUME_BYTES}
              value={state.panCard?.url}
              fileName={state.panCard?.name}
              onChange={(panCard) => patch({ panCard })}
              label="Upload PAN card"
              hint="Drag and drop, or click to browse"
            />
          </Field>
        </div>
      </div>
    </section>
  );
}
