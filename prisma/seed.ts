import { PrismaClient } from "@prisma/client";
import {
  AUTOMOTIVE_SKILLS,
  CITIES_BY_STATE,
  COMPANY_TYPES,
  EXPERIENCE_LEVELS,
  INDIAN_STATES,
  JOB_CATEGORIES,
  JOB_TYPES,
  QUALIFICATIONS,
} from "../src/lib/automotive.ts";

const prisma = new PrismaClient();

/**
 * Reference data the app expects to exist: the plan catalogue, the three system
 * roles and the permission matrix. Written as upserts so it is safe to re-run
 * against a database that already has traffic.
 *
 * Plan limits mirror src/app/(public)/pricing/page.tsx — if one changes, change
 * both, or an employer will be sold a quota the code does not grant.
 */

const PLANS = [
  {
    code: "STARTER",
    name: "Starter",
    description: "For single-outlet workshops testing the waters.",
    pricePaise: 0,
    interval: "MONTHLY",
    jobPostLimit: 1,
    resumeViewLimit: 0,
    features: [
      "1 active job post",
      "Up to 30 applications per role",
      "Company profile page",
      "Email support",
    ],
    sortOrder: 1,
  },
  {
    code: "GROWTH",
    name: "Growth",
    description: "For dealerships hiring across multiple outlets.",
    pricePaise: 499_900,
    interval: "MONTHLY",
    jobPostLimit: 10,
    resumeViewLimit: 500,
    features: [
      "10 active job posts",
      "Unlimited applications",
      "Resume database access",
      "ATS pipeline board",
      "Verified company badge",
      "Priority email & phone support",
    ],
    sortOrder: 2,
  },
  {
    code: "ENTERPRISE",
    name: "Enterprise",
    description: "For OEMs and dealer groups hiring at scale.",
    pricePaise: 0,
    interval: "MONTHLY",
    // null means unlimited.
    jobPostLimit: null,
    resumeViewLimit: null,
    features: [
      "Unlimited job posts",
      "Bulk hiring campaigns",
      "AI candidate screening",
      "Dedicated account manager",
      "Custom onboarding & training",
    ],
    sortOrder: 3,
  },
];

const PERMISSIONS = [
  { key: "job:approve", label: "Approve or reject jobs", category: "Jobs" },
  { key: "job:delete", label: "Delete any job", category: "Jobs" },
  { key: "job:post", label: "Post jobs", category: "Jobs" },
  { key: "company:verify", label: "Review company documents", category: "Companies" },
  { key: "user:suspend", label: "Suspend or reactivate users", category: "Users" },
  { key: "user:view", label: "View all users", category: "Users" },
  { key: "candidate:search", label: "Search the resume database", category: "Candidates" },
  { key: "application:manage", label: "Manage applications", category: "Applications" },
  { key: "application:apply", label: "Apply to jobs", category: "Applications" },
  { key: "blog:manage", label: "Write and publish posts", category: "Content" },
  { key: "payment:view", label: "View payments and subscriptions", category: "Billing" },
  { key: "ticket:manage", label: "Handle support tickets", category: "Support" },
];

const ROLES = [
  {
    name: "ADMIN",
    label: "Super Admin",
    description: "Full access to every part of the platform.",
    permissions: PERMISSIONS.map((p) => p.key),
  },
  {
    name: "RECRUITER",
    label: "Employer",
    description: "Posts jobs and manages applicants for one company.",
    permissions: ["job:post", "candidate:search", "application:manage"],
  },
  {
    name: "CANDIDATE",
    label: "Job Seeker",
    description: "Applies to jobs and manages their own profile.",
    permissions: ["application:apply"],
  },
];

/**
 * The admin-editable taxonomy is seeded from the constants in
 * src/lib/automotive.ts, which stay the compile-time fallback. Upserts only
 * touch `label`/`group`, so an admin's own additions and reorderings survive a
 * re-run — only the built-in rows are refreshed.
 */
