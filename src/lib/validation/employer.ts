import { z } from "zod";
import {
  COMPANY_TYPES,
  EMPLOYER_COMPANY_SIZES,
  EMPLOYER_STEP_COMPLETION,
  GSTIN_PATTERN,
  HIRING_CATEGORIES,
  HIRING_FREQUENCIES,
  INDIAN_STATES,
  PAN_PATTERN,
} from "@/lib/automotive";

/**
 * Employer onboarding, shared by the wizard (client-side step gating) and the
 * API route (authoritative check) — the same arrangement the candidate wizard
 * uses, so a field can never be enforced in one place and not the other.
 *
 * Shapes are declared per step so `employerStepSchemas[i]` validates a single
 * step, while `employerOnboardingSchema` validates the whole payload on submit.
 */

const oneOf = (values: readonly string[], message: string) =>
  z.string().trim().refine((v) => values.includes(v), { message });

const optionalOneOf = (values: readonly string[], message: string) =>
  z
    .string()
    .trim()
    .refine((v) => v === "" || values.includes(v), { message })
    .optional()
    .transform((v) => (v ? v : undefined));

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((v) => (v ? v : undefined));

const optionalUrl = (message = "Enter a full URL, including https://") =>
  z
    .string()
    .trim()
    .max(300)
    .optional()
    .transform((v) => (v ? v : undefined))
    .refine((v) => v === undefined || z.string().url().safeParse(v).success, {
      message,
    });

const indianMobile = (message: string) =>
  z.string().trim().regex(/^[6-9]\d{9}$/, message);

/**
 * `/api/upload` returns `/api/files/<kind>/<userId>/<uuid>.<ext>` — the object
 * is private in S3 and streamed back through the authenticated read route.
 */
const uploadedImageUrl = z
  .string()
  .trim()
  .regex(/^\/api\/files\/images\/[\w-]+\/[\w.-]+$/, "Upload your logo again")
  .optional();

// Step 1 — Company information
const companyInfoShape = {
  logo: uploadedImageUrl,
  name: z.string().trim().min(2, "Enter your company name").max(140),
  companyType: oneOf(COMPANY_TYPES, "Select your company type"),
  description: optionalText(2000),
  website: optionalUrl(),
  gstNumber: z
    .string()
    .trim()
    .toUpperCase()
    .optional()
    .transform((v) => (v ? v : undefined))
    .refine((v) => v === undefined || GSTIN_PATTERN.test(v), {
      message: "Enter a valid 15-character GSTIN",
    }),
  panNumber: z
    .string()
    .trim()
    .toUpperCase()
    .optional()
    .transform((v) => (v ? v : undefined))
    .refine((v) => v === undefined || PAN_PATTERN.test(v), {
      message: "Enter a valid 10-character PAN",
    }),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Enter a valid company email")
    .max(160),
  phone: indianMobile("Enter a 10-digit company mobile number"),
};

// Step 2 — Company address
const companyAddressShape = {
  state: oneOf(INDIAN_STATES, "Select your state"),
  city: z.string().trim().min(2, "Enter your city").max(80),
  addressLine: z.string().trim().min(5, "Enter your complete address").max(240),
  pincode: z.string().trim().regex(/^[1-9][0-9]{5}$/, "Enter a valid 6-digit PIN code"),
  mapsUrl: optionalUrl("Paste a full Google Maps link"),
};

// Step 3 — Hiring preferences
const hiringPreferencesShape = {
  hiringCategories: z
    .array(oneOf(HIRING_CATEGORIES, "Unknown hiring category"))
    .min(1, "Pick at least one role you hire for")
    .max(HIRING_CATEGORIES.length),
  hiringFrequency: oneOf(HIRING_FREQUENCIES, "Select how often you hire"),
  size: oneOf(EMPLOYER_COMPANY_SIZES, "Select your company size"),
  hrName: z.string().trim().min(2, "Enter the HR contact name").max(120),
  hrPhone: indianMobile("Enter a 10-digit HR contact number"),
};

/**
 * Indexed by step so the wizard can gate one screen at a time. Step 0 is the
 * welcome screen and carries no fields.
 */
export const employerStepSchemas = [
  z.object({}),
  z.object(companyInfoShape),
  z.object(companyAddressShape),
  z.object(hiringPreferencesShape),
] as const;

export const employerOnboardingSchema = z.object({
  ...companyInfoShape,
  ...companyAddressShape,
  ...hiringPreferencesShape,
});

/**
 * Autosave payload. Every field is optional because a step is saved as soon as
 * the employer leaves it, half-filled or not — only the final POST is complete.
 */
export const employerDraftSchema = z
  .object({
    logo: uploadedImageUrl,
    name: optionalText(140),
    companyType: optionalOneOf(COMPANY_TYPES, "Select your company type"),
    description: optionalText(2000),
    website: optionalUrl(),
    gstNumber: optionalText(15).transform((v) => v?.toUpperCase()),
    panNumber: optionalText(10).transform((v) => v?.toUpperCase()),
    email: optionalText(160).transform((v) => v?.toLowerCase()),
    phone: optionalText(20),

    state: optionalOneOf(INDIAN_STATES, "Select your state"),
    city: optionalText(80),
    addressLine: optionalText(240),
    pincode: optionalText(6),
    mapsUrl: optionalUrl("Paste a full Google Maps link"),

    hiringCategories: z.array(z.string().trim()).max(HIRING_CATEGORIES.length).optional(),
    hiringFrequency: optionalOneOf(HIRING_FREQUENCIES, "Select how often you hire"),
    size: optionalOneOf(EMPLOYER_COMPANY_SIZES, "Select your company size"),
    hrName: optionalText(120),
    hrPhone: optionalText(20),
  })
  .partial();

export type EmployerOnboardingInput = z.infer<typeof employerOnboardingSchema>;
export type EmployerDraft = z.infer<typeof employerDraftSchema>;

export const EMPLOYER_LAST_STEP = EMPLOYER_STEP_COMPLETION.length - 1;
