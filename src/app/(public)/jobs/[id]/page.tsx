import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { SITE_URL } from '@/lib/site';
import { parseSkills } from '@/lib/jobs';
import type { Job, Company, Recruiter } from '@/types';
import JobDetailClient from './JobDetailClient';

/* ── Type for the full hydrated job ─────────────────────────────────── */
type FullJob = Job & {
  company: (Company & { website?: string | null; headquarters?: string | null; linkedinUrl?: string | null }) | null;
  recruiter: (Recruiter & { user: { name: string; email: string } | null }) | null;
  _count: { applications: number };
};

/* ── Prisma fetch ─────────────────────────────────────────────────────── */
async function getJob(id: string): Promise<FullJob | null> {
  try {
    const raw = await prisma.job.findUnique({
      where: { id, status: 'APPROVED' },
      include: {
        company: true,
        recruiter: { include: { user: { select: { name: true, email: true } } } },
        _count: { select: { applications: true } },
      },
    });
    if (!raw) return null;

    // Bump views in background — don't await
    prisma.job.update({ where: { id }, data: { views: { increment: 1 } } }).catch(() => {});

    // Normalise Prisma nulls to match the Job interface (null → undefined)
    return {
      ...raw,
      companyId: raw.companyId ?? undefined,
      skills: parseSkills(raw.skills),
      requirements: raw.requirements ?? undefined,
      responsibilities: raw.responsibilities ?? undefined,
      category: raw.category ?? undefined,
      location: raw.location ?? undefined,
      minSalary: raw.minSalary ?? undefined,
      maxSalary: raw.maxSalary ?? undefined,
      experience: raw.experience ?? undefined,
      education: raw.education ?? undefined,
      deadline: raw.deadline ?? undefined,
    } as unknown as FullJob;
  } catch {
    return null;
  }
}

/* ── generateMetadata ─────────────────────────────────────────────────── */
export async function generateMetadata(
  { params }: { params: Promise<{ id: string }> }
): Promise<Metadata> {
  const { id } = await params;
  const job = await getJob(id);
  if (!job) return { title: 'Job Not Found' };

  const company = job.company?.name ?? 'a leading automobile company';
  const location = job.location ?? 'India';
  const title = `${job.title} at ${company} — ${location} | MotoJobs.in`;

  const rawDesc = job.description
    ? job.description.slice(0, 155).replace(/\s+/g, ' ').trim()
    : null;
  const description = rawDesc
    ? rawDesc + '…'
    : `Apply for ${job.title} at ${company} in ${location}.${job.experience ? ` ${job.experience} experience required.` : ''} Automotive job on MotoJobs.in.`;

  return {
    title,
    description,
    keywords: [
      job.title,
      company,
      location,
      'automobile job',
      'automotive job India',
      ...(job.skills ?? []),
      job.category ? job.category : '',
    ]
      .filter(Boolean)
      .join(', '),
    alternates: { canonical: `/jobs/${id}` },
    openGraph: {
      title,
      description,
      url: `/jobs/${id}`,
      type: 'article',
      images: job.company?.logo
        ? [{ url: job.company.logo, alt: `${company} logo` }]
        : [{ url: '/logo-motojobs.png', width: 1341, height: 268, alt: 'MotoJobs.in' }],
    },
    twitter: { card: 'summary_large_image', title, description },
  };
}

/* ── JobPosting JSON-LD ───────────────────────────────────────────────── */
function JobPostingJsonLd({ job }: { job: FullJob }) {
  const company = job.company?.name ?? 'MotoJobs Employer';
  const location = job.location ?? 'India';

  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'JobPosting',
    title: job.title,
    description: job.description
      ? job.description
      : `${job.title} position at ${company}.`,
    datePosted: new Date(job.createdAt).toISOString().split('T')[0],
    employmentType: job.jobType
      ? job.jobType.toUpperCase().replace(/[- ]/g, '_')
      : 'FULL_TIME',
    jobLocation: {
      '@type': 'Place',
      address: {
        '@type': 'PostalAddress',
        addressLocality: location,
        addressCountry: 'IN',
      },
    },
    hiringOrganization: {
      '@type': 'Organization',
      name: company,
      ...(job.company?.logo ? { logo: job.company.logo } : {}),
    },
    url: `${SITE_URL}/jobs/${job.id}`,
    identifier: {
      '@type': 'PropertyValue',
      name: 'MotoJobs.in',
      value: job.id,
    },
  };

  if (job.minSalary || job.maxSalary) {
    schema.baseSalary = {
      '@type': 'MonetaryAmount',
      currency: job.currency,
      value: {
        '@type': 'QuantitativeValue',
        ...(job.minSalary ? { minValue: job.minSalary } : {}),
        ...(job.maxSalary ? { maxValue: job.maxSalary } : {}),
        unitText: 'YEAR',
      },
    };
  }

  if (job.deadline) {
    schema.validThrough = new Date(job.deadline).toISOString().split('T')[0];
  }

  if (job.experience) {
    schema.experienceRequirements = job.experience;
  }

  if (job.education) {
    schema.educationRequirements = {
      '@type': 'EducationalOccupationalCredential',
      credentialCategory: job.education,
    };
  }

  if (Array.isArray(job.skills) && job.skills.length > 0) {
    schema.skills = job.skills.join(', ');
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

/* ── BreadcrumbList JSON-LD ───────────────────────────────────────────── */
function BreadcrumbJsonLd({ jobTitle, jobId }: { jobTitle: string; jobId: string }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Jobs', item: `${SITE_URL}/jobs` },
      { '@type': 'ListItem', position: 3, name: jobTitle, item: `${SITE_URL}/jobs/${jobId}` },
    ],
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

/* ── Page (Server Component) ──────────────────────────────────────────── */
export default async function JobDetailPage(
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const job = await getJob(id);
  if (!job) notFound();

  return (
    <>
      <JobPostingJsonLd job={job} />
      <BreadcrumbJsonLd jobTitle={job.title} jobId={job.id} />
      {/* Client shell handles Apply/Save interactions */}
      <JobDetailClient job={job} />
    </>
  );
}
