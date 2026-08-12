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

const STATUS_LABEL: Record<string, string> = {
  APPLIED: 'Applied',
  SCREENING: 'Under Review',
  SHORTLISTED: 'Shortlisted',
  INTERVIEW: 'Interview',
  OFFERED: 'Selected',
  HIRED: 'Selected',
  REJECTED: 'Rejected',
};

const STATUS_TONE: Record<string, string> = {
  APPLIED: 'bg-[#EFF6FF] text-[#1D4ED8] border-[#BFDBFE]',
  SCREENING: 'bg-[#FFFBEB] text-[#D97706] border-[#FDE68A]',
  SHORTLISTED: 'bg-[#FFF7ED] text-[#EA580C] border-[#FED7AA]',
  INTERVIEW: 'bg-[#EFF6FF] text-[#1D4ED8] border-[#BFDBFE]',
  OFFERED: 'bg-[#ECFDF5] text-[#059669] border-[#A7F3D0]',
  HIRED: 'bg-[#ECFDF5] text-[#059669] border-[#A7F3D0]',
  REJECTED: 'bg-[#FEF2F2] text-[#DC2626] border-[#FECACA]',
};

/* ════════════════════════════════════════════════════════════
   STAT CARD CONFIG
   ════════════════════════════════════════════════════════════ */

