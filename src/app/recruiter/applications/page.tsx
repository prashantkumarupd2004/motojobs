'use client';

import { useCallback, useEffect, useMemo, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  Briefcase,
  CalendarPlus,
  Check,
  Eye,
  FileText,
  IndianRupee,
  Loader2,
  MapPin,
  Star,
  Users,
  X,
} from 'lucide-react';
import { apiFetch } from '@/lib/http';
import { formatINR } from '@/lib/automotive';
import ScheduleInterviewModal from '@/components/employer/ScheduleInterviewModal';

interface Application {
  id: string;
  status: string;
  appliedAt: string;
  recruiterNotes: string | null;
  candidate: {
    id: string;
    headline: string | null;
    currentCity: string | null;
    totalExperience: string | null;
    expectedSalary: number | null;
    resumeUrl: string | null;
    user: { id: string; name: string; email: string; profileImage: string | null };
    skills: Array<{ skill: { name: string } }>;
  };
  job: { id: string; title: string };
  resume: { id: string; title: string; fileUrl: string | null } | null;
  interviews: Array<{ id: string; scheduledAt: string }>;
}

interface JobOption {
  id: string;
  title: string;
}

const FILTERS = [
  { key: '', label: 'All' },
  { key: 'APPLIED', label: 'New' },
  { key: 'SCREENING', label: 'Under review' },
  { key: 'SHORTLISTED', label: 'Shortlisted' },
  { key: 'INTERVIEW', label: 'Interview' },
  { key: 'HIRED', label: 'Selected' },
  { key: 'REJECTED', label: 'Rejected' },
] as const;

const STATUS_STYLES: Record<string, string> = {
  APPLIED: 'bg-informative-soft text-brand-700 border-brand-100',
  SCREENING: 'bg-caution-soft text-[#9A5D00] border-[#F3DBB4]',
  SHORTLISTED: 'bg-brand-50 text-brand-700 border-brand-100',
  INTERVIEW: 'bg-brand-50 text-brand-700 border-brand-100',
  OFFERED: 'bg-positive-soft text-[#0A7A54] border-[#BEE7D8]',
  HIRED: 'bg-positive-soft text-[#0A7A54] border-[#BEE7D8]',
  REJECTED: 'bg-critical-soft text-[#B32B2B] border-[#F3C9C9]',
};

const STATUS_LABELS: Record<string, string> = {
  APPLIED: 'Applied',
  SCREENING: 'Under review',
  SHORTLISTED: 'Shortlisted',
  INTERVIEW: 'Interview',
  OFFERED: 'Offered',
  HIRED: 'Selected',
  REJECTED: 'Not selected',
};

export default function ApplicationsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-7 h-7 text-brand-600 animate-spin" />
        </div>
      }
    >
      <ApplicationsBoard />
    </Suspense>
  );
}

