import { z } from "zod";
import {
  COMPANY_DOCUMENT_TYPES,
  COMPANY_SIZES,
  EMPLOYER_TYPES,
  GSTIN_PATTERN,
  INDIAN_STATES,
} from "@/lib/automotive";

/**
 * Shared by the company profile form and its API route, mirroring the candidate
 * onboarding arrangement: one schema, so nothing is enforced in only one place.
 */

const oneOf = (values: readonly string[], message: string) =>
  z
    .string()
    .trim()
    .refine((v) => values.includes(v), { message })
    .optional();

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((v) => (v ? v : undefined));

export const companyProfileSchema = z.object({
  name: z.string().trim().min(2, "Enter your company name").max(140),
  industry: oneOf(EMPLOYER_TYPES, "Select your business type"),
  size: oneOf(COMPANY_SIZES, "Select your company size"),
  description: optionalText(2000),
  foundedYear: z
    .number()
    .int()
    .min(1900, "Enter a valid year")
    .max(2027, "Enter a valid year")
    .optional(),
  website: z
    .string()
    .trim()
    .url("Enter a full URL, including https://")
    .max(200)
    .optional()
    .or(z.literal("").transform(() => undefined)),
  linkedinUrl: z
    .string()
    .trim()
    .url("Enter a full URL, including https://")
    .max(200)
    .optional()
    .or(z.literal("").transform(() => undefined)),
  phone: z
    .string()
    .trim()
    .regex(/^[+\d][\d\s-]{7,19}$/, "Enter a valid phone number")
    .optional()
    .or(z.literal("").transform(() => undefined)),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Enter a valid email")
    .max(160)
    .optional()
    .or(z.literal("").transform(() => undefined)),
  gstNumber: z
    .string()
    .trim()
    .toUpperCase()
    .regex(GSTIN_PATTERN, "Enter a valid 15-character GSTIN")
    .optional()
    .or(z.literal("").transform(() => undefined)),
  addressLine: optionalText(240),
  city: optionalText(80),
  state: oneOf(INDIAN_STATES, "Select your state"),
  pincode: z
    .string()
    .trim()
    .regex(/^[1-9][0-9]{5}$/, "Enter a valid 6-digit PIN code")
    .optional()
    .or(z.literal("").transform(() => undefined)),
  logo: z
    .string()
    .trim()
    .regex(/^\/uploads\/[\w.-]+$/, "Upload your logo again")
    .optional(),
  designation: optionalText(120),
  hrName: z.string().trim().min(2, "Enter the HR contact name").max(120).optional(),
});

export type CompanyProfileInput = z.infer<typeof companyProfileSchema>;

/**
 * The URL is re-checked here even though it came from our own upload route:
 * the client could post any string, and the value is later rendered as a link.
 */
export const companyDocumentSchema = z.object({
  type: z
    .string()
    .trim()
    .refine((v) => COMPANY_DOCUMENT_TYPES.some((d) => d.id === v), {
      message: "Select a document type",
    }),
  fileUrl: z
    .string()
    .trim()
    .regex(/^\/uploads\/[\w.-]+$/, "Upload the document again"),
  fileName: z.string().trim().max(160).optional(),
});

export const documentReviewSchema = z.object({
  id: z.string().trim().min(1),
  status: z.enum(["APPROVED", "REJECTED"]),
  adminNotes: z.string().trim().max(1000).optional(),
});

/** Fields a company must fill before its profile counts as complete. */
const REQUIRED_FOR_COMPLETE = [
  "name",
  "industry",
  "description",
  "city",
  "state",
] as const;

export function isCompanyComplete(c: Record<string, unknown>): boolean {
  return REQUIRED_FOR_COMPLETE.every((k) => {
    const v = c[k];
    return typeof v === "string" && v.trim().length > 0;
  });
}

/**
 * A company counts as verified once it has proof of registration plus proof of
 * identity. GST and incorporation are alternatives — many small workshops are
 * below the GST threshold and can only supply one of the two.
 *
 * Recomputed from the approved set on every change, so revoking or deleting a
 * document takes the badge away instead of leaving it stranded.
 */
const REGISTRATION_PROOF = ["GST_CERTIFICATE", "INCORPORATION"];
const IDENTITY_PROOF = ["PAN", "ADDRESS_PROOF"];

export function qualifiesForVerification(approvedTypes: string[]): boolean {
  return (
    approvedTypes.some((t) => REGISTRATION_PROOF.includes(t)) &&
    approvedTypes.some((t) => IDENTITY_PROOF.includes(t))
  );
}

/**
 * Slugs are stored, not derived at read time, so a later rename cannot silently
 * break links that have already been shared or indexed.
 */
export function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}
