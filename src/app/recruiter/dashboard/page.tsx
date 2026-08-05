'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Bookmark,
  Briefcase,
  Building2,
  CalendarCheck,
  Filter,
  Loader2,
  PlusCircle,
  Search,
  Trophy,
  Users,
} from 'lucide-react';

interface Stats {
  activeJobs: number;
  totalApplications: number;
  shortlisted: number;
  interviewsScheduled: number;
  savedCandidates: number;
  totalHires: number;
}

interface Job {
  id: string;
  title: string;
  location: string | null;
  status: string;
  createdAt: string;
  _count?: { applications: number };
}

interface Application {
  id: string;
  status: string;
  appliedAt: string;
  candidate?: {
    headline: string | null;
    user?: { name: string; profileImage: string | null };
  };
  job?: { id: string; title: string };
}

interface Company {
  name: string;
  logo: string | null;
  profileCompletion: number;
  isVerified: boolean;
}

const STAT_CARDS = [
  {
    key: 'activeJobs',
    label: 'Active Jobs',
    icon: Briefcase,
    href: '/recruiter/manage-jobs',
    tone: 'bg-brand-50 border-brand-100 text-brand-600',
  },
  {
    key: 'totalApplications',
    label: 'Total Applications',
    icon: Users,
    href: '/recruiter/applications',
    tone: 'bg-informative-soft border-brand-100 text-brand-600',
  },
  {
    key: 'shortlisted',
    label: 'Shortlisted',
    icon: Filter,
    href: '/recruiter/applications?status=SHORTLISTED',
    tone: 'bg-caution-soft border-[#F3DBB4] text-[#9A5D00]',
  },
  {
    key: 'interviewsScheduled',
    label: 'Interviews Scheduled',
    icon: CalendarCheck,
    href: '/recruiter/interviews',
    tone: 'bg-brand-50 border-brand-100 text-brand-600',
  },
  {
    key: 'savedCandidates',
    label: 'Saved Candidates',
    icon: Bookmark,
    href: '/recruiter/saved-candidates',
    tone: 'bg-canvas border-line text-ink-soft',
  },
  {
    key: 'totalHires',
    label: 'Total Hires',
    icon: Trophy,
    href: '/recruiter/applications?status=HIRED',
    tone: 'bg-positive-soft border-[#BEE7D8] text-[#0A7A54]',
  },
] as const;

const QUICK_ACTIONS: Array<{
  href: string;
  icon: typeof PlusCircle;
  label: string;
  primary?: boolean;
}> = [
  { href: '/recruiter/post-job', icon: PlusCircle, label: 'Post New Job', primary: true },
  { href: '/recruiter/manage-jobs', icon: Briefcase, label: 'Manage Jobs' },
  { href: '/recruiter/candidate-search', icon: Search, label: 'Search Candidates' },
  { href: '/recruiter/applications', icon: Users, label: 'Applications' },
  { href: '/recruiter/company', icon: Building2, label: 'Company Profile' },
];

const STATUS_STYLES: Record<string, string> = {
  APPLIED: 'bg-informative-soft text-brand-700 border-brand-100',
  SCREENING: 'bg-caution-soft text-[#9A5D00] border-[#F3DBB4]',
  SHORTLISTED: 'bg-brand-50 text-brand-700 border-brand-100',
  INTERVIEW: 'bg-brand-50 text-brand-700 border-brand-100',
  OFFERED: 'bg-positive-soft text-[#0A7A54] border-[#BEE7D8]',
  HIRED: 'bg-positive-soft text-[#0A7A54] border-[#BEE7D8]',
  REJECTED: 'bg-critical-soft text-[#B32B2B] border-[#F3C9C9]',
};

const JOB_STATUS_STYLES: Record<string, string> = {
  APPROVED: 'bg-positive-soft text-[#0A7A54] border-[#BEE7D8]',
  PENDING: 'bg-caution-soft text-[#9A5D00] border-[#F3DBB4]',
  DRAFT: 'bg-canvas text-ink-muted border-line',
  CLOSED: 'bg-canvas text-ink-muted border-line',
  REJECTED: 'bg-critical-soft text-[#B32B2B] border-[#F3C9C9]',
};

