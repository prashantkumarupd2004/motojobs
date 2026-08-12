import type { Metadata } from 'next';
import { Suspense } from 'react';
import { SITE_URL } from '@/lib/site';

const TITLE = 'Automobile Jobs in India 2025 — Dealership, Workshop & EV Roles | MotoJobs.in';
const DESCRIPTION =
  'Search 500+ automobile jobs across India — Service Advisor, Sales Consultant, Technician, Workshop Manager, Parts Manager, BDE and more at car dealerships, two-wheeler showrooms, OEMs and EV companies.';

const KEYWORDS = [
  "automobile jobs 2025", "car dealership jobs India", "two wheeler jobs India",
  "service advisor vacancy", "automobile technician vacancy", "ITI automobile vacancy",
  "workshop manager vacancy", "sales executive automobile", "auto electrician vacancy",
  "automobile jobs near me", "EV technician jobs", "OEM jobs India",
  "freshers automobile jobs", "automobile part time jobs", "full time automobile jobs",
].join(', ');

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
    { '@type': 'ListItem', position: 2, name: 'Jobs', item: `${SITE_URL}/jobs` },
  ],
};

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  keywords: KEYWORDS,
  alternates: { canonical: '/jobs' },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: '/jobs',
    type: 'website',
    images: [{ url: '/logo-motojobs.png', width: 1341, height: 268, alt: 'MotoJobs.in Jobs' }],
  },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESCRIPTION },
};

export default function JobsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <Suspense>{children}</Suspense>
    </>
  );
}
