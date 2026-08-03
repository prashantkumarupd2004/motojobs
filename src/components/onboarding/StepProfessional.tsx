'use client';

import { Briefcase } from 'lucide-react';
import {
  CANDIDATE_TYPES,
  EXPERIENCE_BANDS,
  INDUSTRIES,
  NOTICE_PERIODS,
  PASSING_YEARS,
  QUALIFICATIONS,
} from '@/lib/automotive';
import { Field, RadioCards, SearchableSelect, TextInput, YesNo } from '@/components/form';
import SectionTitle from './SectionTitle';
import type { StepProps } from './wizard-state';

export default function StepProfessional({ state, patch, errors }: StepProps) {
  const isFresher = state.candidateType === 'FRESHER';
  const isNonAutomobile = state.candidateType === 'NON_AUTOMOBILE';

  return (
    <section className="space-y-6 animate-fade-in">
      <SectionTitle icon={Briefcase} title="Professional details" />

      <Field label="Are you a fresher or experienced?" required error={errors.candidateType}>
        <RadioCards
          name="candidateType"
          value={state.candidateType}
          onChange={(candidateType) => patch({ candidateType })}
          options={CANDIDATE_TYPES.map((t) => ({
            value: t.id,
            label: t.label,
            blurb: t.blurb,
          }))}
        />
      </Field>

      <Field label="Highest qualification" required error={errors.qualification} htmlFor="qualification">
        <SearchableSelect
          id="qualification"
          options={QUALIFICATIONS}
          value={state.qualification}
          onChange={(qualification) => patch({ qualification })}
          placeholder="Select your qualification"
          error={!!errors.qualification}
        />
      </Field>

      {isFresher && (
        <>
          <div className="grid sm:grid-cols-2 gap-5">
            <Field label="Passing year" required error={errors.passingYear} htmlFor="passingYear">
              <SearchableSelect
                id="passingYear"
                options={PASSING_YEARS.map(String)}
                value={state.passingYear}
                onChange={(passingYear) => patch({ passingYear })}
                placeholder="Select year"
                error={!!errors.passingYear}
              />
            </Field>

            <Field label="College / Institute" required error={errors.college} htmlFor="college">
              <TextInput
                id="college"
                value={state.college}
                onChange={(e) => patch({ college: e.target.value })}
                placeholder="Government Polytechnic, Pune"
                error={!!errors.college}
              />
            </Field>
          </div>

          <Field
            label="Internship or apprenticeship"
            htmlFor="internship"
            hint="Where did you train, and on what?"
          >
            <TextInput
              id="internship"
              value={state.internship}
              onChange={(e) => patch({ internship: e.target.value })}
              placeholder="6-month apprenticeship at Maruti service centre"
            />
          </Field>

          <Field
            label="Certifications"
            htmlFor="certifications"
            hint="OEM training, EV safety, diagnostics tools — anything relevant."
          >
            <TextInput
              id="certifications"
              value={state.certifications}
              onChange={(e) => patch({ certifications: e.target.value })}
              placeholder="Maruti L2 Technician, EV HV Safety Level 1"
            />
          </Field>
        </>
      )}

      {state.candidateType && !isFresher && (
        <>
          <Field label="Total experience" required error={errors.totalExperience} htmlFor="totalExperience">
            <SearchableSelect
              id="totalExperience"
              options={EXPERIENCE_BANDS}
              value={state.totalExperience}
              onChange={(totalExperience) => patch({ totalExperience })}
              placeholder="Select experience"
              error={!!errors.totalExperience}
            />
          </Field>

          {isNonAutomobile && (
            <Field label="Current industry" required error={errors.industry} htmlFor="industry">
              <SearchableSelect
                id="industry"
                options={INDUSTRIES}
                value={state.industry}
                onChange={(industry) => patch({ industry })}
                placeholder="Select your industry"
                error={!!errors.industry}
              />
            </Field>
          )}

          <div className="grid sm:grid-cols-2 gap-5">
            <Field label="Current company" required error={errors.currentCompany} htmlFor="currentCompany">
              <TextInput
                id="currentCompany"
                value={state.currentCompany}
                onChange={(e) => patch({ currentCompany: e.target.value })}
                placeholder="Company name"
                error={!!errors.currentCompany}
              />
            </Field>

            <Field
              label="Current designation"
              required
              error={errors.currentDesignation}
              htmlFor="currentDesignation"
            >
              <TextInput
                id="currentDesignation"
                value={state.currentDesignation}
                onChange={(e) => patch({ currentDesignation: e.target.value })}
                placeholder="Service Advisor"
                error={!!errors.currentDesignation}
              />
            </Field>
          </div>

          <div className="grid sm:grid-cols-2 gap-5">
            <Field label="Current salary" htmlFor="currentSalary" hint="Annual CTC in ₹">
              <TextInput
                id="currentSalary"
                type="number"
                min={0}
                value={state.currentSalary}
                onChange={(e) => patch({ currentSalary: e.target.value })}
                placeholder="360000"
              />
            </Field>

            <Field label="Notice period" required error={errors.noticePeriodBand} htmlFor="notice">
              <SearchableSelect
                id="notice"
                options={NOTICE_PERIODS}
                value={state.noticePeriodBand}
                onChange={(noticePeriodBand) => patch({ noticePeriodBand })}
                placeholder="Select notice period"
                error={!!errors.noticePeriodBand}
              />
            </Field>
          </div>
        </>
      )}

      <div className="grid sm:grid-cols-2 gap-5 pt-1">
        <Field label="Do you have a driving licence?" required>
          <YesNo
            name="drivingLicense"
            value={state.drivingLicense}
            onChange={(drivingLicense) => patch({ drivingLicense })}
          />
        </Field>

        <Field label="Do you own a vehicle?" required>
          <YesNo
            name="ownVehicle"
            value={state.ownVehicle}
            onChange={(ownVehicle) => patch({ ownVehicle })}
          />
        </Field>
      </div>
    </section>
  );
}