interface StatCard {
  label: string;
  value: string | number;
  note?: string;
  icon: typeof Search;
  iconBg: string;
  iconColor: string;
  href: string;
  isCompletion?: boolean;
  score?: number;
}

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

  const cards: StatCard[] = [
    {
      label: 'Profile Completion',
      value: `${score}%`,
      note: score >= 100 ? 'Completed' : 'In progress',
      icon: TrendingUp,
      iconBg: 'bg-[#ECFDF5]',
      iconColor: 'text-[#059669]',
      href: '/candidate/profile',
      isCompletion: true,
      score,
    },
    {
      label: 'My Applications',
      value: summary?.applications ?? 0,
      note: 'Track your applications',
      icon: Briefcase,
      iconBg: 'bg-[#EFF6FF]',
      iconColor: 'text-[#1D4ED8]',
      href: '/candidate/applied-jobs',
    },
    {
      label: 'Saved Jobs',
      value: summary?.savedJobs ?? 0,
      note: 'Jobs you saved',
      icon: Bookmark,
      iconBg: 'bg-[#FFFBEB]',
      iconColor: 'text-[#D97706]',
      href: '/candidate/saved-jobs',
    },
    {
      label: 'Interviews',
      value: summary?.interviews ?? 0,
      note: 'Upcoming interviews',
      icon: CalendarCheck,
      iconBg: 'bg-[#FFF7ED]',
      iconColor: 'text-[#EA580C]',
      href: '/candidate/interviews',
    },
    {
      label: 'Profile Views',
      value: summary?.profileViews ?? 0,
      note: 'Who viewed your profile',
      icon: Eye,
      iconBg: 'bg-[#F0F6FB]',
      iconColor: 'text-[#0F4C81]',
      href: '/candidate/profile',
    },
  ];

  /* ── Loading skeleton ──────────────────────────────────────── */
  if (loading) {
    return (
      <div className="space-y-6 max-w-[1240px]">
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="bg-white border border-[#E5E7EB] rounded-[18px] p-5 h-[130px] skeleton"
              style={{ animationDelay: `${i * 0.06}s` }}
            />
          ))}
        </div>
        <div className="bg-white border border-[#E5E7EB] rounded-[18px] h-72 skeleton" />
        <div className="grid gap-5 lg:grid-cols-2">
          <div className="bg-white border border-[#E5E7EB] rounded-[18px] h-56 skeleton" />
          <div className="bg-white border border-[#E5E7EB] rounded-[18px] h-56 skeleton" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-[1240px]">

      {/* ══════════════════════════════════════════════════════════
          SECTION 1 — STAT CARDS
          ══════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {cards.map(({ label, value, note, icon: Icon, iconBg, iconColor, href, isCompletion, score: s }, idx) => (
          <Link
            key={label}
            href={href}
            className="stat-card bg-white border border-[#E5E7EB] rounded-[18px] p-5 block"
            style={{ animationDelay: `${idx * 0.06}s` }}
          >
            {/* Icon */}
            <span className={`w-10 h-10 rounded-[12px] border border-black/[0.06] flex items-center justify-center shrink-0 ${iconBg} ${iconColor}`}>
              <Icon className="w-[19px] h-[19px]" strokeWidth={2.1} />
            </span>

            {/* Number */}
            <p className="text-[28px] font-extrabold text-[#0F172A] tracking-[-0.04em] leading-none mt-4">
              {value}
            </p>

            {/* Label */}
            <p className="text-[12px] font-semibold text-[#94A3B8] uppercase tracking-[0.08em] mt-2 leading-tight">
              {label}
            </p>

            {/* Note / progress */}
            {isCompletion ? (
              <div className="mt-2.5">
                {(s ?? 0) >= 100 ? (
                  <p className="text-[12px] font-semibold text-[#059669] inline-flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Completed
                  </p>
                ) : (
                  <>
                    <div className="w-full h-1.5 bg-[#F1F5F9] rounded-full overflow-hidden">
                      <div
                        className="h-full grad-brand rounded-full transition-all duration-700"
                        style={{ width: `${s ?? 0}%` }}
                      />
                    </div>
                    <p className="text-[11px] text-[#94A3B8] mt-1">In progress</p>
                  </>
                )}
              </div>
            ) : (
              note && (
                <p className="text-[12px] text-[#94A3B8] mt-1.5 truncate">{note}</p>
              )
            )}
          </Link>
        ))}
      </div>

      {/* Profile-completion nudge banner — only while incomplete */}
      {score < 100 && (
        <div className="bg-gradient-to-r from-[#EFF6FF] to-[#DBEAFE] border border-[#BFDBFE] rounded-[16px] p-5 flex items-center justify-between gap-4">
          <div className="min-w-0">
            <h2 className="text-[15px] font-bold text-[#1E3A8A]">Finish your profile</h2>
            <p className="text-[13px] text-[#1D4ED8]/70 mt-0.5">
              Complete profiles appear higher in recruiter searches and get <span className="font-semibold">3× more views</span>.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <span className="text-[22px] font-extrabold text-[#1D4ED8] leading-none">{score}%</span>
            <Link
              href="/candidate/onboarding"
              className="inline-flex items-center gap-1.5 bg-[#1D4ED8] text-white text-[13px] font-semibold px-4 py-2 rounded-[10px] hover:bg-[#1E40AF] transition-colors shadow-sm"
            >
              Continue <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════
          SECTION 2 — RECOMMENDED JOBS
          ══════════════════════════════════════════════════════════ */}
      <section>
        <div className="flex items-center justify-between gap-4 mb-5">
          <div>
            <h2 className="text-[18px] font-bold text-[#0F172A] tracking-[-0.025em]">
              Recommended jobs for you
            </h2>
            <p className="text-[13px] text-[#64748B] mt-0.5">
              Curated based on your profile and preferences
            </p>
          </div>
          <Link
            href="/jobs"
            className="inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-[#1D4ED8] hover:text-[#1E40AF] shrink-0 transition-colors group"
          >
            View all jobs
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {jobs.length === 0 ? (
          <DashEmptyState
            icon={Search}
            title="No matching jobs yet"
            body="Complete your profile and we'll surface roles that fit your skills and experience."
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

      {/* ══════════════════════════════════════════════════════════
          SECTION 3 — RECENT APPLICATIONS + NOTIFICATIONS
          ══════════════════════════════════════════════════════════ */}
      <div className="grid gap-5 lg:grid-cols-2">

        {/* Recent Applications */}
        <section className="bg-white border border-[#E5E7EB] rounded-[18px] overflow-hidden">
          <div className="flex items-center justify-between gap-4 px-5 py-4 border-b border-[#F1F5F9]">
            <div className="flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-[8px] bg-[#EFF6FF] flex items-center justify-center">
                <Briefcase className="w-3.5 h-3.5 text-[#1D4ED8]" strokeWidth={2.2} />
              </span>
              <h2 className="text-[15px] font-bold text-[#0F172A]">Recent Applications</h2>
            </div>
            <Link
              href="/candidate/applied-jobs"
              className="text-[13px] font-semibold text-[#1D4ED8] hover:text-[#1E40AF] shrink-0 transition-colors"
            >
              View all →
            </Link>
          </div>

          {!summary?.recentApplications?.length ? (
            <PanelEmptyState
              icon={Briefcase}
              title="No applications yet"
              body="Start applying to jobs and track them here."
            />
          ) : (
            <ul className="divide-y divide-[#F8FAFC]">
              {summary.recentApplications.map((app) => (
                <li key={app.id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-[#F8FAFC] transition-colors">
                  {app.job?.company?.logo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={app.job.company.logo}
                      alt=""
                      className="w-9 h-9 rounded-[10px] object-cover border border-[#E2E8F0] shrink-0"
                    />
                  ) : (
                    <span className="w-9 h-9 rounded-[10px] bg-[#EFF6FF] border border-[#BFDBFE] flex items-center justify-center shrink-0 text-[#1D4ED8] font-bold text-[13px]">
                      {(app.job?.company?.name ?? 'J')[0].toUpperCase()}
                    </span>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-[13.5px] font-semibold text-[#0F172A] truncate">
                      {app.job?.title ?? 'Job removed'}
                    </p>
                    <p className="text-[12px] text-[#64748B] truncate mt-0.5">
                      {app.job?.company?.name ?? '—'} ·{' '}
                      {new Date(app.appliedAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                      })}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 border rounded-full px-2.5 py-1 text-[10.5px] font-bold uppercase tracking-[0.05em] ${
                      STATUS_TONE[app.status] ?? 'bg-[#F8FAFC] text-[#64748B] border-[#E2E8F0]'
                    }`}
                  >
                    {STATUS_LABEL[app.status] ?? app.status}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Recent Notifications */}
        <section className="bg-white border border-[#E5E7EB] rounded-[18px] overflow-hidden">
          <div className="flex items-center justify-between gap-4 px-5 py-4 border-b border-[#F1F5F9]">
            <div className="flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-[8px] bg-[#FFF7ED] flex items-center justify-center">
                <Bell className="w-3.5 h-3.5 text-[#EA580C]" strokeWidth={2.2} />
              </span>
              <h2 className="text-[15px] font-bold text-[#0F172A]">Recent Notifications</h2>
            </div>
            <Link
              href="/candidate/applied-jobs"
              className="text-[13px] font-semibold text-[#1D4ED8] hover:text-[#1E40AF] shrink-0 transition-colors"
            >
              View all →
            </Link>
          </div>

          {!summary?.notifications?.length ? (
            <PanelEmptyState
              icon={Bell}
              title="No new notifications"
              body="You'll see important updates here."
            />
          ) : (
            <ul className="divide-y divide-[#F8FAFC]">
              {summary.notifications.map((n) => (
                <li key={n.id} className="flex items-start gap-3 px-5 py-3.5 hover:bg-[#F8FAFC] transition-colors">
                  <span
                    className={`mt-2 w-2 h-2 rounded-full shrink-0 ${
                      n.readAt ? 'bg-[#E2E8F0]' : 'bg-[#1D4ED8] animate-pulse-dot'
                    }`}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-[13.5px] font-semibold text-[#0F172A] leading-snug">{n.title}</p>
                    {n.body && (
                      <p className="text-[12.5px] text-[#64748B] mt-0.5 leading-[1.55]">{n.body}</p>
                    )}
                    <p className="text-[11.5px] text-[#94A3B8] mt-1">
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

/* ════════════════════════════════════════════════════════════
   EMPTY STATES
   ════════════════════════════════════════════════════════════ */

/** Full empty-state for sections with a card wrapper */
function DashEmptyState({
  icon: Icon,
  title,
  body,
  action,
}: {
  icon: typeof Search;
  title: string;
  body: string;
  action?: { href: string; label: string };
}) {
  return (
    <div className="bg-white border border-[#E5E7EB] rounded-[18px] text-center px-6 py-14">
      <span className="w-14 h-14 rounded-[16px] bg-[#F8FAFC] border border-[#E5E7EB] flex items-center justify-center mx-auto mb-4 shadow-sm">
        <Icon className="w-6 h-6 text-[#94A3B8]" strokeWidth={1.8} />
      </span>
      <p className="text-[15px] font-bold text-[#0F172A]">{title}</p>
      <p className="text-[13px] text-[#64748B] mt-1.5 max-w-xs mx-auto leading-[1.6]">{body}</p>
      {action && (
        <Link
          href={action.href}
          className="inline-flex items-center gap-1.5 text-[#1D4ED8] hover:text-[#1E40AF] text-[13.5px] font-semibold mt-4 transition-colors group"
        >
          {action.label}
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      )}
    </div>
  );
}

/** Compact empty-state that sits inside an existing card panel */
function PanelEmptyState({
  icon: Icon,
  title,
  body,
}: {
  icon: typeof Search;
  title: string;
  body: string;
}) {
  return (
    <div className="text-center px-6 py-12">
      <span className="w-12 h-12 rounded-[14px] bg-[#F8FAFC] border border-[#E5E7EB] flex items-center justify-center mx-auto mb-3.5 shadow-sm">
        <Icon className="w-5 h-5 text-[#94A3B8]" strokeWidth={1.8} />
      </span>
      <p className="text-[14px] font-bold text-[#0F172A]">{title}</p>
      <p className="text-[13px] text-[#64748B] mt-1 max-w-[220px] mx-auto leading-[1.6]">{body}</p>
    </div>
  );
}