const TAXONOMY: Array<{
  kind: string;
  value: string;
  label: string;
  group?: string;
  blurb?: string;
}> = [
  ...JOB_CATEGORIES.map((c) => ({
    kind: "JOB_CATEGORY",
    value: c.id,
    label: c.label,
    blurb: c.blurb,
  })),
  ...COMPANY_TYPES.map((t) => ({ kind: "INDUSTRY", value: t, label: t })),
  ...EXPERIENCE_LEVELS.map((l) => ({ kind: "EXPERIENCE_LEVEL", value: l, label: l })),
  ...JOB_TYPES.map((t) => ({ kind: "EMPLOYMENT_TYPE", value: t, label: t })),
  ...AUTOMOTIVE_SKILLS.map((s) => ({
    kind: "SKILL",
    value: s.name,
    label: s.name,
    group: s.category,
  })),
  ...QUALIFICATIONS.map((q) => ({ kind: "QUALIFICATION", value: q, label: q })),
];

/** Default copy for the marketing pages, so the CMS editor is never blank. */
const CMS_PAGES = [
  {
    key: "HOME",
    title: "Homepage",
    blocks: {
      heroTitle: "India's automobile industry hires here",
      heroSubtitle:
        "Dealerships, workshops, OEMs and EV companies post roles for technicians, advisors and sales staff across the country.",
      heroImage: "",
      primaryCtaLabel: "Find jobs",
      primaryCtaHref: "/jobs",
      secondaryCtaLabel: "Post a job",
      secondaryCtaHref: "/register?role=recruiter",
    },
  },
  {
    key: "ABOUT",
    title: "About Us",
    blocks: {
      body: "Motojobs.in is a job portal built only for India's automobile sector — dealerships, workshops, OEMs, EV companies, fleet operators and the people who keep them running.",
    },
  },
  {
    key: "CONTACT",
    title: "Contact Us",
    blocks: {
      body: "Questions about a job, an application or your company profile? Send us a message and we will reply within one working day.",
      email: "support@motojobs.in",
      phone: "",
      address: "",
    },
  },
  { key: "PRIVACY", title: "Privacy Policy", blocks: { body: "" } },
  { key: "TERMS", title: "Terms & Conditions", blocks: { body: "" } },
  {
    key: "FAQ",
    title: "FAQ",
    blocks: {
      items: [
        {
          q: "Is Motojobs.in free for job seekers?",
          a: "Yes. Creating a profile, applying to jobs and messaging employers are all free.",
        },
        {
          q: "What does it cost to post a job?",
          a: "Posting is currently free for every employer while we grow.",
        },
      ],
    },
  },
  {
    key: "FOOTER",
    title: "Footer",
    blocks: {
      tagline: "India's dedicated automobile industry job portal.",
      copyright: "Motojobs.in",
    },
  },
];

