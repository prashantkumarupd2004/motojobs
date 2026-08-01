import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact Motojobs.in — Support for Candidates & Employers',
  description:
    'Get in touch with the Motojobs.in team about hiring plans, account issues or reporting a job posting. We reply within one working day.',
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
