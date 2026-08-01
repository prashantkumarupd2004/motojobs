import { z } from "zod";
import {
  AUTO_HUB_CITIES,
  CANDIDATE_TYPES,
  EXPERIENCE_BANDS,
  INDUSTRIES,
  INTERESTED_ROLES,
  LANGUAGES,
  NOTICE_PERIODS,
  OEM_BRANDS,
  PASSING_YEARS,
  QUALIFICATIONS,
} from "@/lib/automotive";

/**
 * Shared by the wizard (client-side step gating) and the API route (authoritative
 * check). Keeping one schema means a field can never be enforced in one and not
 * the other.
 */

const candidateTypeIds = CANDIDATE_TYPES.map((t) => t.id) as [string, ...string[]];

const oneOf = (values: readonly string[], message: string) =>
  z.string().trim().refine((v) => values.includes(v), { message });

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((v) => (v ? v : undefined));

const salary = z
  .number({ message: "Enter a valid amount" })
  .int()
  .min(0)
  .max(100_000_000)
  .optional();

export const onboardingSchema = z
  .object({
    candidateType: z.enum(candidateTypeIds, { message: "Choose your experience level" }),

    dateOfBirth: z
      .string()
      .trim()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Use the date picker")
      .optional(),
    gender: z.enum(["Male", "Female", "Other", "Prefer not to say"]).optional(),

    interestedRole: oneOf(INTERESTED_ROLES, "Select a role from the list"),
    currentCity: z.string().trim().min(2, "Enter your current city").max(80),
    preferredLocations: z
      .array(z.string().trim().max(80))
      .min(1, "Pick at least one preferred location")
      .max(5, "Pick up to 5 locations"),
    qualification: oneOf(QUALIFICATIONS, "Select your highest qualification"),

    // Fresher branch
    passingYear: z
      .number()
      .int()
      .refine((y) => PASSING_YEARS.includes(y), { message: "Select a valid year" })
      .optional(),
    college: optionalText(140),
    internship: optionalText(500),
    certifications: optionalText(500),

    // Experienced branches
    totalExperience: oneOf(EXPERIENCE_BANDS, "Select your total experience").optional(),
    currentCompany: optionalText(140),
    currentDesignation: optionalText(140),
    currentSalary: salary,
    expectedSalary: salary,
    noticePeriodBand: oneOf(NOTICE_PERIODS, "Select your notice period").optional(),
    brandExperience: z.array(oneOf(OEM_BRANDS, "Unknown brand")).max(28).optional(),
    industry: oneOf(INDUSTRIES, "Select your industry").optional(),

    resumeUrl: z
      .string()
      .trim()
      .regex(/^\/uploads\/[\w.-]+$/, "Upload your resume again")
      .optional(),
    resumeName: optionalText(160),
    profileImage: z
      .string()
      .trim()
      .regex(/^\/uploads\/[\w.-]+$/, "Upload your photo again")
      .optional(),

    drivingLicense: z.boolean(),
    ownVehicle: z.boolean(),
    languages: z
      .array(oneOf(LANGUAGES, "Unknown language"))
      .min(1, "Select at least one language")
      .max(8),
    referralCode: optionalText(40),
    acceptTerms: z
      .boolean()
      .refine((v) => v, { message: "Accept the Terms & Conditions to continue" }),
  })
  .superRefine((data, ctx) => {
    const require = (field: keyof typeof data, message: string) => {
      const v = data[field];
      if (v === undefined || v === "" || (Array.isArray(v) && v.length === 0)) {
        ctx.addIssue({ code: "custom", path: [field], message });
      }
    };

    if (data.candidateType === "FRESHER") {
      require("passingYear", "Select your passing year");
      require("college", "Enter your college or institute");
      return;
    }

    // Both experienced branches share the employment block.
    require("totalExperience", "Select your total experience");
    require("currentCompany", "Enter your current or last company");
    require("currentDesignation", "Enter your current or last designation");
    require("noticePeriodBand", "Select your notice period");

    if (data.candidateType === "AUTOMOBILE") {
      require("brandExperience", "Select at least one brand you have worked with");
    }

    if (data.candidateType === "NON_AUTOMOBILE") {
      require("industry", "Select the industry you currently work in");
    }
  });

export type OnboardingInput = z.infer<typeof onboardingSchema>;

/** Cities offered in the dropdown; free text is still permitted. */
export const CITY_OPTIONS = AUTO_HUB_CITIES;
