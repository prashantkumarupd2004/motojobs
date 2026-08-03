'use client';

import { STEP_COMPLETION } from '@/lib/automotive';

/**
 * Flat form state for the whole wizard. The page owns one of these; each step
 * component receives it plus a patch callback, so a field only ever lives in
 * one place and the autosave payload is the state itself.
 */
export interface WizardState {
  // Step 1 — personal
  fullName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: string;
  currentState: string;
  currentCity: string;
  panNumber: string;
  panCard: FileRef | null;
  photo: FileRef | null;

  // Step 2 — professional
  candidateType: string;
  qualification: string;
  passingYear: string;
  college: string;
  internship: string;
  certifications: string;
  totalExperience: string;
  currentCompany: string;
  currentDesignation: string;
  currentSalary: string;
  noticePeriodBand: string;
  industry: string;
  drivingLicense: boolean | null;
  ownVehicle: boolean | null;

  // Step 3 — categories
  jobTitles: string[];

  // Step 4 — skills
  brandExperience: string[];
  skills: string[];

  // Step 5 — resume
  resume: FileRef | null;

  // Step 6 — preferences
  interestedRole: string;
  preferredBrand: string;
  preferredState: string;
  preferredCity: string;
  expectedSalary: string;
  employmentType: string;
  languages: string[];
  referralCode: string;
  acceptTerms: boolean;
}

export interface FileRef {
  url: string;
  name: string;
}

export type Patch = (updates: Partial<WizardState>) => void;
export type Errors = Record<string, string>;

export interface StepProps {
  state: WizardState;
  patch: Patch;
  errors: Errors;
}

export const INITIAL_STATE: WizardState = {
  fullName: '',
  email: '',
  phone: '',
  dateOfBirth: '',
  gender: '',
  currentState: '',
  currentCity: '',
  panNumber: '',
  panCard: null,
  photo: null,

  candidateType: '',
  qualification: '',
  passingYear: '',
  college: '',
  internship: '',
  certifications: '',
  totalExperience: '',
  currentCompany: '',
  currentDesignation: '',
  currentSalary: '',
  noticePeriodBand: '',
  industry: '',
  drivingLicense: null,
  ownVehicle: null,

  jobTitles: [],

  brandExperience: [],
  skills: [],

  resume: null,

  interestedRole: '',
  preferredBrand: '',
  preferredState: '',
  preferredCity: '',
  expectedSalary: '',
  employmentType: '',
  languages: [],
  referralCode: '',
  acceptTerms: false,
};

export const STEP_LABELS = [
  'Welcome',
  'Personal',
  'Professional',
  'Categories',
  'Skills',
  'Resume',
  'Preferences',
] as const;

export const LAST_STEP = STEP_LABELS.length - 1;

const num = (v: string) => (v.trim() ? Number(v) : undefined);
const text = (v: string) => (v.trim() ? v.trim() : undefined);

/** Only the fields a given step owns — what the PATCH autosave sends. */
export function stepPayload(step: number, s: WizardState): Record<string, unknown> {
  switch (step) {
    case 1:
      return {
        fullName: s.fullName.trim(),
        phone: s.phone.trim(),
        dateOfBirth: text(s.dateOfBirth),
        gender: text(s.gender),
        currentState: s.currentState,
        currentCity: s.currentCity.trim(),
        panNumber: text(s.panNumber),
        panCardUrl: s.panCard?.url,
        profileImage: s.photo?.url,
      };
    case 2:
      return {
        candidateType: s.candidateType,
        qualification: s.qualification,
        passingYear: num(s.passingYear),
        college: text(s.college),
        internship: text(s.internship),
        certifications: text(s.certifications),
        totalExperience: text(s.totalExperience),
        currentCompany: text(s.currentCompany),
        currentDesignation: text(s.currentDesignation),
        currentSalary: num(s.currentSalary),
        noticePeriodBand: text(s.noticePeriodBand),
        industry: text(s.industry),
        drivingLicense: s.drivingLicense ?? false,
        ownVehicle: s.ownVehicle ?? false,
      };
    case 3:
      return { jobTitles: s.jobTitles };
    case 4:
      return {
        brandExperience: s.brandExperience,
        skills: s.skills,
      };
    case 5:
      return { resumeUrl: s.resume?.url, resumeName: s.resume?.name };
    case 6:
      return {
        interestedRole: s.interestedRole,
        preferredBrand: text(s.preferredBrand),
        preferredState: s.preferredState,
        preferredCity: s.preferredCity.trim(),
        expectedSalary: num(s.expectedSalary),
        employmentType: s.employmentType,
        languages: s.languages,
        referralCode: text(s.referralCode),
        acceptTerms: s.acceptTerms,
      };
    default:
      return {};
  }
}

/** Every step's payload merged — the final POST body. */
export function fullPayload(s: WizardState): Record<string, unknown> {
  return Object.assign({}, ...STEP_LABELS.map((_, i) => stepPayload(i, s)));
}

export const completionAt = (step: number) => STEP_COMPLETION[step];
