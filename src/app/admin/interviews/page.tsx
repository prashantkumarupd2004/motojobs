'use client';

import { useEffect, useState } from 'react';
import { CalendarCheck, Clock, Loader2, MapPin, Phone, Video, X } from 'lucide-react';
import { apiFetch } from '@/lib/http';
import { useAdminList } from '@/hooks/useAdminList';
import DataTable, { type Column } from '@/components/admin/DataTable';
import {
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
  scheduledAt: string;
  durationMins: number;
  mode: string;
  venue: string | null;
  notes: string | null;
  status: string;
  outcome: string | null;
  job: { id: string; title: string };
  company: { id: string; name: string };
  application: {
    id: string;
    candidate: { id: string; user: { name: string; email: string; phone: string | null } };
  };
}

const STATUS_TONE: Record<string, PillTone> = {
  SCHEDULED: 'brand',
  COMPLETED: 'positive',
  CANCELLED: 'critical',
};

const MODE_ICON: Record<string, typeof Video> = {
  IN_PERSON: MapPin,
  PHONE: Phone,
  VIDEO: Video,
};

const MODE_LABEL: Record<string, string> = {
  IN_PERSON: 'In person',
  PHONE: 'Phone',
  VIDEO: 'Video',
};

const fmtDateTime = (iso: string) =>
  new Date(iso).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });

/** `datetime-local` has no timezone, so `new Date()` reads it as local time. */
function promptForDate(current: string): string | null {
  const d = new Date(current);
  const pad = (n: number) => String(n).padStart(2, '0');
  const input = window.prompt(
    'New date and time (YYYY-MM-DD HH:MM)',
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
  );
  if (!input) return null;
  const next = new Date(input.replace(' ', 'T'));
  if (Number.isNaN(next.getTime())) {
    window.alert('That date could not be read. Use the format YYYY-MM-DD HH:MM.');
    return null;
  }
  return next.toISOString();
}

export default function AdminInterviewsPage() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [companyId, setCompanyId] = useState('');
  const [when, setWhen] = useState('');
  const [page, setPage] = useState(1);

  const [companies, setCompanies] = useState<Array<{ id: string; name: string }>>([]);
  const [busy, setBusy] = useState<string | null>(null);

  const { items, total, totalPages, loading, error, reload } = useAdminList<Row>(
    '/api/admin/interviews',
    { search, status, companyId, when, page },
    { key: 'interviews' }
  );

  useEffect(() => {
    setPage(1);
  }, [search, status, companyId, when]);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/admin/interviews?limit=1')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!cancelled && d?.companies) setCompanies(d.companies);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  async function act(row: Row, action: 'cancel' | 'complete' | 'reschedule') {
    let scheduledAt: string | undefined;
    if (action === 'reschedule') {
      const picked = promptForDate(row.scheduledAt);
      if (!picked) return;
      scheduledAt = picked;
    }
    if (
      action === 'cancel' &&
      !window.confirm(
        `Cancel the interview with ${row.application.candidate.user.name}? They will be notified.`
      )
    ) {
      return;
    }

    setBusy(row.id);
    try {
      const res = await apiFetch('/api/admin/interviews', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: row.id, action, scheduledAt }),
      });
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
          <p className="font-semibold text-ink truncate">{r.application.candidate.user.name}</p>
          <p className="text-[12px] text-ink-muted truncate">{r.job.title}</p>
        </div>
      ),
    },
    { key: 'company', header: 'Company', hideOnMobile: true, render: (r) => r.company.name },
    {
      key: 'when',
      header: 'Scheduled',
      render: (r) => (
        <span className="whitespace-nowrap">{fmtDateTime(r.scheduledAt)}</span>
      ),
    },
    {
      key: 'mode',
      header: 'Mode',
      hideOnMobile: true,
      render: (r) => {
        const Icon = MODE_ICON[r.mode] ?? MapPin;
        return (
          <span className="inline-flex items-center gap-1.5">
            <Icon className="w-3.5 h-3.5 text-ink-faint" />
            {MODE_LABEL[r.mode] ?? r.mode} · {r.durationMins}m
          </span>
        );
      },
    },
    {
      key: 'status',
      header: 'Status',
      render: (r) => <StatusPill label={r.status} tone={STATUS_TONE[r.status] ?? 'neutral'} />,
    },
    {
      key: 'actions',
      header: '',
      className: 'text-right',
      render: (r) =>
        r.status === 'SCHEDULED' ? (
          <div className="inline-flex items-center gap-1.5">
            <button
              onClick={() => act(r, 'complete')}
              disabled={busy === r.id}
              aria-label="Mark completed"
              className="p-2 rounded-[9px] border border-line bg-white text-ink-muted hover:text-[#0A7A54] hover:border-[#BEE7D8] transition-colors disabled:opacity-50"
            >
              <CalendarCheck className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => act(r, 'reschedule')}
              disabled={busy === r.id}
              aria-label="Reschedule"
              className="p-2 rounded-[9px] border border-line bg-white text-ink-muted hover:text-brand-700 hover:border-brand-200 transition-colors disabled:opacity-50"
            >
              <Clock className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => act(r, 'cancel')}
              disabled={busy === r.id}
              aria-label="Cancel"
              className="p-2 rounded-[9px] border border-line bg-white text-ink-muted hover:text-[#B32B2B] hover:border-[#F3C9C9] transition-colors disabled:opacity-50"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <span className="text-[12px] text-ink-faint">—</span>
        ),
    },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        title="Interviews"
        subtitle={`${total} interview${total === 1 ? '' : 's'} scheduled across the platform`}
      />

      <FilterBar>
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search by candidate or job…"
        />
        <Select
          value={when}
          onChange={setWhen}
          placeholder="All dates"
          aria-label="Filter by date"
          options={[
            { value: 'upcoming', label: 'Upcoming' },
            { value: 'past', label: 'Past' },
          ]}
        />
        <Select
          value={status}
          onChange={setStatus}
          placeholder="Any status"
          aria-label="Filter by status"
          options={[
            { value: 'SCHEDULED', label: 'Scheduled' },
            { value: 'COMPLETED', label: 'Completed' },
            { value: 'CANCELLED', label: 'Cancelled' },
          ]}
        />
        <Select
          value={companyId}
          onChange={setCompanyId}
          placeholder="All companies"
          aria-label="Filter by company"
          options={companies.map((c) => ({ value: c.id, label: c.name }))}
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
            icon={CalendarCheck}
            title="No interviews found"
            body="Interviews appear here once employers start scheduling them."
          />
        }
      />
    </div>
  );
}
