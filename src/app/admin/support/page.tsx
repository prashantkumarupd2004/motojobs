'use client';

import { useCallback, useEffect, useState } from 'react';
import { LifeBuoy, Loader2 } from 'lucide-react';
import { apiFetch } from '@/lib/http';
import { useAdminList } from '@/hooks/useAdminList';
import DataTable, { type Column } from '@/components/admin/DataTable';
import Drawer, { DetailRow, DetailSection } from '@/components/admin/Drawer';
import {
  ADMIN_TEXTAREA,
  ActionButton,
  EmptyState,
  FilterBar,
  PageHeader,
  SearchInput,
  Select,
  StatCard,
  StatusPill,
  type PillTone,
} from '@/components/admin/ui';

interface Ticket {
  id: string;
  subject: string;
  description: string;
  status: string;
  priority: string;
  category: string | null;
  adminNotes: string | null;
  resolvedAt: string | null;
  createdAt: string;
  user: { id: string; name: string; email: string; role: string };
}

const STATUS_TONE: Record<string, PillTone> = {
  OPEN: 'caution',
  IN_PROGRESS: 'brand',
  RESOLVED: 'positive',
  CLOSED: 'neutral',
};

const STATUS_LABEL: Record<string, string> = {
  OPEN: 'Open',
  IN_PROGRESS: 'In progress',
  RESOLVED: 'Resolved',
  CLOSED: 'Closed',
};

const CATEGORY_LABEL: Record<string, string> = {
  CONTACT: 'Contact message',
  FEEDBACK: 'Feedback',
  BUG: 'Bug report',
  OTHER: 'Other',
};

const fmtDateTime = (iso: string) =>
  new Date(iso).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });

