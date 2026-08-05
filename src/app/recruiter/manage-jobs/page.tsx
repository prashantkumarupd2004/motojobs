'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Briefcase,
  Copy,
  Eye,
  Loader2,
  MapPin,
  Pencil,
  Plus,
  Search,
  Send,
  Trash2,
  Users,
  XCircle,
} from 'lucide-react';
import { apiFetch } from '@/lib/http';
import { salaryRangeLabel } from '@/lib/automotive';

interface Job {
  id: string;
  title: string;
  location: string | null;
  jobType: string;
  workMode: string;
  status: string;
  minSalary: number | null;
  maxSalary: number | null;
  views: number;
  createdAt: string;
  deadline: string | null;
  _count?: { applications: number };
}

const FILTERS = [
  { key: 'ALL', label: 'All' },
  { key: 'APPROVED', label: 'Live' },
  { key: 'PENDING', label: 'In review' },
  { key: 'DRAFT', label: 'Drafts' },
  { key: 'CLOSED', label: 'Closed' },
] as const;

const STATUS_STYLES: Record<string, string> = {
  APPROVED: 'bg-positive-soft text-[#0A7A54] border-[#BEE7D8]',
  PENDING: 'bg-caution-soft text-[#9A5D00] border-[#F3DBB4]',
  DRAFT: 'bg-canvas text-ink-muted border-line',
  CLOSED: 'bg-canvas text-ink-muted border-line',
  REJECTED: 'bg-critical-soft text-[#B32B2B] border-[#F3C9C9]',
};

const STATUS_LABELS: Record<string, string> = {
  APPROVED: 'Live',
  PENDING: 'In review',
  DRAFT: 'Draft',
  CLOSED: 'Closed',
  REJECTED: 'Rejected',
};

