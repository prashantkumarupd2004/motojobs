'use client';

/**
 * Flat form state for the employer wizard. The page owns one of these; each
 * step receives it plus a patch callback, so a field only ever lives in one
 * place and the autosave payload is the state itself.
 */
export interface EmployerState {
  // Step 1 — company information
  logo: string;
  name: string;
  companyType: string;
  description: string;
  website: string;
  gstNumber: string;
  panNumber: string;
  email: string;
  phone: string;

  // Step 2 — company address
  state: string;
  city: string;
  addressLine: string;
  pincode: string;
  mapsUrl: string;

  // Step 3 — hiring preferences
  hiringCategories: string[];
  hiringFrequency: string;
  size: string;
  hrName: string;
  hrPhone: string;
}

export type EmployerPatch = (updates: Partial<EmployerState>) => void;
export type Errors = Record<string, string>;

export interface EmployerStepProps {
  state: EmployerState;
  patch: EmployerPatch;
  errors: Errors;
}

export const EMPLOYER_INITIAL_STATE: EmployerState = {
  logo: '',
  name: '',
  companyType: '',
  description: '',
  website: '',
  gstNumber: '',
  panNumber: '',
  email: '',
  phone: '',

  state: '',
  city: '',
  addressLine: '',
  pincode: '',
  mapsUrl: '',

  hiringCategories: [],
  hiringFrequency: '',
  size: '',
  hrName: '',
  hrPhone: '',
};

export const EMPLOYER_STEP_LABELS = [
  'Welcome',
  'Company',
  'Address',
  'Hiring',
] as const;

const text = (v: string) => (v.trim() ? v.trim() : undefined);

/** Only the fields a given step owns — what the PATCH autosave sends. */
export function employerStepPayload(
  step: number,
  s: EmployerState
): Record<string, unknown> {
  switch (step) {
    case 1:
      return {
        logo: text(s.logo),
        name: s.name.trim(),
        companyType: s.companyType,
        description: text(s.description),
        website: text(s.website),
        gstNumber: text(s.gstNumber),
        panNumber: text(s.panNumber),
        email: s.email.trim(),
        phone: s.phone.trim(),
      };
    case 2:
      return {
        state: s.state,
        city: s.city.trim(),
        addressLine: s.addressLine.trim(),
        pincode: s.pincode.trim(),
        mapsUrl: text(s.mapsUrl),
      };
    case 3:
      return {
        hiringCategories: s.hiringCategories,
        hiringFrequency: s.hiringFrequency,
        size: s.size,
        hrName: s.hrName.trim(),
        hrPhone: s.hrPhone.trim(),
      };
    default:
      return {};
  }
}

/** Every step's payload merged — the final POST body. */
export function employerFullPayload(s: EmployerState): Record<string, unknown> {
  return Object.assign(
    {},
    ...EMPLOYER_STEP_LABELS.map((_, i) => employerStepPayload(i, s))
  );
}
