import { PrismaClient } from "@prisma/client";

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
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