function ApplicationsBoard() {
  const params = useSearchParams();
  const [applications, setApplications] = useState<Application[]>([]);
  const [jobs, setJobs] = useState<JobOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [status, setStatus] = useState(params.get('status') ?? '');
  const [jobId, setJobId] = useState(params.get('jobId') ?? '');
  const [scheduling, setScheduling] = useState<Application | null>(null);

  const load = useCallback(async () => {
    const res = await fetch('/api/recruiter/applications');
    if (!res.ok) return;
    const data = await res.json();
    setApplications(data.applications ?? []);
    setJobs(data.jobs ?? []);
  }, []);

  useEffect(() => {
    let cancelled = false;
    load()
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [load]);

  async function move(id: string, next: string) {
    setBusy(id);
    // Optimistic: the row re-renders immediately and is reconciled on failure.
    const previous = applications;
    setApplications((list) =>
      list.map((a) => (a.id === id ? { ...a, status: next } : a))
    );
    try {
      const res = await apiFetch('/api/recruiter/applications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ applicationId: id, status: next }),
      });
      if (!res.ok) setApplications(previous);
    } catch {
      setApplications(previous);
    } finally {
      setBusy(null);
    }
  }

  const visible = useMemo(
    () =>
      applications.filter(
        (a) => (!status || a.status === status) && (!jobId || a.job.id === jobId)
      ),
    [applications, status, jobId]
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-7 h-7 text-brand-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[26px] sm:text-[28px] font-extrabold text-ink tracking-[-0.035em]">
          Applications
        </h1>
        <p className="text-ink-muted text-[14.5px] mt-1.5">
          {applications.length} candidate{applications.length === 1 ? '' : 's'} applied to
          your roles
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex gap-2 overflow-x-auto scroll-none -mx-1 px-1 pb-1">
          {FILTERS.map((f) => (
            <button
              key={f.key || 'all'}
              onClick={() => setStatus(f.key)}
              className={`press shrink-0 px-4 py-2.5 rounded-[12px] text-[12.5px] font-semibold transition-all duration-300 border ${
                status === f.key
                  ? 'grad-brand text-white border-transparent shadow-brand'
                  : 'bg-white border-line text-ink-muted hover:border-brand-200 hover:text-brand-700'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {jobs.length > 0 && (
          <select
            value={jobId}
            onChange={(e) => setJobId(e.target.value)}
            className="w-full sm:max-w-xs bg-white border border-line rounded-[12px] px-4 py-2.5 text-[13.5px] text-ink outline-none focus:border-brand-600 focus:shadow-[0_0_0_4px_rgba(15,76,129,0.10)] transition-all"
          >
            <option value="">All roles</option>
            {jobs.map((j) => (
              <option key={j.id} value={j.id}>
                {j.title}
              </option>
            ))}
          </select>
        )}
      </div>

      {visible.length === 0 ? (
        <div className="surface sheen text-center py-16 px-6">
          <div className="w-14 h-14 rounded-[18px] bg-canvas border border-line-soft flex items-center justify-center mx-auto mb-4">
            <Users className="w-6 h-6 text-ink-faint" />
          </div>
          <h3 className="text-[16px] font-bold text-ink tracking-[-0.02em] mb-1.5">
            {applications.length === 0
              ? 'No applications yet'
              : 'Nothing matches these filters'}
          </h3>
          <p className="text-ink-muted text-[14px]">
            {applications.length === 0
              ? 'Applications land here as soon as candidates apply.'
              : 'Try a different status or role.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {visible.map((app) => (
            <ApplicationCard
              key={app.id}
              app={app}
              busy={busy === app.id}
              onMove={move}
              onSchedule={() => setScheduling(app)}
            />
          ))}
        </div>
      )}

      {scheduling && (
        <ScheduleInterviewModal
          applicationId={scheduling.id}
          candidateName={scheduling.candidate.user.name}
          jobTitle={scheduling.job.title}
          onClose={() => setScheduling(null)}
          onScheduled={() => {
            setScheduling(null);
            void load();
          }}
        />
      )}
    </div>
  );
}

function ApplicationCard({
  app,
  busy,
  onMove,
  onSchedule,
}: {
  app: Application;
  busy: boolean;
  onMove: (id: string, status: string) => void;
  onSchedule: () => void;
}) {
  const { candidate } = app;
  const skills = candidate.skills.map((s) => s.skill.name).slice(0, 6);
  const resumeUrl = app.resume?.fileUrl ?? candidate.resumeUrl;

  return (
    <article className="surface sheen p-5 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-start gap-4">
        {candidate.user.profileImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={candidate.user.profileImage}
            alt=""
            className="w-12 h-12 rounded-[14px] object-cover border border-line shrink-0"
          />
        ) : (
          <span className="w-12 h-12 rounded-[14px] grad-brand flex items-center justify-center text-white text-[15px] font-bold shrink-0">
            {candidate.user.name[0]?.toUpperCase()}
          </span>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2.5">
            <h3 className="text-[16px] font-bold text-ink tracking-[-0.02em]">
              {candidate.user.name}
            </h3>
            <span
              className={`text-[10px] font-bold uppercase tracking-[0.08em] border rounded-full px-2.5 py-1 ${
                STATUS_STYLES[app.status] ?? 'bg-canvas text-ink-muted border-line'
              }`}
            >
              {STATUS_LABELS[app.status] ?? app.status}
            </span>
          </div>

          <p className="text-[13.5px] text-ink-muted mt-1">
            Applied for <span className="font-semibold text-ink-soft">{app.job.title}</span>
          </p>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[13px] text-ink-muted mt-3">
            {candidate.totalExperience && (
              <span className="inline-flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-ink-faint" />
                {candidate.totalExperience}
              </span>
            )}
            {candidate.currentCity && (
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-ink-faint" />
                {candidate.currentCity}
              </span>
            )}
            {candidate.expectedSalary != null && (
              <span className="inline-flex items-center gap-1.5">
                <IndianRupee className="w-3.5 h-3.5 text-ink-faint" />
                {formatINR(candidate.expectedSalary)} expected
              </span>
            )}
          </div>

          {skills.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {skills.map((s) => (
                <span
                  key={s}
                  className="text-[11.5px] font-medium bg-canvas border border-line-soft text-ink-soft rounded-full px-2.5 py-1"
                >
                  {s}
                </span>
              ))}
            </div>
          )}

          {app.interviews.length > 0 && (
            <p className="text-[12.5px] text-brand-700 bg-brand-50 border border-brand-100 rounded-[10px] px-3 py-2 mt-3 inline-block">
              Interview on{' '}
              {new Date(app.interviews[0].scheduledAt).toLocaleString('en-IN', {
                dateStyle: 'medium',
                timeStyle: 'short',
              })}
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 mt-5 pt-5 border-t border-line-soft">
        <Link
          href={`/recruiter/candidate-search?candidateId=${candidate.id}`}
          className="press inline-flex items-center gap-1.5 bg-white border border-line text-ink-soft hover:text-brand-700 hover:border-brand-200 rounded-[11px] px-3.5 py-2 text-[13px] font-semibold transition-all"
        >
          <Eye className="w-3.5 h-3.5" /> View profile
        </Link>

        {resumeUrl && (
          <a
            href={resumeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="press inline-flex items-center gap-1.5 bg-white border border-line text-ink-soft hover:text-brand-700 hover:border-brand-200 rounded-[11px] px-3.5 py-2 text-[13px] font-semibold transition-all"
          >
            <FileText className="w-3.5 h-3.5" /> Resume
          </a>
        )}

        <Action
          busy={busy}
          onClick={() => onMove(app.id, 'SCREENING')}
          icon={Eye}
          label="Under review"
          active={app.status === 'SCREENING'}
        />
        <Action
          busy={busy}
          onClick={() => onMove(app.id, 'SHORTLISTED')}
          icon={Star}
          label="Shortlist"
          active={app.status === 'SHORTLISTED'}
        />

        <button
          disabled={busy}
          onClick={onSchedule}
          className="press inline-flex items-center gap-1.5 bg-white border border-line text-ink-soft hover:text-brand-700 hover:border-brand-200 rounded-[11px] px-3.5 py-2 text-[13px] font-semibold transition-all disabled:opacity-50"
        >
          <CalendarPlus className="w-3.5 h-3.5" /> Schedule interview
        </button>

        <Action
          busy={busy}
          onClick={() => onMove(app.id, 'HIRED')}
          icon={Check}
          label="Select"
          tone="positive"
          active={app.status === 'HIRED'}
        />
        <Action
          busy={busy}
          onClick={() => onMove(app.id, 'REJECTED')}
          icon={X}
          label="Reject"
          tone="critical"
          active={app.status === 'REJECTED'}
        />
      </div>
    </article>
  );
}

function Action({
  busy,
  onClick,
  icon: Icon,
  label,
  tone = 'neutral',
  active,
}: {
  busy: boolean;
  onClick: () => void;
  icon: typeof Star;
  label: string;
  tone?: 'neutral' | 'positive' | 'critical';
  active?: boolean;
}) {
  const base =
    'press inline-flex items-center gap-1.5 rounded-[11px] px-3.5 py-2 text-[13px] font-semibold transition-all disabled:opacity-50 border';
  const styles = active
    ? tone === 'positive'
      ? 'bg-positive-soft border-[#BEE7D8] text-[#0A7A54]'
      : tone === 'critical'
        ? 'bg-critical-soft border-[#F3C9C9] text-[#B32B2B]'
        : 'bg-brand-50 border-brand-200 text-brand-700'
    : tone === 'positive'
      ? 'bg-white border-line text-ink-soft hover:text-[#0A7A54] hover:border-[#BEE7D8] hover:bg-positive-soft'
      : tone === 'critical'
        ? 'bg-white border-line text-ink-soft hover:text-[#B32B2B] hover:border-[#F3C9C9] hover:bg-critical-soft'
        : 'bg-white border-line text-ink-soft hover:text-brand-700 hover:border-brand-200';

  return (
    <button disabled={busy} onClick={onClick} className={`${base} ${styles}`}>
      <Icon className="w-3.5 h-3.5" /> {label}
    </button>
  );
}