const SITE_SETTINGS = [
  // BRANDING
  { key: "site.name", label: "Website name", value: "Motojobs.in", group: "BRANDING", sortOrder: 1 },
  { key: "site.tagline", label: "Tagline", value: "India's Automobile Job Portal", group: "BRANDING", sortOrder: 2 },
  { key: "site.logo", label: "Logo", value: "", group: "BRANDING", inputType: "IMAGE", sortOrder: 3 },
  { key: "site.favicon", label: "Favicon", value: "", group: "BRANDING", inputType: "IMAGE", sortOrder: 4 },

  // CONTACT
  { key: "contact.email", label: "Support email", value: "support@motojobs.in", group: "CONTACT", inputType: "EMAIL", sortOrder: 1 },
  { key: "contact.phone", label: "Phone number", value: "", group: "CONTACT", sortOrder: 2 },
  { key: "contact.address", label: "Office address", value: "", group: "CONTACT", inputType: "TEXTAREA", sortOrder: 3 },

  // SOCIAL
  { key: "social.linkedin", label: "LinkedIn", value: "", group: "SOCIAL", inputType: "URL", sortOrder: 1 },
  { key: "social.facebook", label: "Facebook", value: "", group: "SOCIAL", inputType: "URL", sortOrder: 2 },
  { key: "social.instagram", label: "Instagram", value: "", group: "SOCIAL", inputType: "URL", sortOrder: 3 },
  { key: "social.youtube", label: "YouTube", value: "", group: "SOCIAL", inputType: "URL", sortOrder: 4 },
  { key: "social.twitter", label: "X (Twitter)", value: "", group: "SOCIAL", inputType: "URL", sortOrder: 5 },

  // SEO
  { key: "seo.title", label: "Default meta title", value: "Motojobs.in — Automobile Industry Jobs in India", group: "SEO", sortOrder: 1 },
  { key: "seo.description", label: "Default meta description", value: "Find automobile jobs across India — technicians, service advisors, sales executives, EV specialists and more.", group: "SEO", inputType: "TEXTAREA", sortOrder: 2 },
  { key: "seo.robots", label: "robots.txt additions", value: "", group: "SEO", inputType: "TEXTAREA", hint: "Appended to the generated robots.txt.", sortOrder: 3 },

  // ANALYTICS
  { key: "analytics.gaId", label: "Google Analytics ID", value: "", group: "ANALYTICS", hint: "e.g. G-XXXXXXXXXX", sortOrder: 1 },
  { key: "analytics.gtmId", label: "Google Tag Manager ID", value: "", group: "ANALYTICS", hint: "e.g. GTM-XXXXXXX", sortOrder: 2 },

  // EMAIL
  { key: "email.fromName", label: "From name", value: "Motojobs.in", group: "EMAIL", sortOrder: 1 },
  { key: "email.fromAddress", label: "From address", value: "noreply@motojobs.in", group: "EMAIL", inputType: "EMAIL", sortOrder: 2 },
  { key: "email.replyTo", label: "Reply-to address", value: "support@motojobs.in", group: "EMAIL", inputType: "EMAIL", sortOrder: 3 },
];

/**
 * Template bodies mirror what src/lib/email.ts already sends. The library keeps
 * its hard-coded copy as the fallback, so an admin editing a template cannot
 * break signup mail — a missing or inactive row just means the default is used.
 */
const EMAIL_TEMPLATES = [
  {
    key: "WELCOME",
    name: "Welcome email",
    subject: "Welcome to Motojobs.in",
    bodyHtml:
      "<p>Hi {{name}},</p><p>Your Motojobs.in account is ready. Complete your profile so employers across India's automobile sector can find you.</p>",
    bodyText:
      "Hi {{name}},\n\nYour Motojobs.in account is ready. Complete your profile so employers can find you.",
    variables: ["name", "email"],
  },
  {
    key: "OTP",
    name: "Verification code",
    subject: "Your Motojobs.in verification code",
    bodyHtml: "<p>Your code is <strong>{{code}}</strong>. It expires in {{minutes}} minutes.</p>",
    bodyText: "Your code is {{code}}. It expires in {{minutes}} minutes.",
    variables: ["code", "minutes"],
  },
  {
    key: "INTERVIEW",
    name: "Interview scheduled",
    subject: "Interview scheduled — {{jobTitle}}",
    bodyHtml:
      "<p>Hi {{name}},</p><p>{{companyName}} has scheduled your interview for <strong>{{jobTitle}}</strong> on {{scheduledAt}}.</p>",
    bodyText:
      "Hi {{name}},\n\n{{companyName}} has scheduled your interview for {{jobTitle}} on {{scheduledAt}}.",
    variables: ["name", "companyName", "jobTitle", "scheduledAt"],
  },
  {
    key: "PASSWORD_RESET",
    name: "Password reset",
    subject: "Reset your Motojobs.in password",
    bodyHtml: "<p>Use code <strong>{{code}}</strong> to set a new password. It expires in {{minutes}} minutes.</p>",
    bodyText: "Use code {{code}} to set a new password. It expires in {{minutes}} minutes.",
    variables: ["code", "minutes"],
  },
  {
    key: "CONTACT",
    name: "Contact form receipt",
    subject: "We received your message",
    bodyHtml: "<p>Hi {{name}},</p><p>Thanks for getting in touch. We reply within one working day.</p>",
    bodyText: "Hi {{name}},\n\nThanks for getting in touch. We reply within one working day.",
    variables: ["name", "subject"],
  },
];

