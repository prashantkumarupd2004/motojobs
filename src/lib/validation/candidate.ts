import { z } from "zod";
import {
  AUTOMOTIVE_SKILLS,
  AUTO_HUB_CITIES,
  CANDIDATE_TYPES,
  EXPERIENCE_BANDS,
  INDIAN_STATES,
  INDUSTRIES,
  INTERESTED_ROLES,
  JOB_TITLES,
  JOB_TYPES,
  LANGUAGES,
  NOTICE_PERIODS,
  OEM_BRANDS,
  PAN_PATTERN,
  PASSING_YEARS,
  QUALIFICATIONS,
} from "@/lib/automotive";

/**
 * Shared by the wizard (client-side step gating) and the API route (authoritative
 * check). Keeping one schema means a field can never be enforced in one and not
 * the other.
 *
 * The shapes are declared per onboarding step so `stepSchemas[i]` can validate a
 * single step in isolation, while `onboardingSchema` validates the whole payload
 * on final submit.
 */

const candidateTypeIds = CANDIDATE_TYPES.map((t) => t.id) as [string, ...string[]];
const jobTitleNames = JOB_TITLES.map((t) => t.title);
const skillNames = AUTOMOTIVE_SKILLS.map((s) => s.name);

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

/**
 * `/api/upload` returns `/api/files/<kind>/<userId>/<uuid>.<ext>` — the object is
 * private in S3 and streamed back through the signed-read route.
 */
const uploadedFileUrl = (message: string) =>
  z
    .string()
    .trim()
    .regex(/^\/api\/files\/(resumes|images)\/[\w-]+\/[\w.-]+$/, message)
    .optional();

// Step 1 — Personal information
const personalShape = {
  fullName: z.string().trim().min(2, "Enter your full name").max(80),
  phone: z
    .string()
    .trim()
    .regex(/^[6-9]\d{9}$/, "Enter a 10-digit Indian mobile number"),
  dateOfBirth: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Use the date picker")
    .optional(),
  gender: z.enum(["Male", "Female", "Other", "Prefer not to say"]).optional(),
  currentState: oneOf(INDIAN_STATES, "Select your state"),
  currentCity: z.string().trim().min(2, "Enter your current city").max(80),
  panNumber: z
    .string()
    .trim()
    .toUpperCase()
    .regex(PAN_PATTERN, "PAN must look like ABCDE1234F")
    .optional()
    .or(z.literal("").transform(() => undefined)),
  panCardUrl: uploadedFileUrl("Upload your PAN card again"),
  profileImage: uploadedFileUrl("Upload your photo again"),
};

// Step 2 — Professional details
const professionalShape = {
  candidateType: z.enum(candidateTypeIds, { message: "Choose your experience level" }),
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
  noticePeriodBand: oneOf(NOTICE_PERIODS, "Select your notice period").optional(),
  industry: oneOf(INDUSTRIES, "Select your industry").optional(),

  drivingLicense: z.boolean(),
  ownVehicle: z.boolean(),
};

// Step 3 — Job titles the candidate wants
const categoriesShape = {
  jobTitles: z
    .array(oneOf(jobTitleNames, "Unknown job title"))
    .min(1, "Pick at least one job title")
    .max(8, "Pick up to 8 job titles"),
};

// Step 4 — Skills
const skillsShape = {
  brandExperience: z.array(oneOf(OEM_BRANDS, "Unknown brand")).max(28).optional(),
  skills: z
    .array(oneOf(skillNames, "Unknown skill"))
    .min(1, "Select at least one skill")
    .max(20, "Select up to 20 skills"),
};

// Step 5 — Resume
const resumeShape = {
  resumeUrl: uploadedFileUrl("Upload your resume again"),
  resumeName: optionalText(160),
};

// Step 6 — Job preferences
const preferencesShape = {
  interestedRole: oneOf(INTERESTED_ROLES, "Select a role from the list"),
  preferredBrand: oneOf(OEM_BRANDS, "Select a brand from the list").optional(),
  preferredState: oneOf(INDIAN_STATES, "Select your preferred state"),
  preferredCity: z.string().trim().min(2, "Select your preferred city").max(80),
  /**
   * Powers job matching. The wizard asks for one preferred city, so the API
   * seeds this from `preferredCity` when the client sends nothing.
   */
  preferredLocations: z.array(z.string().trim().max(80)).max(5, "Pick up to 5 locations").optional(),
  expectedSalary: salary,
  employmentType: oneOf(JOB_TYPES, "Select an employment type"),
  languages: z
    .array(oneOf(LANGUAGES, "Unknown language"))
    .min(1, "Select at least one language")
    .max(8),
  referralCode: optionalText(40),
  acceptTerms: z
    .boolean()
    .refine((v) => v, { message: "Accept the Terms & Conditions to continue" }),
};

/** Fresher/experienced branch requirements — used by step 2 and by final submit. */
function refineProfessional(
  data: { candidateType?: string } & Record<string, unknown>,
  ctx: z.RefinementCtx
) {
  const require = (field: string, message: string) => {
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

  require("totalExperience", "Select your total experience");
  require("currentCompany", "Enter your current or last company");
  require("currentDesignation", "Enter your current or last designation");
  require("noticePeriodBand", "Select your notice period");

  if (data.candidateType === "NON_AUTOMOBILE") {
    require("industry", "Select the industry you currently work in");
  }
}

/**
 * One schema per wizard step. Index 0 is the welcome screen, which collects
 * nothing — keeping it in the array means the index matches `STEP_COMPLETION`.
 */
export const stepSchemas = [
  z.object({}),
  z.object(personalShape),
  z.object(professionalShape).superRefine(refineProfessional),
  z.object(categoriesShape),
  z.object(skillsShape),
  z.object(resumeShape),
  z.object(preferencesShape),
] as const;

export const onboardingSchema = z
  .object({
    ...personalShape,
    ...professionalShape,
    ...categoriesShape,
    ...skillsShape,
    ...resumeShape,
    ...preferencesShape,
  })
  .superRefine((data, ctx) => {
    refineProfessional(data, ctx);
    if (data.candidateType === "AUTOMOBILE" && !data.brandExperience?.length) {
      ctx.addIssue({
        code: "custom",
        path: ["brandExperience"],
        message: "Select at least one brand you have worked with",
      });
    }
  });

export type OnboardingInput = z.infer<typeof onboardingSchema>;

/**
 * Per-step autosave. Every field is optional because a candidate may abandon
 * the wizard at any point; the authoritative completeness check is the full
 * `onboardingSchema` on final submit.
 */
export const onboardingDraftSchema = z
  .object({
    ...personalShape,
    ...professionalShape,
    ...categoriesShape,
    ...skillsShape,
    ...resumeShape,
    ...preferencesShape,
  })
  .partial();

export type OnboardingDraft = z.infer<typeof onboardingDraftSchema>;

/**
 * My Profile edits. Same field vocabulary as onboarding but every key is
 * optional, since each profile section saves on its own.
 */
export const profileUpdateSchema = z
  .object({
    ...personalShape,
    ...professionalShape,
    ...categoriesShape,
    ...skillsShape,
    ...resumeShape,
    ...preferencesShape,
    headline: optionalText(140),
    summary: optionalText(2000),
    isOpenToWork: z.boolean(),
  })
  .partial();

export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;

/** Cities offered in the dropdown; free text is still permitted. */
export const CITY_OPTIONS = AUTO_HUB_CITIES;
