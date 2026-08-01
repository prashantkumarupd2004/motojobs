import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Automobile Companies Hiring in India — Motojobs.in',
  description:
    'Browse dealerships, service centres, workshops, OEMs and EV companies hiring across India. See open roles, locations and company profiles.',
};

export default function CompaniesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