export default function AdminSupportPage() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(1);

  const [counts, setCounts] = useState<Record<string, number>>({});
  const [detail, setDetail] = useState<Ticket | null>(null);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const { items, total, totalPages, loading, error, reload } = useAdminList<Ticket>(
    '/api/admin/support',
    { search, status, category, page },
    { key: 'tickets' }
  );

  useEffect(() => {
    setPage(1);
  }, [search, status, category]);

  const loadCounts = useCallback(() => {
    fetch('/api/admin/support?limit=1')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d?.counts && setCounts(d.counts))
      .catch(() => {});
  }, []);

  useEffect(loadCounts, [loadCounts]);

  function open(ticket: Ticket) {
    setDetail(ticket);
    setNotes(ticket.adminNotes ?? '');
  }

  async function update(ticket: Ticket, nextStatus?: string) {
    setSaving(true);
    try {
      const res = await apiFetch('/api/admin/support', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: ticket.id,
          ...(nextStatus ? { status: nextStatus } : {}),
          adminNotes: notes,
        }),
      });
      if (res.ok) {
        setDetail(null);
        void reload();
        loadCounts();
      }
    } finally {
      setSaving(false);
    }
  }

  const columns: Array<Column<Ticket>> = [
    {
      key: 'subject',
      header: 'Ticket',
      render: (r) => (
        <button onClick={() => open(r)} className="text-left min-w-0 w-full">
          <p className="font-semibold text-ink truncate">{r.subject}</p>
          <p className="text-[12px] text-ink-muted truncate">{r.description}</p>
        </button>
      ),
    },
    {
      key: 'user',
      header: 'From',
      render: (r) => (
        <div className="min-w-0">
          <p className="text-ink truncate">{r.user.name}</p>
          <p className="text-[12px] text-ink-muted truncate">{r.user.email}</p>
        </div>
      ),
    },
    {
      key: 'category',
      header: 'Type',
      hideOnMobile: true,
      render: (r) => (r.category ? (CATEGORY_LABEL[r.category] ?? r.category) : '—'),
    },
    {
      key: 'status',
      header: 'Status',
      render: (r) => (
        <StatusPill
          label={STATUS_LABEL[r.status] ?? r.status}
          tone={STATUS_TONE[r.status] ?? 'neutral'}
        />
      ),
    },
    {
      key: 'createdAt',
      header: 'Received',
      hideOnMobile: true,
      render: (r) => fmtDateTime(r.createdAt),
    },
  ];

  return (
    <div className="space-y-5">
      <PageHeader title="Support" subtitle="Contact messages, feedback and bug reports" />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Open" value={counts.OPEN ?? 0} tone="caution" />
        <StatCard label="In progress" value={counts.IN_PROGRESS ?? 0} tone="brand" />
        <StatCard label="Resolved" value={counts.RESOLVED ?? 0} tone="positive" />
        <StatCard label="Closed" value={counts.CLOSED ?? 0} tone="neutral" />
      </div>

      <FilterBar>
        <SearchInput value={search} onChange={setSearch} placeholder="Search tickets…" />
        <Select
          value={status}
          onChange={setStatus}
          placeholder="Any status"
          aria-label="Filter by status"
          options={Object.entries(STATUS_LABEL).map(([value, label]) => ({ value, label }))}
        />
        <Select
          value={category}
          onChange={setCategory}
          placeholder="All types"
          aria-label="Filter by type"
          options={Object.entries(CATEGORY_LABEL).map(([value, label]) => ({ value, label }))}
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
            icon={LifeBuoy}
            title="No tickets found"
            body="Messages from the contact form arrive here."
          />
        }
      />

      <Drawer
        open={Boolean(detail)}
        onClose={() => setDetail(null)}
        title={detail?.subject ?? ''}
        subtitle={detail ? `${detail.user.name} · ${detail.user.email}` : undefined}
        footer={
          detail && (
            <div className="flex flex-wrap items-center gap-2">
              <ActionButton tone="primary" onClick={() => update(detail)} disabled={saving}>
                {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />} Save notes
              </ActionButton>
              {detail.status !== 'IN_PROGRESS' && detail.status !== 'RESOLVED' && (
                <ActionButton onClick={() => update(detail, 'IN_PROGRESS')} disabled={saving}>
                  Start
                </ActionButton>
              )}
              {detail.status !== 'RESOLVED' && (
                <ActionButton onClick={() => update(detail, 'RESOLVED')} disabled={saving}>
                  Resolve
                </ActionButton>
              )}
              {detail.status !== 'CLOSED' && (
                <ActionButton onClick={() => update(detail, 'CLOSED')} disabled={saving}>
                  Close
                </ActionButton>
              )}
            </div>
          )
        }
      >
        {detail && (
          <>
            <DetailSection title="Ticket">
              <DetailRow label="Status">
                <StatusPill
                  label={STATUS_LABEL[detail.status] ?? detail.status}
                  tone={STATUS_TONE[detail.status] ?? 'neutral'}
                />
              </DetailRow>
              <DetailRow label="Type">
                {detail.category ? (CATEGORY_LABEL[detail.category] ?? detail.category) : null}
              </DetailRow>
              <DetailRow label="Priority">{detail.priority}</DetailRow>
              <DetailRow label="From">{`${detail.user.name} (${detail.user.role})`}</DetailRow>
              <DetailRow label="Received">{fmtDateTime(detail.createdAt)}</DetailRow>
              {detail.resolvedAt && (
                <DetailRow label="Resolved">{fmtDateTime(detail.resolvedAt)}</DetailRow>
              )}
            </DetailSection>

            <DetailSection title="Message">
              <p className="text-[13.5px] text-ink-soft leading-[1.7] whitespace-pre-wrap bg-canvas border border-line-soft rounded-[10px] p-3.5">
                {detail.description}
              </p>
            </DetailSection>

            <DetailSection title="Internal notes">
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={5}
                placeholder="Notes for your own reference — not shown to the user."
                className={ADMIN_TEXTAREA}
              />
            </DetailSection>

            <a
              href={`mailto:${detail.user.email}?subject=${encodeURIComponent(`Re: ${detail.subject}`)}`}
              className="text-[13px] font-semibold text-brand-600 hover:text-brand-700"
            >
              Reply by email
            </a>
          </>
        )}
      </Drawer>
    </div>
  );
}
