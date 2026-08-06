'use client';

import { Suspense, useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  Briefcase,
  Check,
  Copy,
  Download,
  Eye,
  Loader2,
  RotateCcw,
  Trash2,
  X,
  XCircle,
} from 'lucide-react';
import { apiFetch } from '@/lib/http';
import {
  EXPERIENCE_LEVELS,
  INDIAN_STATES,
  JOB_CATEGORIES,
  salaryRangeLabel,
} from '@/lib/automotive';
import { useAdminList } from '@/hooks/useAdminList';
import DataTable, { type Column } from '@/components/admin/DataTable';
import Drawer, { DetailRow, DetailSection } from '@/components/admin/Drawer';
import {
  ActionButton,
  EmptyState,
  FilterBar,
  PageHeader,
  SearchInput,
  Select,
  StatusPill,
  type PillTone,
} from '@/components/admin/ui';

interface Row {
  id: string;
  title: string;
  status: string;
  category: string | null;
  jobType: string;
  workMode: string;
  location: string | null;
  experience: string | null;
  minSalary: number | null;
  maxSalary: number | null;
  openings: number;
  views: number;
  deadline: string | null;
  createdAt: string;
  company: { id: string; name: string; logo: string | null } | null;
  recruiter: { user: { name: string; email: string } } | null;
  _count: { applications: number };
}

interface Detail extends Row {
  description: string;
  requirements: string | null;
  responsibilities: string | null;
  education: string | null;
  joiningTimeline: string | null;
  state: string | null;
  city: string | null;
  skills: string[];
  benefits: string[];
  applications: Array<{
    id: string;
    status: string;
    appliedAt: string;
    candidate: { id: string; user: { name: string } };
  }>;
}

const STATUS_TONE: Record<string, PillTone> = {
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

const STATUS_LABEL: Record<string, string> = {
  APPROVED: 'Live',
  PENDING: 'In review',
  DRAFT: 'Draft',
  CLOSED: 'Closed',
  REJECTED: 'Rejected',
};

const fmtDate = (iso: string | null) =>
  iso ? new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

export default function AdminJobsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-7 h-7 text-brand-600 animate-spin" />
        </div>
      }
    >
      <AdminJobs />
    </Suspense>
  );
}

