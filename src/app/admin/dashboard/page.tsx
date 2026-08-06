'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  AlertCircle,
  ArrowRight,
  Bell,
  Briefcase,
  Building2,
  CalendarCheck,
  FileText,
  Loader2,
  UserCog,
  UserPlus,
  Users,
} from 'lucide-react';
import { PageHeader, Panel, StatCard, StatusPill, type PillTone } from '@/components/admin/ui';

interface Stats {
  totalJobSeekers: number;
  totalEmployers: number;
  activeJobs: number;
  totalApplications: number;
  totalInterviews: number;
  totalCompanies: number;
  todayRegistrations: number;
  todayJobs: number;
}

interface Overview {
  pendingJobs: number;
  openTickets: number;
  suspendedUsers: number;
  unverifiedUsers: number;
}

interface Payload {
  stats: Stats;
  overview: Overview;
  latestEmployers: Array<{
    id: string;
    createdAt: string;
    user: { name: string; email: string };
    company: { id: string; name: string; logo: string | null; city: string | null } | null;
  }>;
  latestCandidates: Array<{
    id: string;
    headline: string | null;
    currentCity: string | null;
    createdAt: string;
    user: { name: string; email: string; profileImage: string | null };
  }>;
  latestJobs: Array<{
    id: string;
    title: string;
    status: string;
    location: string | null;
    createdAt: string;
    company: { name: string } | null;
    _count: { applications: number };
  }>;
  recentApplications: Array<{
    id: string;
    status: string;
    appliedAt: string;
    candidate: { user: { name: string } };
    job: { id: string; title: string };
  }>;
  recentNotifications: Array<{
    id: string;
    type: string;
    title: string;
    body: string | null;
    createdAt: string;
  }>;
}

const JOB_STATUS_TONE: Record<string, PillTone> = {
  APPROVED: 'positive',
  PENDING: 'caution',
  DRAFT: 'neutral',
  CLOSED: 'neutral',
  REJECTED: 'critical',
};

const APP_STATUS_TONE: Record<string, PillTone> = {
  APPLIED: 'brand',
  SCREENING: 'caution',
  SHORTLISTED: 'brand',
  INTERVIEW: 'brand',
  OFFERED: 'positive',
  HIRED: 'positive',
  REJECTED: 'critical',
};

const shortDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });

