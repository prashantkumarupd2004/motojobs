import type { Metadata } from 'next';
import { Suspense } from 'react';

const TITLE = 'Automobile Jobs in India — Dealership, Workshop & EV Roles';
const DESCRIPTION =
  'Search current automobile jobs across India — Sales Consultant, Service Advisor, Technician, Workshop Manager and more at dealerships, service centres, OEMs and EV companies.';

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: '/jobs' },
  openGraph: { title: TITLE, description: DESCRIPTION, url: '/jobs' },
};

export default function JobsLayout({ children }: { children: React.ReactNode }) {
  return <Suspense>{children}</Suspense>;
}
