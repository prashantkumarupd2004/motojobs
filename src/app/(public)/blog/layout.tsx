import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Career Advice for the Auto Trade | MotoJobs',
  description:
    'Interview prep, resume tips and hiring guides — written for people who work in dealerships, workshops, OEMs and EV companies across India.',
  alternates: { canonical: '/blog' },
  openGraph: {
    title: 'Career Advice for the Auto Trade | MotoJobs',
    description:
      'Interview prep, resume tips and hiring guides for the Indian automobile industry.',
    url: '/blog',
  },
};

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