export default function AdminDashboard() {
  const [data, setData] = useState<Payload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    fetch('/api/admin/dashboard')
      .then(async (res) => {
        const body = await res.json();
        if (cancelled) return;
        if (!res.ok) {
          setError(body.error ?? 'Could not load the dashboard');
          return;
        }
        setData(body);
      })
      .catch(() => !cancelled && setError('Could not load the dashboard'))
      .finally(() => !cancelled && setLoading(false));
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

  if (error || !data) {
    return (
      <div className="bg-critical-soft border border-critical/20 text-critical rounded-[14px] px-4 py-3 text-[13.5px] font-medium">
        {error || 'Could not load the dashboard'}
      </div>
    );
  }

  const { stats, overview } = data;

  const CARDS = [
    { label: 'Total Job Seekers', value: stats.totalJobSeekers, icon: Users, href: '/admin/job-seekers', tone: 'brand' as const },
    { label: 'Total Employers', value: stats.totalEmployers, icon: UserCog, href: '/admin/employers', tone: 'brand' as const },
    { label: 'Active Jobs', value: stats.activeJobs, icon: Briefcase, href: '/admin/jobs', tone: 'positive' as const },
    { label: 'Applications', value: stats.totalApplications, icon: FileText, href: '/admin/applications', tone: 'brand' as const },
    { label: 'Interviews', value: stats.totalInterviews, icon: CalendarCheck, href: '/admin/interviews', tone: 'brand' as const },
    { label: 'Companies', value: stats.totalCompanies, icon: Building2, href: '/admin/companies', tone: 'neutral' as const },
    { label: "Today's Registrations", value: stats.todayRegistrations, icon: UserPlus, tone: 'positive' as const },
    { label: "Today's Jobs Posted", value: stats.todayJobs, icon: Briefcase, tone: 'caution' as const },
  ];

  const QUEUES = [
    { label: 'Jobs awaiting review', value: overview.pendingJobs, href: '/admin/jobs?status=PENDING' },
    { label: 'Open support tickets', value: overview.openTickets, href: '/admin/support' },
    { label: 'Suspended accounts', value: overview.suspendedUsers, href: '/admin/job-seekers?status=suspended' },
    { label: 'Unverified emails', value: overview.unverifiedUsers, href: '/admin/job-seekers?verified=no' },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Dashboard" subtitle="Platform overview" />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {CARDS.map((c) => (
          <StatCard key={c.label} {...c} />
        ))}
      </div>

      <Panel title="Website overview">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 p-4">
          {QUEUES.map(({ label, value, href }) => {
            const needsAction = value > 0;
            return (
              <Link
                key={label}
                href={href}
                className={`rounded-[12px] border p-4 transition-colors ${
                  needsAction
                    ? 'bg-caution-soft border-[#F3DBB4] hover:border-[#E0BE86]'
                    : 'bg-canvas border-line hover:border-brand-200'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  {needsAction ? (
                    <AlertCircle className="w-4 h-4 text-[#9A5D00]" />
                  ) : (
                    <span className="w-4 h-4" />
                  )}
                  <ArrowRight className="w-3.5 h-3.5 text-ink-faint" />
                </div>
                <div
                  className={`text-[22px] font-extrabold tracking-[-0.03em] ${
                    needsAction ? 'text-[#9A5D00]' : 'text-ink'
                  }`}
                >
                  {value}
                </div>
                <div className="text-[12px] text-ink-muted mt-1">{label}</div>
              </Link>
            );
          })}
        </div>
      </Panel>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Panel
          title="Latest employers"
          action={<SeeAll href="/admin/employers" />}
        >
          <List
            items={data.latestEmployers}
            empty="No employers registered yet."
            render={(e) => (
              <Row
                key={e.id}
                title={e.company?.name ?? e.user.name}
                subtitle={`${e.user.name} · ${e.company?.city ?? 'Location not set'}`}
                meta={shortDate(e.createdAt)}
              />
            )}
          />
        </Panel>

        <Panel title="Latest candidates" action={<SeeAll href="/admin/job-seekers" />}>
          <List
            items={data.latestCandidates}
            empty="No candidates registered yet."
            render={(c) => (
              <Row
                key={c.id}
                title={c.user.name}
                subtitle={c.headline || c.currentCity || c.user.email}
                meta={shortDate(c.createdAt)}
              />
            )}
          />
        </Panel>

        <Panel title="Latest jobs" action={<SeeAll href="/admin/jobs" />}>
          <List
            items={data.latestJobs}
            empty="No jobs posted yet."
            render={(j) => (
              <Row
                key={j.id}
                title={j.title}
                subtitle={`${j.company?.name ?? 'No company'} · ${j._count.applications} applicant${j._count.applications === 1 ? '' : 's'}`}
                meta={<StatusPill label={j.status} tone={JOB_STATUS_TONE[j.status] ?? 'neutral'} />}
              />
            )}
          />
        </Panel>

        <Panel title="Recent applications" action={<SeeAll href="/admin/applications" />}>
          <List
            items={data.recentApplications}
            empty="No applications yet."
            render={(a) => (
              <Row
                key={a.id}
                title={a.candidate.user.name}
                subtitle={a.job.title}
                meta={<StatusPill label={a.status} tone={APP_STATUS_TONE[a.status] ?? 'neutral'} />}
              />
            )}
          />
        </Panel>
      </div>

      <Panel title="Recent notifications" action={<SeeAll href="/admin/notifications" />}>
        <List
          items={data.recentNotifications}
          empty="No notifications yet."
          render={(n) => (
            <Row
              key={n.id}
              icon={<Bell className="w-4 h-4 text-ink-faint shrink-0" />}
              title={n.title}
              subtitle={n.body ?? n.type}
              meta={shortDate(n.createdAt)}
            />
          )}
        />
      </Panel>
    </div>
  );
}

function SeeAll({ href }: { href: string }) {
  return (
    <Link
      href={href}
      className="group text-[12.5px] font-semibold text-brand-600 hover:text-brand-700 inline-flex items-center gap-1.5 transition-colors"
    >
      View all <ArrowRight className="w-3.5 h-3.5 arrow-slide" />
    </Link>
  );
}

function List<T>({
  items,
  empty,
  render,
}: {
  items: T[];
  empty: string;
  render: (item: T) => React.ReactNode;
}) {
  if (items.length === 0) {
    return <p className="text-[13.5px] text-ink-muted px-5 py-10 text-center">{empty}</p>;
  }
  return <ul className="divide-y divide-line-soft">{items.map(render)}</ul>;
}

function Row({
  icon,
  title,
  subtitle,
  meta,
}: {
  icon?: React.ReactNode;
  title: string;
  subtitle?: string | null;
  meta?: React.ReactNode;
}) {
  return (
    <li className="flex items-center justify-between gap-3 px-5 py-3">
      <div className="flex items-center gap-2.5 min-w-0">
        {icon}
        <div className="min-w-0">
          <p className="text-[13.5px] font-semibold text-ink truncate">{title}</p>
          {subtitle && (
            <p className="text-[12px] text-ink-muted truncate mt-0.5">{subtitle}</p>
          )}
        </div>
      </div>
      <div className="shrink-0 text-[12px] text-ink-faint">{meta}</div>
    </li>
  );
}
