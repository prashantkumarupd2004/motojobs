import type { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import { salaryRangeLabel } from '@/lib/automotive';

// The job page itself is a client component that fetches over the API, so the
// crawler-visible title and description have to be produced here instead.
export async function generateMetadata(
  props: LayoutProps<'/jobs/[id]'>
): Promise<Metadata> {
  const { id } = await props.params;

  const job = await prisma.job
    .findFirst({
      where: { id, status: 'APPROVED' },
      select: {
        title: true,
        description: true,
        location: true,
        jobType: true,
        minSalary: true,
        maxSalary: true,
        company: { select: { name: true } },
      },
    })
    .catch(() => null);

  if (!job) return { title: 'Job not found', robots: { index: false, follow: true } };

  const at = job.company?.name ? ` at ${job.company.name}` : '';
  const where = job.location ? ` in ${job.location}` : '';
  const title = `${job.title}${at}${where}`;
  const description = `${job.jobType} — ${salaryRangeLabel(job.minSalary, job.maxSalary)}. ${
    job.description?.replace(/\s+/g, ' ').trim() ?? ''
  }`.slice(0, 300);

  return {
    title,
    description,
    alternates: { canonical: `/jobs/${id}` },
    openGraph: { title, description, url: `/jobs/${id}`, type: 'article' },
  };
}

export default function JobDetailLayout({ children }: { children: React.ReactNode }) {
  return children;
}
