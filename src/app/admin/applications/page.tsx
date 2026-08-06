'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Download, FileText, Loader2, Trash2 } from 'lucide-react';
import { apiFetch } from '@/lib/http';
import { useAdminList } from '@/hooks/useAdminList';
import DataTable, { type Column } from '@/components/admin/DataTable';
import {
  EmptyState,
  FilterBar,
  PageHeader,
  SearchInput,
  Select,
  type PillTone,
} from '@/components/admin/ui';

interface Row {
  id: string;
  status: string;
  stage: string;
  appliedAt: string;
  candidate: {
    id: string;
    currentCity: string | null;
    totalExperience: string | null;
    user: { id: string; name: string; email: string; phone: string | null };
  };
  job: { id: string; title: string; company: { id: string; name: string } | null };
  interviews: Array<{ id: string; scheduledAt: string }>;
}

/** Mirrors the spec's seven statuses, in pipeline order. */
const STATUSES: Array<{ value: string; label: string; tone: PillTone }> = [
  { value: 'APPLIED', label: 'Applied', tone: 'brand' },
  { value: 'SCREENING', label: 'Under review', tone: 'caution' },
  { value: 'SHORTLISTED', label: 'Shortlisted', tone: 'brand' },
  { value: 'INTERVIEW', label: 'Interview scheduled', tone: 'brand' },
  { value: 'OFFERED', label: 'Selected', tone: 'positive' },
  { value: 'HIRED', label: 'Joined', tone: 'positive' },
  { value: 'REJECTED', label: 'Rejected', tone: 'critical' },
];

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

export default function AdminApplicationsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-7 h-7 text-brand-600 animate-spin" />
        </div>
      }
    >
      <AdminApplications />
    </Suspense>
  );
}

function AdminApplications() {
  const params = useSearchParams();

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState(params.get('status') ?? '');
  const [companyId, setCompanyId] = useState(params.get('companyId') ?? '');
  const [from, setFrom] = useState('');
  const [page, setPage] = useState(1);

  const [companies, setCompanies] = useState<Array<{ id: string; name: string }>>([]);
  const [busy, setBusy] = useState<string | null>(null);

  const { items, total, totalPages, loading, error, reload, setItems } = useAdminList<Row>(
    '/api/admin/applications',
    { search, status, companyId, from, page },
    { key: 'applications' }
  );

  useEffect(() => {
    setPage(1);
  }, [search, status, companyId, from]);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/admin/applications?limit=1')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!cancelled && d?.companies) setCompanies(d.companies);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  async function changeStatus(row: Row, next: string) {
    setBusy(row.id);
    const previous = items;
    setItems((list) => list.map((a) => (a.id === row.id ? { ...a, status: next } : a)));
    try {
      const res = await apiFetch('/api/admin/applications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: row.id, status: next }),
      });
      if (!res.ok) setItems(previous);
    } catch {
      setItems(previous);
    } finally {
      setBusy(null);
    }
  }

  async function remove(row: Row) {
    if (
      !window.confirm(
        `Delete ${row.candidate.user.name}'s application for "${row.job.title}"? This cannot be undone.`
      )
    ) {
      return;
    }
    setBusy(row.id);
    try {
      const res = await apiFetch(`/api/admin/applications?id=${row.id}`, { method: 'DELETE' });
      if (res.ok) void reload();
    } finally {
      setBusy(null);
    }
  }

  const columns: Array<Column<Row>> = [
    {
      key: 'candidate',
      header: 'Candidate',
      render: (r) => (
        <div className="min-w-0">
          <p className="font-semibold text-ink truncate">{r.candidate.user.name}</p>
          <p className="text-[12px] text-ink-muted truncate">{r.candidate.user.email}</p>
        </div>
      ),
    },
    {
      key: 'job',
      header: 'Applied for',
      render: (r) => (
        <div className="min-w-0">
          <p className="text-ink truncate">{r.job.title}</p>
          <p className="text-[12px] text-ink-muted truncate">
            {r.job.company?.name ?? 'No company'}
          </p>
        </div>
      ),
    },
    {
      key: 'experience',
      header: 'Experience',
      hideOnMobile: true,
      render: (r) => r.candidate.totalExperience || '—',
    },
    { key: 'appliedAt', header: 'Applied', hideOnMobile: true, render: (r) => fmtDate(r.appliedAt) },
    {
      key: 'status',
      header: 'Status',
      render: (r) => (
        <select
          value={r.status}
          disabled={busy === r.id}
          onChange={(e) => changeStatus(r, e.target.value)}
          aria-label={`Status for ${r.candidate.user.name}`}
          className="h-[34px] bg-white border border-line rounded-[9px] px-2.5 text-[12.5px] text-ink outline-none focus:border-brand-600 transition-colors disabled:opacity-50"
        >
          {STATUSES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      ),
    },
    {
      key: 'actions',
      header: '',
      className: 'text-right',
      render: (r) => (
        <button
          onClick={() => remove(r)}
          disabled={busy === r.id}
          aria-label="Delete application"
          className="p-2 rounded-[9px] border border-line bg-white text-ink-muted hover:text-[#B32B2B] hover:border-[#F3C9C9] transition-colors disabled:opacity-50"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      ),
    },
  ];

  const exportUrl = `/api/admin/applications?export=csv&${new URLSearchParams({
    search, status, companyId, from,
  })}`;

  return (
    <div className="space-y-5">
      <PageHeader
        title="Applications"
        subtitle={`${total} application${total === 1 ? '' : 's'} across the platform`}
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
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search by candidate or job…"
        />
        <Select
          value={status}
          onChange={setStatus}
          placeholder="Any status"
          aria-label="Filter by status"
          options={STATUSES.map((s) => ({ value: s.value, label: s.label }))}
        />
        <Select
          value={companyId}
          onChange={setCompanyId}
          placeholder="All companies"
          aria-label="Filter by company"
          options={companies.map((c) => ({ value: c.id, label: c.name }))}
        />
        <input
          type="date"
          value={from}
          onChange={(e) => setFrom(e.target.value)}
          aria-label="Applied on or after"
          className="h-[42px] bg-white border border-line rounded-[12px] px-3.5 text-[13.5px] text-ink outline-none focus:border-brand-600 transition-colors"
        />
      </FilterBar>

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
        empty={
          <EmptyState
            icon={FileText}
            title="No applications found"
            body="Try clearing a filter or widening the date range."
          />
        }
      />
    </div>
  );
}
