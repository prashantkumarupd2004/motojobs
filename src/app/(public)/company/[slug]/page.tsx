import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  BadgeCheck,
  Briefcase,
  Building2,
  Calendar,
  Globe,
  IndianRupee,
  Link2,
  Mail,
  MapPin,
  Phone,
  Users,
} from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { salaryRangeLabel } from '@/lib/automotive';
import { SITE_URL } from '@/lib/site';

async function getCompany(slug: string) {
  return prisma.company.findUnique({
    where: { slug },
    include: {
      jobs: {
        where: { status: 'APPROVED' },
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          title: true,
          location: true,
          jobType: true,
          workMode: true,
          experience: true,
          minSalary: true,
          maxSalary: true,
          createdAt: true,
        },
      },
    },
  });
}

export async function generateMetadata(
  props: PageProps<'/company/[slug]'>
): Promise<Metadata> {
  const { slug } = await props.params;
  const company = await prisma.company.findUnique({
    where: { slug },
    select: { name: true, description: true, city: true, state: true, industry: true, logo: true },
  });

  if (!company) return { title: 'Company not found' };

  const where = [company.city, company.state].filter(Boolean).join(', ');
  const description =
    company.description?.slice(0, 155).trim() ??
    `Open automobile roles at ${company.name}${where ? ` in ${where}` : ''}. View jobs, company info and career opportunities.`;

  const title = `${company.name} — Jobs & Company Profile | MotoJobs.in`;

  return {
    title,
    description,
    keywords: [
      `${company.name} jobs`,
      `${company.name} careers`,
      `${company.name} recruitment`,
      where ? `automobile jobs ${where}` : '',
      company.industry ?? '',
      'automobile company jobs India',
    ].filter(Boolean).join(', '),
    alternates: { canonical: `/company/${slug}` },
    openGraph: {
      title,
      description,
      url: `/company/${slug}`,
      type: 'profile',
      images: company.logo
        ? [{ url: company.logo, alt: `${company.name} logo` }]
        : [{ url: '/logo-motojobs.png', width: 1341, height: 268, alt: 'MotoJobs.in' }],
    },
    twitter: { card: 'summary_large_image', title, description },
  };
}

const STAT = 'flex items-center gap-2 text-[13.5px] text-ink-muted font-medium';

