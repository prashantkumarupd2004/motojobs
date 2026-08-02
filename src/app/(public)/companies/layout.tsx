import type { Metadata } from 'next';

const TITLE = 'Automobile Companies Hiring in India';
const DESCRIPTION =
  'Browse dealerships, service centres, workshops, OEMs and EV companies hiring across India. See open roles, locations and company profiles.';

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: '/companies' },
  openGraph: { title: TITLE, description: DESCRIPTION, url: '/companies' },
};

export default function CompaniesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
