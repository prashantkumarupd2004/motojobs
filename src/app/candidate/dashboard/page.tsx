'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Bell,
  Bookmark,
  Briefcase,
  CalendarCheck,
  CheckCircle2,
  Eye,
  Search,
  TrendingUp,
} from 'lucide-react';
import { apiFetch } from '@/lib/http';
import JobCard, { type JobCardJob } from '@/components/candidate/JobCard';

interface RecentApplication {
  id: string;
  status: string;
  appliedAt: string;
  job?: {
    id: string;
    title: string;
    location?: string | null;
    company?: { name: string; logo?: string | null } | null;
  } | null;
}

interface NotificationItem {
  id: string;
  title: string;
  body: string | null;
  link: string | null;
  readAt: string | null;
  createdAt: string;
}

interface Summary {
  profileScore: number;
  isProfileComplete: boolean;
  applications: number;
  savedJobs: number;
  interviews: number;
  profileViews: number;
  recentApplications: RecentApplication[];
  notifications: NotificationItem[];
}

/** Spec statuses mapped onto the `Application.status` values the API stores. */
const STATUS_LABEL: Record<string, string> = {
  APPLIED: 'Applied',
  SCREENING: 'Under Review',
  SHORTLISTED: 'Shortlisted',
  INTERVIEW: 'Interview Scheduled',
  OFFERED: 'Selected',
  HIRED: 'Selected',
  REJECTED: 'Rejected',
};

const STATUS_TONE: Record<string, string> = {
  APPLIED: 'bg-brand-50 text-brand-700 border-brand-200',
  SCREENING: 'bg-caution-soft text-caution border-caution/25',
  SHORTLISTED: 'bg-ignite-50 text-ignite-700 border-ignite-200',
  INTERVIEW: 'bg-brand-50 text-brand-700 border-brand-200',
  OFFERED: 'bg-positive-soft text-positive border-positive/25',
  HIRED: 'bg-positive-soft text-positive border-positive/25',
  REJECTED: 'bg-critical-soft text-critical border-critical/25',
};