async function main() {
  for (const { features, ...plan } of PLANS) {
    await prisma.plan.upsert({
      where: { code: plan.code },
      update: { ...plan, features: JSON.stringify(features) },
      create: { ...plan, features: JSON.stringify(features) },
    });
  }
  console.log(`Seeded ${PLANS.length} plans`);

  for (const permission of PERMISSIONS) {
    await prisma.permission.upsert({
      where: { key: permission.key },
      update: { label: permission.label, category: permission.category },
      create: permission,
    });
  }
  console.log(`Seeded ${PERMISSIONS.length} permissions`);

  for (const { permissions, ...role } of ROLES) {
    const saved = await prisma.role.upsert({
      where: { name: role.name },
      update: { label: role.label, description: role.description },
      create: { ...role, isSystem: true },
    });

    // Replaced wholesale so a permission removed from the list above is also
    // revoked here, rather than lingering from an earlier run.
    await prisma.rolePermission.deleteMany({ where: { roleId: saved.id } });
    const rows = await prisma.permission.findMany({
      where: { key: { in: permissions } },
      select: { id: true },
    });
    await prisma.rolePermission.createMany({
      data: rows.map((p) => ({ roleId: saved.id, permissionId: p.id })),
    });
    console.log(`  ${role.name}: ${rows.length} permissions`);
  }

  // Every existing company needs a plan, or quota checks have nothing to read.
  const starter = await prisma.plan.findUniqueOrThrow({ where: { code: "STARTER" } });
  const companies = await prisma.company.findMany({
    where: { subscriptions: { none: {} } },
    select: { id: true },
  });
  for (const company of companies) {
    await prisma.subscription.create({
      data: { companyId: company.id, planId: starter.id },
    });
  }
  console.log(`Backfilled ${companies.length} companies onto Starter`);

  // Admin-editable taxonomy. `sortOrder` is set on create only, so an admin's
  // reordering is not undone by the next seed run.
  for (const [i, entry] of TAXONOMY.entries()) {
    await prisma.taxonomy.upsert({
      where: { kind_value: { kind: entry.kind, value: entry.value } },
      update: {
        label: entry.label,
        group: entry.group ?? null,
        blurb: entry.blurb ?? null,
      },
      create: { ...entry, sortOrder: i },
    });
  }
  console.log(`Seeded ${TAXONOMY.length} taxonomy entries`);

  let cityCount = 0;
  for (const [index, name] of INDIAN_STATES.entries()) {
    const state = await prisma.state.upsert({
      where: { name },
      update: {},
      create: { name, sortOrder: index },
    });
    for (const [cityIndex, city] of (CITIES_BY_STATE[name] ?? []).entries()) {
      await prisma.city.upsert({
        where: { stateId_name: { stateId: state.id, name: city } },
        update: {},
        create: { stateId: state.id, name: city, sortOrder: cityIndex },
      });
      cityCount++;
    }
  }
  console.log(`Seeded ${INDIAN_STATES.length} states and ${cityCount} cities`);

  // CMS copy is created but never updated: overwriting would discard whatever
  // the admin has since written.
  for (const page of CMS_PAGES) {
    await prisma.cmsPage.upsert({
      where: { key: page.key },
      update: {},
      create: { ...page, blocks: JSON.stringify(page.blocks) },
    });
  }
  console.log(`Seeded ${CMS_PAGES.length} CMS pages`);

  // Same reasoning: only the descriptive metadata is refreshed, never `value`.
  for (const setting of SITE_SETTINGS) {
    await prisma.siteSetting.upsert({
      where: { key: setting.key },
      update: {
        label: setting.label,
        group: setting.group,
        inputType: setting.inputType ?? "TEXT",
        hint: setting.hint ?? null,
        sortOrder: setting.sortOrder,
      },
      create: {
        ...setting,
        inputType: setting.inputType ?? "TEXT",
        hint: setting.hint ?? null,
      },
    });
  }
  console.log(`Seeded ${SITE_SETTINGS.length} site settings`);

  for (const template of EMAIL_TEMPLATES) {
    await prisma.emailTemplate.upsert({
      where: { key: template.key },
      update: {},
      create: { ...template, variables: JSON.stringify(template.variables) },
    });
  }
  console.log(`Seeded ${EMAIL_TEMPLATES.length} email templates`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
