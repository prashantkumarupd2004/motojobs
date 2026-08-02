import type { Metadata } from 'next';

const TITLE = 'Contact Us — Support for Candidates & Employers';
const DESCRIPTION =
  'Get in touch with the Motojobs.in team about hiring plans, account issues or reporting a job posting. We reply within one working day.';

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: '/contact' },
  openGraph: { title: TITLE, description: DESCRIPTION, url: '/contact' },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