function AdminJobs() {
  const params = useSearchParams();

  const [search, setSearch] = useState('');
  const [companyId, setCompanyId] = useState('');
  const [category, setCategory] = useState('');
  const [state, setState] = useState('');
  const [experience, setExperience] = useState('');
  const [status, setStatus] = useState(params.get('status') ?? '');
  const [minSalary, setMinSalary] = useState('');
  const [page, setPage] = useState(1);

  const [companies, setCompanies] = useState<Array<{ id: string; name: string }>>([]);
  const [detail, setDetail] = useState<Detail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');

  const { items, total, totalPages, loading, error, reload, setItems } = useAdminList<Row>(
    '/api/admin/jobs',
    { search, companyId, category, state, experience, status, minSalary, page },
    { key: 'jobs' }
  );

  useEffect(() => {
    setPage(1);
  }, [search, companyId, category, state, experience, status, minSalary]);

  // The company filter list ships with the first page of results.
  useEffect(() => {
    let cancelled = false;
    fetch('/api/admin/jobs?limit=1')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!cancelled && d?.companies) setCompanies(d.companies);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const open = useCallback(async (id: string) => {
    setDetailLoading(true);
    try {
      const res = await apiFetch('/api/admin/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      if (res.ok) setDetail(data.job);
    } finally {
      setDetailLoading(false);
    }
  }, []);

  async function setStatusFor(row: { id: string; title: string }, next: string) {
    const reason =
      next === 'REJECTED'
        ? window.prompt(`Why is "${row.title}" being rejected? The employer will see this.`) ??
          undefined
        : undefined;
    // A rejection with no explanation is worse than none at all.
    if (next === 'REJECTED' && reason === undefined) return;

    setBusy(true);
    setNotice('');
    try {
      const res = await apiFetch('/api/admin/jobs', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: row.id, action: 'status', status: next, reason }),
      });
      if (res.ok) {
        setItems((list) => list.map((j) => (j.id === row.id ? { ...j, status: next } : j)));
        setDetail((d) => (d && d.id === row.id ? { ...d, status: next } : d));
      }
    } finally {
      setBusy(false);
    }
  }

  async function duplicate(row: Row) {
    setBusy(true);
    setNotice('');
    try {
      const res = await apiFetch('/api/admin/jobs', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: row.id, action: 'duplicate' }),
      });
      if (res.ok) {
        setNotice(`Duplicated "${row.title}" as a draft.`);
        void reload();
      }
    } finally {
      setBusy(false);
    }
  }

  async function remove(row: Row | Detail) {
    const applicants = row._count.applications;
    const message =
      applicants > 0
        ? `"${row.title}" has ${applicants} applicant${applicants === 1 ? '' : 's'}. It will be closed rather than deleted so their history survives. Continue?`
        : `Delete "${row.title}"? This cannot be undone.`;
    if (!window.confirm(message)) return;

    setBusy(true);
    setNotice('');
    try {
      const res = await apiFetch(`/api/admin/jobs?id=${row.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok) {
        if (data.closed) setNotice(data.message);
        setDetail(null);
        void reload();
      }
    } finally {
      setBusy(false);
    }
  }

  const columns: Array<Column<Row>> = [
    {
      key: 'title',
      header: 'Job',
      render: (r) => (
        <div className="min-w-0">
          <p className="font-semibold text-ink truncate">{r.title}</p>
          <p className="text-[12px] text-ink-muted truncate">
            {r.company?.name ?? 'No company'} · {r.location ?? 'No location'}
          </p>
        </div>
      ),
    },
    {
      key: 'salary',
      header: 'Salary',
      hideOnMobile: true,
      render: (r) => salaryRangeLabel(r.minSalary, r.maxSalary),
    },
    { key: 'applications', header: 'Applied', render: (r) => r._count.applications },
    { key: 'views', header: 'Views', hideOnMobile: true, render: (r) => r.views },
    {
      key: 'status',
      header: 'Status',
      render: (r) => (
        <StatusPill label={STATUS_LABEL[r.status] ?? r.status} tone={STATUS_TONE[r.status] ?? 'neutral'} />
      ),
    },
    { key: 'createdAt', header: 'Posted', hideOnMobile: true, render: (r) => fmtDate(r.createdAt) },
    {
      key: 'actions',
      header: '',
      className: 'text-right',
      render: (r) => (
        <div className="inline-flex items-center gap-1.5">
          <button
            onClick={() => open(r.id)}
            aria-label={`View ${r.title}`}
            className="p-2 rounded-[9px] border border-line bg-white text-ink-muted hover:text-brand-700 hover:border-brand-200 transition-colors"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>
          {r.status === 'PENDING' && (
            <>
              <button
                onClick={() => setStatusFor(r, 'APPROVED')}
                disabled={busy}
                aria-label={`Approve ${r.title}`}
                className="p-2 rounded-[9px] border border-line bg-white text-ink-muted hover:text-[#0A7A54] hover:border-[#BEE7D8] transition-colors disabled:opacity-50"
              >
                <Check className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setStatusFor(r, 'REJECTED')}
                disabled={busy}
                aria-label={`Reject ${r.title}`}
                className="p-2 rounded-[9px] border border-line bg-white text-ink-muted hover:text-[#B32B2B] hover:border-[#F3C9C9] transition-colors disabled:opacity-50"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </>
          )}
          <button
            onClick={() => duplicate(r)}
            disabled={busy}
            aria-label={`Duplicate ${r.title}`}
            className="p-2 rounded-[9px] border border-line bg-white text-ink-muted hover:text-brand-700 hover:border-brand-200 transition-colors disabled:opacity-50"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => remove(r)}
            disabled={busy}
            aria-label={`Delete ${r.title}`}
            className="p-2 rounded-[9px] border border-line bg-white text-ink-muted hover:text-[#B32B2B] hover:border-[#F3C9C9] transition-colors disabled:opacity-50"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ];

  const exportUrl = `/api/admin/jobs?export=csv&${new URLSearchParams({
    search, companyId, category, state, experience, status, minSalary,
  })}`;

  return (
    <div className="space-y-5">
      <PageHeader
        title="Jobs"
        subtitle={`${total} job${total === 1 ? '' : 's'} on the platform`}
        action={
          <a
            href={exportUrl}
            className="press inline-flex items-center gap-2 bg-white border border-line text-ink font-semibold px-4 py-2.5 rounded-[12px] text-[13.5px] hover:border-brand-200 hover:text-brand-700 transition-all"
          >
            <Download className="w-4 h-4" /> Export CSV
          </a>
        }
      />

      <FilterBar>
        <SearchInput value={search} onChange={setSearch} placeholder="Search by title or company…" />
        <Select
          value={companyId}
          onChange={setCompanyId}
          placeholder="All companies"
          aria-label="Filter by company"
          options={companies.map((c) => ({ value: c.id, label: c.name }))}
        />
        <Select
          value={category}
          onChange={setCategory}
          placeholder="All categories"
          aria-label="Filter by category"
          options={JOB_CATEGORIES.map((c) => ({ value: c.id, label: c.label }))}
        />
        <Select
          value={state}
          onChange={setState}
          placeholder="All states"
          aria-label="Filter by state"
          options={INDIAN_STATES.map((s) => ({ value: s, label: s }))}
        />
        <Select
          value={experience}
          onChange={setExperience}
          placeholder="Any experience"
          aria-label="Filter by experience"
          options={EXPERIENCE_LEVELS.map((e) => ({ value: e, label: e }))}
        />
        <Select
          value={status}
          onChange={setStatus}
          placeholder="Any status"
          aria-label="Filter by status"
          options={Object.entries(STATUS_LABEL).map(([value, label]) => ({ value, label }))}
        />
        <input
          type="number"
          value={minSalary}
          onChange={(e) => setMinSalary(e.target.value)}
          placeholder="Min salary ₹"
          aria-label="Minimum salary"
          className="h-[42px] w-full sm:w-[150px] bg-white border border-line rounded-[12px] px-3.5 text-[13.5px] text-ink placeholder-ink-faint outline-none focus:border-brand-600 transition-colors"
        />
      </FilterBar>

      {notice && (
        <p className="bg-brand-50 border border-brand-100 text-brand-700 rounded-[12px] px-4 py-3 text-[13.5px]">
          {notice}
        </p>
      )}
      {error && (
        <p className="bg-critical-soft border border-critical/20 text-critical rounded-[12px] px-4 py-3 text-[13.5px] font-medium">
          {error}
        </p>
      )}

      <DataTable
        columns={columns}
        rows={items}
        rowKey={(r) => r.id}
        loading={loading}
        page={page}
        total={total}
        totalPages={totalPages}
        onPageChange={setPage}
        empty={<EmptyState icon={Briefcase} title="No jobs found" body="Try clearing a filter." />}
      />

      <Drawer
        open={Boolean(detail) || detailLoading}
        onClose={() => setDetail(null)}
        title={detail?.title ?? 'Loading…'}
        subtitle={detail?.company?.name ?? undefined}
        footer={
          detail && (
            <div className="flex flex-wrap items-center gap-2">
              {detail.status !== 'APPROVED' && (
                <ActionButton onClick={() => setStatusFor(detail, 'APPROVED')} disabled={busy}>
                  <Check className="w-3.5 h-3.5" /> Approve
                </ActionButton>
              )}
              {detail.status !== 'REJECTED' && detail.status !== 'CLOSED' && (
                <ActionButton onClick={() => setStatusFor(detail, 'REJECTED')} disabled={busy}>
                  <X className="w-3.5 h-3.5" /> Reject
                </ActionButton>
              )}
              {detail.status !== 'CLOSED' ? (
                <ActionButton onClick={() => setStatusFor(detail, 'CLOSED')} disabled={busy}>
                  <XCircle className="w-3.5 h-3.5" /> Close
                </ActionButton>
              ) : (
                <ActionButton onClick={() => setStatusFor(detail, 'APPROVED')} disabled={busy}>
                  <RotateCcw className="w-3.5 h-3.5" /> Reopen
                </ActionButton>
              )}
              <ActionButton tone="critical" onClick={() => remove(detail)} disabled={busy}>
                <Trash2 className="w-3.5 h-3.5" /> Delete
              </ActionButton>
            </div>
          )
        }
      >
        {detailLoading && !detail ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 text-brand-600 animate-spin" />
          </div>
        ) : detail ? (
          <JobDetail detail={detail} />
        ) : null}
      </Drawer>
    </div>
  );
}

function JobDetail({ detail }: { detail: Detail }) {
  return (
    <>
      <DetailSection title="Overview">
        <DetailRow label="Status">
          <StatusPill
            label={STATUS_LABEL[detail.status] ?? detail.status}
            tone={STATUS_TONE[detail.status] ?? 'neutral'}
          />
        </DetailRow>
        <DetailRow label="Company">{detail.company?.name}</DetailRow>
        <DetailRow label="Posted by">
          {detail.recruiter?.user.name}
          {detail.recruiter?.user.email ? ` · ${detail.recruiter.user.email}` : ''}
        </DetailRow>
        <DetailRow label="Location">{detail.location}</DetailRow>
        <DetailRow label="Type">
          {detail.jobType} · {detail.workMode}
        </DetailRow>
        <DetailRow label="Experience">{detail.experience}</DetailRow>
        <DetailRow label="Qualification">{detail.education}</DetailRow>
        <DetailRow label="Salary">
          {salaryRangeLabel(detail.minSalary, detail.maxSalary)}
        </DetailRow>
        <DetailRow label="Openings">{detail.openings}</DetailRow>
        <DetailRow label="Joining">{detail.joiningTimeline}</DetailRow>
        <DetailRow label="Posted">{fmtDate(detail.createdAt)}</DetailRow>
        <DetailRow label="Deadline">{fmtDate(detail.deadline)}</DetailRow>
        <DetailRow label="Views">{detail.views}</DetailRow>
      </DetailSection>

      <DetailSection title="Description">
        <p className="text-[13px] text-ink-soft leading-[1.7] whitespace-pre-wrap">
          {detail.description}
        </p>
      </DetailSection>

      {detail.responsibilities && (
        <DetailSection title="Responsibilities">
          <p className="text-[13px] text-ink-soft leading-[1.7] whitespace-pre-wrap">
            {detail.responsibilities}
          </p>
        </DetailSection>
      )}

      {detail.requirements && (
        <DetailSection title="Requirements">
          <p className="text-[13px] text-ink-soft leading-[1.7] whitespace-pre-wrap">
            {detail.requirements}
          </p>
        </DetailSection>
      )}

      {detail.skills.length > 0 && (
        <DetailSection title="Skills">
          <Chips items={detail.skills} />
        </DetailSection>
      )}

      {detail.benefits.length > 0 && (
        <DetailSection title="Benefits">
          <Chips items={detail.benefits} />
        </DetailSection>
      )}

      <DetailSection title={`Applicants (${detail._count.applications})`}>
        {detail.applications.length === 0 ? (
          <p className="text-[13px] text-ink-faint">No applications yet.</p>
        ) : (
          <ul className="space-y-1.5">
            {detail.applications.map((a) => (
              <li key={a.id} className="flex items-center justify-between gap-3 text-[12.5px]">
                <span className="text-ink-soft truncate">{a.candidate.user.name}</span>
                <span className="flex items-center gap-2 shrink-0">
                  <span className="text-ink-faint">{fmtDate(a.appliedAt)}</span>
                  <StatusPill label={a.status} tone={APP_STATUS_TONE[a.status] ?? 'neutral'} />
                </span>
              </li>
            ))}
          </ul>
        )}
      </DetailSection>

      <Link
        href={`/jobs/${detail.id}`}
        className="text-[13px] font-semibold text-brand-600 hover:text-brand-700"
      >
        View public job page
      </Link>
    </>
  );
}

function Chips({ items }: { items: string[] }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((s) => (
        <span
          key={s}
          className="text-[11.5px] font-medium bg-canvas border border-line-soft text-ink-soft rounded-full px-2.5 py-1"
        >
          {s}
        </span>
      ))}
    </div>
  );
}
