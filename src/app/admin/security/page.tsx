'use client';

import { useCallback, useEffect, useState } from 'react';
import { AlertTriangle, ShieldCheck } from 'lucide-react';
import DataTable, { type Column } from '@/components/admin/DataTable';
import {
  EmptyState,
  FilterBar,
  PageHeader,
  SearchInput,
  Select,
  StatCard,
  StatusPill,
} from '@/components/admin/ui';

interface LoginRow {
  id: string;
  email: string;
  success: boolean;
  failReason: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
  user: { name: string; role: string } | null;
}

interface ActivityRow {
  id: string;
  action: string;
  entityType: string | null;
  entityId: string | null;
  metadata: Record<string, unknown>;
  ipAddress: string | null;
  createdAt: string;
  actor: { name: string; email: string } | null;
}

interface ErrorRow {
  id: string;
  message: string;
  source: string | null;
  method: string | null;
  path: string | null;
  resolvedAt: string | null;
  createdAt: string;
}

type View = 'logins' | 'activity' | 'errors';

const fmtDateTime = (iso: string) =>
  new Date(iso).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });

export default function AdminSecurityPage() {
  const [view, setView] = useState<View>('logins');
  const [search, setSearch] = useState('');
  const [outcome, setOutcome] = useState('');
  const [page, setPage] = useState(1);

  const [logins, setLogins] = useState<LoginRow[]>([]);
  const [activity, setActivity] = useState<ActivityRow[]>([]);
  const [errors, setErrors] = useState<ErrorRow[]>([]);
  const [failedToday, setFailedToday] = useState(0);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError('');
    const params = new URLSearchParams({ view, page: String(page) });
    if (search) params.set('search', search);
    if (view === 'logins' && outcome) params.set('outcome', outcome);

    try {
      const res = await fetch(`/api/admin/security?${params}`);
      const data = await res.json();
      if (!res.ok) {
        setLoadError(data.error ?? 'Could not load logs');
        return;
      }
      if (view === 'logins') {
        setLogins(data.logins ?? []);
        setFailedToday(data.failedToday ?? 0);
      } else if (view === 'activity') {
        setActivity(data.logs ?? []);
      } else {
        setErrors(data.errors ?? []);
      }
      setTotal(data.total ?? 0);
      setTotalPages(data.totalPages ?? 1);
    } catch {
      setLoadError('Could not load logs');
    } finally {
      setLoading(false);
    }
  }, [view, page, search, outcome]);

  useEffect(() => {
    const timer = setTimeout(load, 250);
    return () => clearTimeout(timer);
  }, [load]);

  useEffect(() => {
    setPage(1);
  }, [view, search, outcome]);

  const loginColumns: Array<Column<LoginRow>> = [
    {
      key: 'email',
      header: 'Account',
      render: (r) => (
        <div className="min-w-0">
          <p className="font-semibold text-ink truncate">{r.user?.name ?? r.email}</p>
          <p className="text-[12px] text-ink-muted truncate">{r.email}</p>
        </div>
      ),
    },
    { key: 'role', header: 'Role', hideOnMobile: true, render: (r) => r.user?.role ?? '—' },
    { key: 'ip', header: 'IP', hideOnMobile: true, render: (r) => r.ipAddress ?? '—' },
    {
      key: 'outcome',
      header: 'Result',
      render: (r) =>
        r.success ? (
          <StatusPill label="Success" tone="positive" />
        ) : (
          <StatusPill label={r.failReason ?? 'Failed'} tone="critical" />
        ),
    },
    { key: 'createdAt', header: 'When', render: (r) => fmtDateTime(r.createdAt) },
  ];

  const activityColumns: Array<Column<ActivityRow>> = [
    { key: 'action', header: 'Action', render: (r) => <code className="text-[12.5px]">{r.action}</code> },
    {
      key: 'actor',
      header: 'By',
      render: (r) => r.actor?.name ?? 'System',
    },
    {
      key: 'entity',
      header: 'Target',
      hideOnMobile: true,
      render: (r) => (r.entityType ? `${r.entityType} · ${r.entityId?.slice(0, 8) ?? ''}` : '—'),
    },
    { key: 'ip', header: 'IP', hideOnMobile: true, render: (r) => r.ipAddress ?? '—' },
    { key: 'createdAt', header: 'When', render: (r) => fmtDateTime(r.createdAt) },
  ];

  const errorColumns: Array<Column<ErrorRow>> = [
    {
      key: 'message',
      header: 'Error',
      render: (r) => (
        <div className="min-w-0">
          <p className="font-semibold text-ink truncate">{r.message}</p>
          {r.path && <p className="text-[12px] text-ink-muted truncate">{r.method} {r.path}</p>}
        </div>
      ),
    },
    { key: 'source', header: 'Source', hideOnMobile: true, render: (r) => r.source ?? '—' },
    {
      key: 'resolved',
      header: 'Status',
      render: (r) =>
        r.resolvedAt ? (
          <StatusPill label="Triaged" tone="positive" />
        ) : (
          <StatusPill label="Open" tone="critical" />
        ),
    },
    { key: 'createdAt', header: 'When', render: (r) => fmtDateTime(r.createdAt) },
  ];

  return (
    <div className="space-y-5">
      <PageHeader title="Security & Logs" subtitle="Sign-ins, admin actions and server errors" />

      {view === 'logins' && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Records" value={total} />
          <StatCard
            label="Failed (24h)"
            value={failedToday}
            tone={failedToday > 20 ? 'critical' : 'neutral'}
            icon={failedToday > 20 ? AlertTriangle : undefined}
          />
        </div>
      )}

      <div className="flex gap-2 overflow-x-auto scroll-none">
        {(
          [
            ['logins', 'Login history'],
            ['activity', 'Admin activity'],
            ['errors', 'Website errors'],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setView(key)}
            className={`press shrink-0 px-4 py-2.5 rounded-[12px] text-[12.5px] font-semibold border transition-all duration-300 ${
              view === key
                ? 'grad-brand text-white border-transparent shadow-brand'
                : 'bg-white border-line text-ink-muted hover:border-brand-200 hover:text-brand-700'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {view !== 'errors' && (
        <FilterBar>
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder={view === 'logins' ? 'Search by email…' : 'Search by action…'}
          />
          {view === 'logins' && (
            <Select
              value={outcome}
              onChange={setOutcome}
              placeholder="Any result"
              aria-label="Filter by result"
              options={[
                { value: 'success', label: 'Successful' },
                { value: 'failed', label: 'Failed' },
              ]}
            />
          )}
        </FilterBar>
      )}

      {loadError && (
        <p className="bg-critical-soft border border-critical/20 text-critical rounded-[12px] px-4 py-3 text-[13.5px] font-medium">
          {loadError}
        </p>
      )}

      {view === 'logins' && (
        <DataTable
          columns={loginColumns}
          rows={logins}
          rowKey={(r) => r.id}
          loading={loading}
          page={page}
          total={total}
          totalPages={totalPages}
          onPageChange={setPage}
          empty={
            <EmptyState
              icon={ShieldCheck}
              title="No sign-ins recorded"
              body="Login attempts appear here as users sign in."
            />
          }
        />
      )}

      {view === 'activity' && (
        <DataTable
          columns={activityColumns}
          rows={activity}
          rowKey={(r) => r.id}
          loading={loading}
          page={page}
          total={total}
          totalPages={totalPages}
          onPageChange={setPage}
          empty={
            <EmptyState
              icon={ShieldCheck}
              title="No admin activity yet"
              body="Privileged actions are recorded here as you take them."
            />
          }
        />
      )}

      {view === 'errors' && (
        <DataTable
          columns={errorColumns}
          rows={errors}
          rowKey={(r) => r.id}
          loading={loading}
          page={page}
          total={total}
          totalPages={totalPages}
          onPageChange={setPage}
          empty={
            <EmptyState
              icon={ShieldCheck}
              title="No errors logged"
              body="Unhandled server errors would be listed here."
            />
          }
        />
      )}
    </div>
  );
}