export default function CandidateDashboard() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [jobs, setJobs] = useState<JobCardJob[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      fetch('/api/candidate/dashboard').then((r) => (r.ok ? r.json() : null)),
      fetch('/api/candidate/recommended-jobs?limit=4').then((r) => (r.ok ? r.json() : null)),
    ])
      .then(([dash, rec]) => {
        if (cancelled) return;
        if (dash?.data) setSummary(dash.data);
        if (rec?.data) setJobs(rec.data);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const toggleSave = useCallback(async (jobId: string) => {
    setJobs((prev) =>
      prev.map((j) => (j.id === jobId ? { ...j, isSaved: !j.isSaved } : j))
    );
    try {
      await apiFetch('/api/candidate/saved-jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId }),
      });
    } catch {
      setJobs((prev) =>
        prev.map((j) => (j.id === jobId ? { ...j, isSaved: !j.isSaved } : j))
      );
    }
  }, []);

  const score = summary?.profileScore ?? 0;

  const cards = [
    {
      label: 'Profile Completion',
      value: `${score}%`,
      note: score >= 100 ? 'Completed' : 'In progress',
      icon: TrendingUp,
      tone: 'bg-positive-soft border-positive/20 text-positive',
      href: '/candidate/profile',
    },
    {
      label: 'My Applications',
      value: summary?.applications ?? 0,
      icon: Briefcase,
      tone: 'bg-brand-50 border-brand-100 text-brand-600',
      href: '/candidate/applied-jobs',
    },
    {
      label: 'Saved Jobs',
      value: summary?.savedJobs ?? 0,
      icon: Bookmark,
      tone: 'bg-caution-soft border-caution/20 text-caution',
      href: '/candidate/saved-jobs',
    },
    {
      label: 'Interviews',
      value: summary?.interviews ?? 0,
      icon: CalendarCheck,
      tone: 'bg-ignite-50 border-ignite-100 text-ignite-600',
      href: '/candidate/interviews',
    },
    {
      label: 'Profile Views',
      value: summary?.profileViews ?? 0,
      icon: Eye,
      tone: 'bg-brand-50 border-brand-100 text-brand-600',
      href: '/candidate/profile',
    },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-white border border-line rounded-[16px] p-5 h-[124px] skeleton" />
          ))}
        </div>
        <div className="bg-white border border-line rounded-[16px] h-64 skeleton" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-[1240px]">
      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {cards.map(({ label, value, note, icon: Icon, tone, href }) => (
          <Link
            key={label}
            href={href}
            className="bg-white border border-line rounded-[16px] p-5 hover:border-brand-200 hover:shadow-e2 transition-all duration-200"
          >
            <span className={`w-10 h-10 rounded-[12px] border flex items-center justify-center ${tone}`}>
              <Icon className="w-[19px] h-[19px]" strokeWidth={2.1} />
            </span>
            <p className="text-[26px] font-extrabold text-ink tracking-[-0.035em] leading-none mt-4">
              {value}
            </p>
            <p className="text-[12px] font-semibold text-ink-faint uppercase tracking-[0.08em] mt-2">
              {label}
            </p>
            {note && (
              <p className="text-[12px] font-semibold text-positive mt-1.5 inline-flex items-center gap-1">
                {score >= 100 && <CheckCircle2 className="w-3.5 h-3.5" />}
                {note}
              </p>
            )}
          </Link>
        ))}
      </div>

      {/* Profile completion nudge — only while there is something to finish */}
      {score < 100 && (
        <div className="bg-white border border-line rounded-[16px] p-6">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="min-w-0">
              <h2 className="text-[16px] font-bold text-ink">Finish your profile</h2>
              <p className="text-[13.5px] text-ink-muted mt-1 leading-[1.6]">
                Complete profiles appear higher in recruiter searches.
              </p>
            </div>
            <span className="text-[24px] font-extrabold text-brand-600 leading-none shrink-0">
              {score}%
            </span>
          </div>
          <div className="w-full h-2 bg-line-soft rounded-full overflow-hidden">
            <div className="h-full grad-brand rounded-full transition-all duration-500" style={{ width: `${score}%` }} />
          </div>
          <Link
            href="/candidate/onboarding"
            className="inline-flex items-center gap-1.5 text-brand-600 hover:text-brand-700 text-[13.5px] font-semibold mt-4"
          >
            Continue where you left off <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* Recommended jobs */}
      <section>
        <div className="flex items-center justify-between gap-4 mb-4">
          <h2 className="text-[17px] font-bold text-ink tracking-[-0.02em]">Recommended jobs</h2>
          <Link
            href="/jobs"
            className="text-[13.5px] font-semibold text-brand-600 hover:text-brand-700 shrink-0"
          >
            View all
          </Link>
        </div>

        {jobs.length === 0 ? (
          <EmptyState
            icon={Search}
            title="No matching jobs yet"
            body="Complete your profile and we will surface roles that fit."
            action={{ href: '/jobs', label: 'Browse all jobs' }}
          />
        ) : (
          <div className="grid gap-4 xl:grid-cols-2">
            {jobs.map((job) => (
              <JobCard key={job.id} job={job} onToggleSave={toggleSave} />
            ))}
          </div>
        )}
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent applications */}
        <section className="bg-white border border-line rounded-[16px] overflow-hidden">
          <div className="flex items-center justify-between gap-4 px-5 py-4 border-b border-line">
            <h2 className="text-[15.5px] font-bold text-ink">Recent applications</h2>
            <Link
              href="/candidate/applied-jobs"
              className="text-[13px] font-semibold text-brand-600 hover:text-brand-700 shrink-0"
            >
              View all
            </Link>
          </div>

          {!summary?.recentApplications?.length ? (
            <EmptyState
              icon={Briefcase}
              title="No applications yet"
              body="Jobs you apply to will show up here."
              action={{ href: '/jobs', label: 'Find jobs' }}
              bare
            />
          ) : (
            <ul className="divide-y divide-line-soft">
              {summary.recentApplications.map((app) => (
                <li key={app.id} className="flex items-center gap-3 px-5 py-3.5">
                  {app.job?.company?.logo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={app.job.company.logo}
                      alt=""
                      className="w-9 h-9 rounded-[10px] object-cover border border-line shrink-0"
                    />
                  ) : (
                    <span className="w-9 h-9 rounded-[10px] bg-brand-50 border border-brand-100 flex items-center justify-center shrink-0 text-brand-700 font-bold text-[13px]">
                      {(app.job?.company?.name ?? 'J')[0].toUpperCase()}
                    </span>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-[13.5px] font-semibold text-ink truncate">
                      {app.job?.title ?? 'Job removed'}
                    </p>
                    <p className="text-[12px] text-ink-muted truncate mt-0.5">
                      {app.job?.company?.name ?? '—'} ·{' '}
                      {new Date(app.appliedAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                      })}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 border rounded-full px-2.5 py-1 text-[10.5px] font-bold uppercase tracking-[0.05em] ${
                      STATUS_TONE[app.status] ?? 'bg-canvas text-ink-muted border-line'
                    }`}
                  >
                    {STATUS_LABEL[app.status] ?? app.status}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Recent notifications */}
        <section className="bg-white border border-line rounded-[16px] overflow-hidden">
          <div className="px-5 py-4 border-b border-line">
            <h2 className="text-[15.5px] font-bold text-ink">Recent notifications</h2>
          </div>

          {!summary?.notifications?.length ? (
            <EmptyState
              icon={Bell}
              title="Nothing new"
              body="Interview invites and profile views will appear here."
              bare
            />
          ) : (
            <ul className="divide-y divide-line-soft">
              {summary.notifications.map((n) => (
                <li key={n.id} className="flex items-start gap-3 px-5 py-3.5">
                  <span
                    className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${
                      n.readAt ? 'bg-line' : 'bg-brand-600'
                    }`}
                  />
                  <div className="min-w-0">
                    <p className="text-[13.5px] font-semibold text-ink">{n.title}</p>
                    {n.body && (
                      <p className="text-[12.5px] text-ink-muted mt-0.5 leading-[1.55]">{n.body}</p>
                    )}
                    <p className="text-[11.5px] text-ink-faint mt-1">
                      {new Date(n.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                      })}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}

function EmptyState({
  icon: Icon,
  title,
  body,
  action,
  bare,
}: {
  icon: typeof Search;
  title: string;
  body: string;
  action?: { href: string; label: string };
  bare?: boolean;
}) {
  return (
    <div
      className={
        bare
          ? 'text-center px-5 py-12'
          : 'bg-white border border-line rounded-[16px] text-center px-5 py-14'
      }
    >
      <span className="w-12 h-12 rounded-[14px] bg-canvas border border-line-soft flex items-center justify-center mx-auto mb-3.5">
        <Icon className="w-5 h-5 text-ink-faint" strokeWidth={1.9} />
      </span>
      <p className="text-[14.5px] font-bold text-ink">{title}</p>
      <p className="text-[13px] text-ink-muted mt-1 max-w-xs mx-auto leading-[1.6]">{body}</p>
      {action && (
        <Link
          href={action.href}
          className="inline-flex items-center gap-1.5 text-brand-600 hover:text-brand-700 text-[13.5px] font-semibold mt-3"
        >
          {action.label} <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      )}
    </div>
  );
}