export default async function CompanyPage(props: PageProps<'/company/[slug]'>) {
  const { slug } = await props.params;
  const company = await getCompany(slug);

  if (!company || !company.isProfileComplete) notFound();

  const where = [company.city, company.state].filter(Boolean).join(', ');

  /* ── Structured data ── */
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Companies', item: `${SITE_URL}/companies` },
      { '@type': 'ListItem', position: 3, name: company.name, item: `${SITE_URL}/company/${slug}` },
    ],
  };

  const orgSchema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: company.name,
    url: company.website ?? `${SITE_URL}/company/${slug}`,
    ...(company.logo ? { logo: company.logo } : {}),
    ...(company.description ? { description: company.description } : {}),
    ...(where ? { address: { '@type': 'PostalAddress', addressLocality: where, addressCountry: 'IN' } } : {}),
    ...(company.foundedYear ? { foundingDate: String(company.foundedYear) } : {}),
    ...(company.linkedinUrl ? { sameAs: [company.linkedinUrl] } : {}),
    numberOfEmployees: company.size ?? undefined,
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }} />
    <div className="max-w-5xl mx-auto px-5 sm:px-8 lg:px-10 py-12 lg:py-16">
      <nav className="text-[13px] font-medium text-ink-faint mb-7">
        <Link href="/companies" className="hover:text-brand-700 transition-colors">
          Companies
        </Link>
        <span className="mx-2">/</span>
        <span className="text-ink-muted">{company.name}</span>
      </nav>

      <header className="surface sheen p-7 sm:p-9">
        <div className="flex flex-col sm:flex-row sm:items-start gap-6">
          <div className="w-20 h-20 shrink-0 rounded-[20px] bg-canvas border border-line flex items-center justify-center overflow-hidden">
            {company.logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={company.logo}
                alt={`${company.name} logo`}
                className="w-full h-full object-contain"
              />
            ) : (
              <Building2 className="w-8 h-8 text-ink-faint" />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <h1 className="text-[28px] sm:text-[32px] font-extrabold text-ink tracking-[-0.035em] leading-[1.15] flex items-center gap-2 flex-wrap">
              {company.name}
              {company.isVerified && (
                <span className="inline-flex items-center gap-1.5 bg-brand-50 border border-brand-200 text-brand-700 text-[12.5px] font-semibold px-2.5 py-1 rounded-full">
                  <BadgeCheck className="w-3.5 h-3.5" />
                  Verified
                </span>
              )}
            </h1>

            <div className="flex flex-wrap items-center gap-x-5 gap-y-2.5 mt-4">
              {company.industry && (
                <span className={STAT}>
                  <Briefcase className="w-4 h-4 text-ink-faint" />
                  {company.industry}
                </span>
              )}
              {where && (
                <span className={STAT}>
                  <MapPin className="w-4 h-4 text-ink-faint" />
                  {where}
                </span>
              )}
              {company.size && (
                <span className={STAT}>
                  <Users className="w-4 h-4 text-ink-faint" />
                  {company.size} employees
                </span>
              )}
              {company.foundedYear && (
                <span className={STAT}>
                  <Calendar className="w-4 h-4 text-ink-faint" />
                  Founded {company.foundedYear}
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3 mt-6">
              {company.website && (
                <a
                  href={company.website}
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  className="press inline-flex items-center gap-2 bg-white text-ink border border-line hover:border-brand-200 hover:bg-brand-50/60 hover:text-brand-700 px-4 py-2.5 rounded-[13px] text-[13.5px] font-semibold transition-all duration-300"
                >
                  <Globe className="w-4 h-4" />
                  Website
                </a>
              )}
              {company.linkedinUrl && (
                <a
                  href={company.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  className="press inline-flex items-center gap-2 bg-white text-ink border border-line hover:border-brand-200 hover:bg-brand-50/60 hover:text-brand-700 px-4 py-2.5 rounded-[13px] text-[13.5px] font-semibold transition-all duration-300"
                >
                  <Link2 className="w-4 h-4" />
                  LinkedIn
                </a>
              )}
            </div>
          </div>
        </div>
      </header>

      {company.description && (
        <section className="surface sheen p-7 sm:p-9 mt-6">
          <h2 className="text-[17px] font-bold text-ink tracking-[-0.025em] mb-4">
            About {company.name}
          </h2>
          <p className="text-ink-muted text-[15px] leading-[1.8] whitespace-pre-line">
            {company.description}
          </p>
        </section>
      )}

      <section className="mt-6">
        <h2 className="text-[20px] font-bold text-ink tracking-[-0.03em] mb-5">
          Open roles
          <span className="text-ink-faint font-semibold text-[15px] ml-2">
            ({company.jobs.length})
          </span>
        </h2>

        {company.jobs.length === 0 ? (
          <div className="surface p-10 text-center">
            <Briefcase className="w-9 h-9 text-ink-faint mx-auto" />
            <p className="text-ink-muted text-[14.5px] mt-3">
              No open roles right now. Check back soon.
            </p>
            <Link
              href="/jobs"
              className="inline-block mt-5 text-[14px] font-semibold text-brand-600 hover:text-brand-700"
            >
              Browse all automobile jobs
            </Link>
          </div>
        ) : (
          <ul className="space-y-3.5">
            {company.jobs.map((job) => (
              <li key={job.id}>
                <Link
                  href={`/jobs/${job.id}`}
                  className="surface sheen p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 hover:-translate-y-0.5 hover:shadow-e4 transition-all duration-400 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)]"
                >
                  <div className="min-w-0">
                    <h3 className="text-[16px] font-bold text-ink tracking-[-0.02em]">
                      {job.title}
                    </h3>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-3 text-[12.5px] text-ink-faint font-medium">
                      {job.location && (
                        <span className="inline-flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5" />
                          {job.location}
                        </span>
                      )}
                      <span className="inline-flex items-center gap-1.5">
                        <Briefcase className="w-3.5 h-3.5" />
                        {job.jobType}
                      </span>
                      {job.experience && <span>{job.experience}</span>}
                      {(job.minSalary || job.maxSalary) && (
                        <span className="inline-flex items-center gap-1.5 text-ignite-600">
                          <IndianRupee className="w-3.5 h-3.5" />
                          {salaryRangeLabel(job.minSalary, job.maxSalary)}
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="shrink-0 text-[13.5px] font-semibold text-brand-600">
                    View role →
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      {(company.phone || company.email || company.addressLine) && (
        <section className="surface sheen p-7 sm:p-9 mt-6">
          <h2 className="text-[17px] font-bold text-ink tracking-[-0.025em] mb-5">
            Get in touch
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {company.phone && (
              <a href={`tel:${company.phone}`} className={`${STAT} hover:text-brand-700`}>
                <Phone className="w-4 h-4 text-ink-faint" />
                {company.phone}
              </a>
            )}
            {company.email && (
              <a href={`mailto:${company.email}`} className={`${STAT} hover:text-brand-700`}>
                <Mail className="w-4 h-4 text-ink-faint" />
                {company.email}
              </a>
            )}
            {company.addressLine && (
              <span className={`${STAT} sm:col-span-2 items-start`}>
                <MapPin className="w-4 h-4 text-ink-faint mt-0.5 shrink-0" />
                <span>
                  {company.addressLine}
                  {where && `, ${where}`}
                  {company.pincode && ` — ${company.pincode}`}
                </span>
              </span>
            )}
          </div>
        </section>
      )}
    </div>
    </>
  );
}