export default function ManageJobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<string>('ALL');
  const [notice, setNotice] = useState('');

  useEffect(() => {
    let cancelled = false;
    fetch('/api/recruiter/jobs')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!cancelled && data) setJobs(data.jobs ?? []);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function setStatus(job: Job, status: string) {
    setBusy(job.id);
    setNotice('');
    try {
      const res = await apiFetch('/api/recruiter/jobs', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: job.id, action: 'status', status }),
      });
      if (res.ok) {
        setJobs((list) => list.map((j) => (j.id === job.id ? { ...j, status } : j)));
      }
    } finally {
      setBusy(null);
    }
  }

  async function duplicate(job: Job) {
    setBusy(job.id);
    setNotice('');
    try {
      const res = await apiFetch('/api/recruiter/jobs', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: job.id, action: 'duplicate' }),
      });
      const data = await res.json();
      if (res.ok && data.job) {
        setJobs((list) => [data.job, ...list]);
        setNotice(`Duplicated "${job.title}" as a draft.`);
      }
    } finally {
      setBusy(null);
    }
  }

  async function remove(job: Job) {
    const applicants = job._count?.applications ?? 0;
    const message =
      applicants > 0
        ? `"${job.title}" has ${applicants} applicant${applicants === 1 ? '' : 's'}. It will be closed rather than deleted so their history survives. Continue?`
        : `Delete "${job.title}"? This cannot be undone.`;
    if (!window.confirm(message)) return;

    setBusy(job.id);
    setNotice('');
    try {
      const res = await apiFetch(`/api/recruiter/jobs?id=${job.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) return;
      if (data.closed) {
        setJobs((list) =>
          list.map((j) => (j.id === job.id ? { ...j, status: 'CLOSED' } : j))
        );
        setNotice(data.message);
      } else {
        setJobs((list) => list.filter((j) => j.id !== job.id));
      }
    } finally {
      setBusy(null);
    }
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return jobs.filter((j) => {
      const matchesSearch =
        !q ||
        j.title.toLowerCase().includes(q) ||
        (j.location ?? '').toLowerCase().includes(q);
      const matchesFilter = filter === 'ALL' || j.status === filter;
      return matchesSearch && matchesFilter;
    });
  }, [jobs, search, filter]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-7 h-7 text-brand-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-[26px] sm:text-[28px] font-extrabold text-ink tracking-[-0.035em]">
            Manage Jobs
          </h1>
          <p className="text-ink-muted text-[14.5px] mt-1.5">
            {jobs.length} job{jobs.length === 1 ? '' : 's'} posted
          </p>
        </div>
        <Link
          href="/recruiter/post-job"
          className="sweep press inline-flex shrink-0 items-center justify-center gap-2 grad-brand text-white font-semibold px-6 py-3 rounded-[14px] text-[14px] shadow-brand hover:-translate-y-0.5 hover:shadow-e4 transition-all duration-300"
        >
          <Plus className="w-4 h-4" /> Post New Job
        </Link>
      </div>

      {notice && (
        <p className="text-[13.5px] text-brand-700 bg-brand-50 border border-brand-100 rounded-[12px] px-4 py-3">
          {notice}
        </p>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-faint pointer-events-none" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title or location…"
            className="w-full bg-white border border-line rounded-[12px] pl-11 pr-4 py-2.5 text-[13.5px] text-ink placeholder-ink-faint outline-none focus:border-brand-600 focus:shadow-[0_0_0_4px_rgba(15,76,129,0.10)] transition-all duration-300"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto scroll-none">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`press shrink-0 px-4 py-2.5 rounded-[12px] text-[12.5px] font-semibold border transition-all duration-300 ${
                filter === f.key
                  ? 'grad-brand text-white border-transparent shadow-brand'
                  : 'bg-white border-line text-ink-muted hover:border-brand-200 hover:text-brand-700'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="surface sheen text-center py-16 px-6">
          <div className="w-14 h-14 rounded-[18px] bg-canvas border border-line-soft flex items-center justify-center mx-auto mb-4">
            <Briefcase className="w-6 h-6 text-ink-faint" />
          </div>
          <h3 className="text-[16px] font-bold text-ink tracking-[-0.02em] mb-1.5">
            {jobs.length === 0 ? 'No jobs posted yet' : 'No results found'}
          </h3>
          <p className="text-ink-muted text-[14px]">
            {jobs.length === 0
              ? 'Create your first job listing to start hiring.'
              : 'Try a different search or filter.'}
          </p>
          {jobs.length === 0 && (
            <Link
              href="/recruiter/post-job"
              className="sweep press mt-6 inline-flex items-center gap-2 grad-brand text-white font-semibold px-6 py-3 rounded-[14px] text-[14px] shadow-brand hover:-translate-y-0.5 transition-all duration-300"
            >
              <Plus className="w-4 h-4" /> Post your first job
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((job) => {
            const applicants = job._count?.applications ?? 0;
            const disabled = busy === job.id;

            return (
              <article key={job.id} className="surface sheen p-5 sm:p-6">
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-5">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2.5 flex-wrap mb-2">
                      <h3 className="text-[16.5px] font-bold text-ink tracking-[-0.025em]">
                        {job.title}
                      </h3>
                      <span
                        className={`text-[10px] font-bold uppercase tracking-[0.08em] border rounded-full px-2.5 py-1 ${
                          STATUS_STYLES[job.status] ?? STATUS_STYLES.CLOSED
                        }`}
                      >
                        {STATUS_LABELS[job.status] ?? job.status}
                      </span>
                    </div>

                    <div className="flex items-center gap-x-5 gap-y-2 text-[13px] text-ink-muted flex-wrap">
                      <span className="flex items-center gap-1.5 min-w-0">
                        <MapPin className="w-3.5 h-3.5 text-ink-faint shrink-0" />
                        <span className="truncate">{job.location || 'Location not set'}</span>
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Briefcase className="w-3.5 h-3.5 text-ink-faint shrink-0" />
                        {job.jobType} · {job.workMode}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-ink-faint shrink-0" />
                        {applicants} applicant{applicants === 1 ? '' : 's'}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Eye className="w-3.5 h-3.5 text-ink-faint shrink-0" />
                        {job.views} view{job.views === 1 ? '' : 's'}
                      </span>
                      <span className="font-semibold text-ink-soft">
                        {salaryRangeLabel(job.minSalary, job.maxSalary)}
                      </span>
                    </div>

                    <p className="text-[12.5px] text-ink-faint mt-3">
                      Posted {new Date(job.createdAt).toLocaleDateString('en-IN')}
                      {job.deadline &&
                        ` · Deadline ${new Date(job.deadline).toLocaleDateString('en-IN')}`}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 mt-5 pt-5 border-t border-line-soft">
                  <Link
                    href={`/recruiter/applications?jobId=${job.id}`}
                    className="press inline-flex items-center gap-1.5 bg-white border border-line text-ink-soft hover:text-brand-700 hover:border-brand-200 rounded-[11px] px-3.5 py-2 text-[13px] font-semibold transition-all"
                  >
                    <Users className="w-3.5 h-3.5" /> View applications
                  </Link>

                  <Link
                    href={`/jobs/${job.id}`}
                    className="press inline-flex items-center gap-1.5 bg-white border border-line text-ink-soft hover:text-brand-700 hover:border-brand-200 rounded-[11px] px-3.5 py-2 text-[13px] font-semibold transition-all"
                  >
                    <Pencil className="w-3.5 h-3.5" /> Edit
                  </Link>

                  <button
                    disabled={disabled}
                    onClick={() => duplicate(job)}
                    className="press inline-flex items-center gap-1.5 bg-white border border-line text-ink-soft hover:text-brand-700 hover:border-brand-200 rounded-[11px] px-3.5 py-2 text-[13px] font-semibold transition-all disabled:opacity-50"
                  >
                    <Copy className="w-3.5 h-3.5" /> Duplicate
                  </button>

                  {job.status === 'DRAFT' && (
                    <button
                      disabled={disabled}
                      onClick={() => setStatus(job, 'PENDING')}
                      className="press inline-flex items-center gap-1.5 bg-white border border-line text-ink-soft hover:text-brand-700 hover:border-brand-200 rounded-[11px] px-3.5 py-2 text-[13px] font-semibold transition-all disabled:opacity-50"
                    >
                      <Send className="w-3.5 h-3.5" /> Publish
                    </button>
                  )}

                  {job.status !== 'CLOSED' && job.status !== 'DRAFT' && (
                    <button
                      disabled={disabled}
                      onClick={() => setStatus(job, 'CLOSED')}
                      className="press inline-flex items-center gap-1.5 bg-white border border-line text-ink-soft hover:text-brand-700 hover:border-brand-200 rounded-[11px] px-3.5 py-2 text-[13px] font-semibold transition-all disabled:opacity-50"
                    >
                      <XCircle className="w-3.5 h-3.5" /> Close job
                    </button>
                  )}

                  <button
                    disabled={disabled}
                    onClick={() => remove(job)}
                    className="press inline-flex items-center gap-1.5 bg-white border border-line text-ink-soft hover:text-[#B32B2B] hover:border-[#F3C9C9] hover:bg-critical-soft rounded-[11px] px-3.5 py-2 text-[13px] font-semibold transition-all disabled:opacity-50"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Delete
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