export default function RecruiterDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/recruiter/stats')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (cancelled || !data) return;
        setStats(data.stats);
        setCompany(data.company);
        setJobs(data.recentJobs ?? []);
        setApplications(data.recentApplications ?? []);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-7 h-7 text-brand-600 animate-spin" />
      </div>
    );
  }

  const incomplete = company && company.profileCompletion < 100;

  return (
    <div className="space-y-7">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-[26px] sm:text-[28px] font-extrabold text-ink tracking-[-0.035em]">
            Dashboard
          </h1>
          <p className="text-ink-muted text-[14.5px] mt-1.5">
            Your hiring at a glance
          </p>
        </div>
        <Link
          href="/recruiter/post-job"
          className="sweep press inline-flex shrink-0 items-center justify-center gap-2 grad-brand text-white font-semibold px-6 py-3 rounded-[14px] text-[14px] shadow-brand hover:-translate-y-0.5 hover:shadow-e4 transition-all duration-300 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)]"
        >
          <PlusCircle className="w-4 h-4" /> Post New Job
        </Link>
      </div>

      {incomplete && (
        <Link
          href="/recruiter/onboarding"
          className="surface sheen lift flex flex-wrap items-center justify-between gap-4 p-5 group"
        >
          <div className="min-w-0">
            <p className="text-[14.5px] font-bold text-ink">Finish your company profile</p>
            <p className="text-[13px] text-ink-muted mt-1">
              You&apos;re {company!.profileCompletion}% done — a complete profile gets more
              applicants.
            </p>
          </div>
          <span className="shrink-0 inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-brand-600">
            Continue <ArrowRight className="w-3.5 h-3.5 arrow-slide" />
          </span>
        </Link>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {STAT_CARDS.map(({ key, label, icon: Icon, href, tone }) => (
          <Link key={key} href={href} className="surface sheen lift p-5 sm:p-6 group">
            <div
              className={`w-11 h-11 border rounded-[14px] flex items-center justify-center mb-4 ${tone}`}
            >
              <Icon className="w-5 h-5 icon-lift" strokeWidth={2.1} />
            </div>
            <div className="text-[28px] sm:text-[30px] font-extrabold text-ink tracking-[-0.035em] leading-none">
              {stats?.[key] ?? 0}
            </div>
            <div className="text-[11.5px] font-semibold text-ink-faint uppercase tracking-[0.1em] mt-2.5">
              {label}
            </div>
          </Link>
        ))}
      </div>

      <div>
        <h2 className="text-[15px] font-bold text-ink tracking-[-0.02em] mb-3.5">
          Quick actions
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
          {QUICK_ACTIONS.map(({ href, icon: Icon, label, primary }) => (
            <Link
              key={href}
              href={href}
              className={`press flex flex-col items-start gap-3 rounded-[16px] border p-4 transition-all duration-300 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 ${
                primary
                  ? 'grad-brand border-transparent text-white shadow-brand hover:shadow-e4'
                  : 'bg-white border-line text-ink hover:border-brand-200 hover:bg-brand-50/50'
              }`}
            >
              <Icon
                className={`w-[19px] h-[19px] ${primary ? 'text-white' : 'text-brand-600'}`}
                strokeWidth={2.1}
              />
              <span className="text-[13px] font-semibold leading-snug">{label}</span>
            </Link>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
        <section className="surface sheen overflow-hidden">
          <div className="flex items-center justify-between p-5 sm:p-6 border-b border-line-soft">
            <h2 className="text-[16px] font-bold text-ink tracking-[-0.025em]">
              Recent jobs
            </h2>
            <Link
              href="/recruiter/manage-jobs"
              className="group text-[13px] font-semibold text-brand-600 hover:text-brand-700 transition-colors flex items-center gap-1.5"
            >
              Manage <ArrowRight className="w-3.5 h-3.5 arrow-slide" />
            </Link>
          </div>

          {jobs.length === 0 ? (
            <EmptyState
              icon={Briefcase}
              title="No jobs posted yet"
              action={{ href: '/recruiter/post-job', label: 'Post your first job' }}
            />
          ) : (
            <ul className="divide-y divide-line-soft">
              {jobs.map((job) => (
                <li key={job.id}>
                  <Link
                    href={`/recruiter/applications?jobId=${job.id}`}
                    className="flex items-center justify-between gap-4 px-5 sm:px-6 py-4 hover:bg-canvas transition-colors"
                  >
                    <div className="min-w-0">
                      <p className="text-[14px] font-semibold text-ink truncate">
                        {job.title}
                      </p>
                      <p className="text-[12.5px] text-ink-muted mt-0.5 truncate">
                        {job.location || 'Location not set'} ·{' '}
                        {job._count?.applications ?? 0} applicant
                        {job._count?.applications === 1 ? '' : 's'}
                      </p>
                    </div>
                    <StatusPill
                      label={job.status}
                      className={JOB_STATUS_STYLES[job.status] ?? JOB_STATUS_STYLES.CLOSED}
                    />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="surface sheen overflow-hidden">
          <div className="flex items-center justify-between p-5 sm:p-6 border-b border-line-soft">
            <h2 className="text-[16px] font-bold text-ink tracking-[-0.025em]">
              Recent applications
            </h2>
            <Link
              href="/recruiter/applications"
              className="group text-[13px] font-semibold text-brand-600 hover:text-brand-700 transition-colors flex items-center gap-1.5"
            >
              View all <ArrowRight className="w-3.5 h-3.5 arrow-slide" />
            </Link>
          </div>

          {applications.length === 0 ? (
            <EmptyState icon={Users} title="No applications received yet" />
          ) : (
            <ul className="divide-y divide-line-soft">
              {applications.map((app) => (
                <li
                  key={app.id}
                  className="flex items-center justify-between gap-4 px-5 sm:px-6 py-4"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {app.candidate?.user?.profileImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={app.candidate.user.profileImage}
                        alt=""
                        className="w-9 h-9 rounded-[11px] object-cover border border-line shrink-0"
                      />
                    ) : (
                      <span className="w-9 h-9 rounded-[11px] grad-brand flex items-center justify-center text-white text-[12.5px] font-bold shrink-0">
                        {app.candidate?.user?.name?.[0]?.toUpperCase() ?? '?'}
                      </span>
                    )}
                    <div className="min-w-0">
                      <p className="text-[14px] font-semibold text-ink truncate">
                        {app.candidate?.user?.name ?? 'Unknown'}
                      </p>
                      <p className="text-[12.5px] text-ink-muted truncate mt-0.5">
                        {app.job?.title ?? ''}
                      </p>
                    </div>
                  </div>
                  <StatusPill
                    label={app.status}
                    className={STATUS_STYLES[app.status] ?? 'bg-canvas text-ink-muted border-line'}
                  />
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}

function StatusPill({ label, className }: { label: string; className: string }) {
  return (
    <span
      className={`shrink-0 text-[10px] font-bold uppercase tracking-[0.08em] border rounded-full px-2.5 py-1.5 ${className}`}
    >
      {label}
    </span>
  );
}

function EmptyState({
  icon: Icon,
  title,
  action,
}: {
  icon: typeof Briefcase;
  title: string;
  action?: { href: string; label: string };
}) {
  return (
    <div className="text-center py-14 px-6">
      <div className="w-14 h-14 rounded-[18px] bg-canvas border border-line-soft flex items-center justify-center mx-auto mb-4">
        <Icon className="w-6 h-6 text-ink-faint" />
      </div>
      <p className="text-ink-muted text-[14px]">{title}</p>
      {action && (
        <Link
          href={action.href}
          className="group inline-flex items-center gap-1.5 text-brand-600 hover:text-brand-700 text-[14px] font-semibold mt-3 transition-colors"
        >
          {action.label} <ArrowRight className="w-3.5 h-3.5 arrow-slide" />
        </Link>
      )}
    </div>
  );
}
