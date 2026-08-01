import { prisma } from "@/lib/prisma";

/**
 * Plan entitlements for an employer.
 *
 * Job usage is counted live from the jobs table rather than read from
 * Subscription.jobPostsUsed, because the pricing page promises that closing a
 * role "frees the slot immediately" — a monotonic counter cannot honour that.
 * The stored counter is kept for billing-period reporting only.
 *
 * While BILLING_ENABLED is false the platform is free for everyone: every
 * employer gets unlimited posts and full resume access regardless of the plan
 * on their subscription row. The plan catalogue, subscriptions and this whole
 * module keep working underneath, so turning billing on is a config change
 * rather than a rewrite.
 */

/** Set BILLING_ENABLED=true in the environment to start charging. */
export const BILLING_ENABLED = process.env.BILLING_ENABLED === "true";

/** Queued and live roles both occupy a slot; closed and rejected ones release it. */
const OCCUPIES_SLOT = ["PENDING", "APPROVED"];

const STARTER_FALLBACK = { code: "STARTER", name: "Starter", jobPostLimit: 1, resumeViewLimit: 0 };

export interface Entitlements {
  planCode: string;
  planName: string;
  /** null means unlimited. */
  jobPostLimit: number | null;
  resumeViewLimit: number | null;
  jobPostsUsed: number;
  canPostJob: boolean;
  canSearchResumes: boolean;
  /** False while the platform is free, so the UI can hide upgrade prompts. */
  billingEnabled: boolean;
}

/**
 * A recruiter with no company has no subscription to read, so they get Starter
 * limits — restrictive by default rather than unmetered.
 */
export async function getEntitlements(companyId: string | null): Promise<Entitlements> {
  if (!companyId) {
    return {
      planCode: STARTER_FALLBACK.code,
      planName: STARTER_FALLBACK.name,
      jobPostLimit: BILLING_ENABLED ? STARTER_FALLBACK.jobPostLimit : null,
      resumeViewLimit: BILLING_ENABLED ? STARTER_FALLBACK.resumeViewLimit : null,
      jobPostsUsed: 0,
      // A company profile is still required to post — that is a data
      // requirement, not a paywall, so it holds even while billing is off.
      canPostJob: false,
      canSearchResumes: !BILLING_ENABLED,
      billingEnabled: BILLING_ENABLED,
    };
  }

  const [subscription, jobPostsUsed] = await Promise.all([
    prisma.subscription.findFirst({
      where: { companyId, status: "ACTIVE" },
      orderBy: { startedAt: "desc" },
      include: { plan: true },
    }),
    prisma.job.count({
      where: { companyId, status: { in: OCCUPIES_SLOT } },
    }),
  ]);

  const plan = subscription?.plan ?? STARTER_FALLBACK;
  const jobPostLimit = BILLING_ENABLED ? plan.jobPostLimit ?? null : null;
  const resumeViewLimit = BILLING_ENABLED ? plan.resumeViewLimit ?? null : null;

  return {
    planCode: plan.code,
    planName: plan.name,
    jobPostLimit,
    resumeViewLimit,
    jobPostsUsed,
    canPostJob: jobPostLimit === null || jobPostsUsed < jobPostLimit,
    canSearchResumes: resumeViewLimit === null || resumeViewLimit > 0,
    billingEnabled: BILLING_ENABLED,
  };
}

/**
 * Gives a company the free plan so quota checks have something to read. Used on
 * company creation; the seed backfills companies that predate this.
 */
export async function ensureStarterSubscription(companyId: string) {
  const existing = await prisma.subscription.findFirst({ where: { companyId } });
  if (existing) return existing;

  const starter = await prisma.plan.findUnique({ where: { code: "STARTER" } });
  if (!starter) return null;

  return prisma.subscription.create({
    data: { companyId, planId: starter.id, status: "ACTIVE" },
  });
}
