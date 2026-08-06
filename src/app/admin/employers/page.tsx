'use client';

import { Suspense, useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  Ban,
  Building2,
  CheckCircle2,
  Download,
  Eye,
  Loader2,
  Trash2,
} from 'lucide-react';
import { apiFetch } from '@/lib/http';
import { COMPANY_TYPES, INDIAN_STATES } from '@/lib/automotive';
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

interface Company {
  id: string;
  name: string;
  logo: string | null;
  industry: string | null;
  city: string | null;
  state: string | null;
  isVerified: boolean;
  isProfileComplete: boolean;
  profileCompletion: number;
}

interface Row {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  isActive: boolean;
  isEmailVerified: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  recruiter: {
    id: string;
    designation: string | null;
    isVerified: boolean;
    _count: { jobs: number };
    company: Company | null;
  } | null;
}

interface Detail {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  isActive: boolean;
  isEmailVerified: boolean;
  suspendedReason: string | null;
  lastLoginAt: string | null;
  createdAt: string;
  recruiter: {
    id: string;
    designation: string | null;
    isVerified: boolean;
    company:
      | (Company & {
          slug: string | null;
          description: string | null;
          website: string | null;
          email: string | null;
          phone: string | null;
          gstNumber: string | null;
          panNumber: string | null;
          addressLine: string | null;
          pincode: string | null;
          size: string | null;
          hiringFrequency: string | null;
          hrName: string | null;
          hrPhone: string | null;
          hiringCategories: string[];
        })
      | null;
    jobs: Array<{
      id: string;
      title: string;
      status: string;
      location: string | null;
      views: number;
      createdAt: string;
      _count: { applications: number };
    }>;
  } | null;
}

interface Hire {
  id: string;
  updatedAt: string;
  candidate: { user: { name: string } };
  job: { title: string };
}

interface LoginRow {
  id: string;
  success: boolean;
  failReason: string | null;
  ipAddress: string | null;
  createdAt: string;
}

const JOB_STATUS_TONE: Record<string, PillTone> = {
  APPROVED: 'positive',
  PENDING: 'caution',
  DRAFT: 'neutral',
  CLOSED: 'neutral',
  REJECTED: 'critical',
};

const fmtDate = (iso: string | null) =>
  iso ? new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

const fmtDateTime = (iso: string) =>
  new Date(iso).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });

export default function EmployersPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-7 h-7 text-brand-600 animate-spin" />
        </div>
      }
    >
      <Employers />
    </Suspense>
  );
}

function Employers() {
  const params = useSearchParams();

  const [search, setSearch] = useState('');
  const [companyType, setCompanyType] = useState('');
  const [state, setState] = useState('');
  const [status, setStatus] = useState(params.get('status') ?? '');
  const [from, setFrom] = useState('');
  const [page, setPage] = useState(1);

  const [detail, setDetail] = useState<Detail | null>(null);
  const [extra, setExtra] = useState<{
    applicationsReceived: number;
    interviews: number;
    hires: Hire[];
    loginHistory: LoginRow[];
  } | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [busy, setBusy] = useState(false);

  const { items, total, totalPages, loading, error, reload, setItems } = useAdminList<Row>(
    '/api/admin/employers',
    { search, companyType, state, status, from, page },
    { key: 'users' }
  );

  useEffect(() => {
    setPage(1);
  }, [search, companyType, state, status, from]);

  const open = useCallback(async (userId: string) => {
    setDetailLoading(true);
    try {
      const res = await apiFetch('/api/admin/employers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      const data = await res.json();
      if (res.ok) {
        setDetail(data.user);
        setExtra({
          applicationsReceived: data.applicationsReceived ?? 0,
          interviews: data.interviews ?? 0,
          hires: data.hires ?? [],
          loginHistory: data.loginHistory ?? [],
        });
      }
    } finally {
      setDetailLoading(false);
    }
  }, []);

  async function toggleStatus(row: { id: string; name: string; isActive: boolean }) {
    const suspending = row.isActive;
    if (
      suspending &&
      !window.confirm(
        `Suspend ${row.name}? Their live job listings will be closed so candidates stop applying.`
      )
    ) {
      return;
    }
    const reason = suspending
      ? window.prompt('Reason for suspension (optional)') ?? undefined
      : undefined;

    setBusy(true);
    try {
      const res = await apiFetch('/api/admin/employers', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: row.id,
          action: suspending ? 'suspend' : 'activate',
          reason,
        }),
      });
      if (res.ok) {
        setItems((list) =>
          list.map((u) => (u.id === row.id ? { ...u, isActive: !suspending } : u))
        );
        setDetail((d) => (d && d.id === row.id ? { ...d, isActive: !suspending } : d));
        // Job statuses changed server-side, so the list is stale.
        if (suspending) void reload();
      }
    } finally {
      setBusy(false);
    }
  }

  async function remove(row: { id: string; name: string }) {
    if (
      !window.confirm(
        `Delete ${row.name}? The person's account is removed. Their company and its jobs are kept — delete the company separately if you need to.`
      )
    ) {
      return;
    }
    setBusy(true);
    try {
      const res = await apiFetch(`/api/admin/employers?userId=${row.id}`, { method: 'DELETE' });
      if (res.ok) {
        setDetail(null);
        void reload();
      }
    } finally {
      setBusy(false);
    }
  }

  const columns: Array<Column<Row>> = [
    {
      key: 'company',
      header: 'Company',
      render: (r) => (
        <div className="flex items-center gap-2.5 min-w-0">
          {r.recruiter?.company?.logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={r.recruiter.company.logo}
              alt=""
              className="w-8 h-8 rounded-[10px] object-contain bg-white border border-line shrink-0"
            />
          ) : (
            <span className="w-8 h-8 rounded-[10px] bg-canvas border border-line flex items-center justify-center shrink-0">
              <Building2 className="w-4 h-4 text-ink-faint" />
            </span>
          )}
          <div className="min-w-0">
            <p className="font-semibold text-ink truncate">
              {r.recruiter?.company?.name ?? 'No company'}
            </p>
            <p className="text-[12px] text-ink-muted truncate">{r.recruiter?.company?.industry ?? '—'}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'contact',
      header: 'Contact',
      render: (r) => (
        <div className="min-w-0">
          <p className="text-ink truncate">{r.name}</p>
          <p className="text-[12px] text-ink-muted truncate">{r.email}</p>
        </div>
      ),
    },
    {
      key: 'location',
      header: 'Location',
      hideOnMobile: true,
      render: (r) =>
        [r.recruiter?.company?.city, r.recruiter?.company?.state].filter(Boolean).join(', ') || '—',
    },
    { key: 'jobs', header: 'Jobs', render: (r) => r.recruiter?._count.jobs ?? 0 },
    {
      key: 'status',
      header: 'Status',
      render: (r) =>
        r.isActive ? (
          <StatusPill label="Active" tone="positive" />
        ) : (
          <StatusPill label="Suspended" tone="critical" />
        ),
    },
    {
      key: 'createdAt',
      header: 'Registered',
      hideOnMobile: true,
      render: (r) => fmtDate(r.createdAt),
    },
    {
      key: 'actions',
      header: '',
      className: 'text-right',
      render: (r) => (
        <div className="inline-flex items-center gap-1.5">
          <button
            onClick={() => open(r.id)}
            aria-label={`View ${r.name}`}
            className="p-2 rounded-[9px] border border-line bg-white text-ink-muted hover:text-brand-700 hover:border-brand-200 transition-colors"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => toggleStatus(r)}
            disabled={busy}
            aria-label={r.isActive ? `Suspend ${r.name}` : `Activate ${r.name}`}
            className="p-2 rounded-[9px] border border-line bg-white text-ink-muted hover:text-[#9A5D00] hover:border-[#F3DBB4] transition-colors disabled:opacity-50"
          >
            {r.isActive ? <Ban className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={() => remove(r)}
            disabled={busy}
            aria-label={`Delete ${r.name}`}
            className="p-2 rounded-[9px] border border-line bg-white text-ink-muted hover:text-[#B32B2B] hover:border-[#F3C9C9] transition-colors disabled:opacity-50"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ];

  const exportUrl = `/api/admin/employers?export=csv&${new URLSearchParams({
    search, companyType, state, status, from,
  })}`;

  return (
    <div className="space-y-5">
      <PageHeader
        title="Employers"
        subtitle={`${total} registered employer${total === 1 ? '' : 's'}`}
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
          placeholder="Search by company, name or email…"
        />
        <Select
          value={companyType}
          onChange={setCompanyType}
          placeholder="All company types"
          aria-label="Filter by company type"
          options={COMPANY_TYPES.map((t) => ({ value: t, label: t }))}
        />
        <Select
          value={state}
          onChange={setState}
          placeholder="All states"
          aria-label="Filter by state"
          options={INDIAN_STATES.map((s) => ({ value: s, label: s }))}
        />
        <Select
          value={status}
          onChange={setStatus}
          placeholder="Any status"
          aria-label="Filter by status"
          options={[
            { value: 'active', label: 'Active' },
            { value: 'suspended', label: 'Suspended' },
          ]}
        />
        <input
          type="date"
          value={from}
          onChange={(e) => setFrom(e.target.value)}
          aria-label="Registered on or after"
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
            icon={Building2}
            title="No employers found"
            body="Try clearing a filter or widening the date range."
          />
        }
      />

      <Drawer
        open={Boolean(detail) || detailLoading}
        onClose={() => setDetail(null)}
        title={detail?.recruiter?.company?.name ?? detail?.name ?? 'Loading…'}
        subtitle={detail?.email}
        footer={
          detail && (
            <div className="flex flex-wrap items-center gap-2">
              <ActionButton onClick={() => toggleStatus(detail)} disabled={busy}>
                {detail.isActive ? (
                  <>
                    <Ban className="w-3.5 h-3.5" /> Suspend
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" /> Activate
                  </>
                )}
              </ActionButton>
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
          <EmployerDetail detail={detail} extra={extra} />
        ) : null}
      </Drawer>
    </div>
  );
}

function EmployerDetail({
  detail,
  extra,
}: {
  detail: Detail;
  extra: {
    applicationsReceived: number;
    interviews: number;
    hires: Hire[];
    loginHistory: LoginRow[];
  } | null;
}) {
  const company = detail.recruiter?.company;
  const jobs = detail.recruiter?.jobs ?? [];

  return (
    <>
      <DetailSection title="Account">
        <DetailRow label="Status">
          {detail.isActive ? (
            <StatusPill label="Active" tone="positive" />
          ) : (
            <StatusPill label="Suspended" tone="critical" />
          )}
        </DetailRow>
        <DetailRow label="Contact person">{detail.name}</DetailRow>
        <DetailRow label="Designation">{detail.recruiter?.designation}</DetailRow>
        <DetailRow label="Email verified">{detail.isEmailVerified ? 'Yes' : 'No'}</DetailRow>
        <DetailRow label="Registered">{fmtDate(detail.createdAt)}</DetailRow>
        <DetailRow label="Last login">
          {detail.lastLoginAt ? fmtDateTime(detail.lastLoginAt) : 'Never'}
        </DetailRow>
        {detail.suspendedReason && (
          <DetailRow label="Suspension reason">{detail.suspendedReason}</DetailRow>
        )}
      </DetailSection>

      {company && (
        <DetailSection title="Company">
          <DetailRow label="Name">{company.name}</DetailRow>
          <DetailRow label="Type">{company.industry}</DetailRow>
          <DetailRow label="Size">{company.size}</DetailRow>
          <DetailRow label="Verified">{company.isVerified ? 'Yes' : 'No'}</DetailRow>
          <DetailRow label="Profile">{company.profileCompletion}% complete</DetailRow>
          <DetailRow label="Address">
            {[company.addressLine, company.city, company.state, company.pincode]
              .filter(Boolean)
              .join(', ')}
          </DetailRow>
          <DetailRow label="GST">{company.gstNumber}</DetailRow>
          <DetailRow label="PAN">{company.panNumber}</DetailRow>
          <DetailRow label="Website">
            {company.website ? (
              <a
                href={company.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand-600 hover:text-brand-700 font-semibold break-all"
              >
                {company.website}
              </a>
            ) : null}
          </DetailRow>
          <DetailRow label="HR contact">
            {[company.hrName, company.hrPhone].filter(Boolean).join(' · ')}
          </DetailRow>
          <DetailRow label="Hiring frequency">{company.hiringFrequency}</DetailRow>
        </DetailSection>
      )}

      {extra && (
        <DetailSection title="Hiring activity">
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: 'Jobs', value: jobs.length },
              { label: 'Applications', value: extra.applicationsReceived },
              { label: 'Interviews', value: extra.interviews },
            ].map((s) => (
              <div
                key={s.label}
                className="bg-canvas border border-line-soft rounded-[10px] px-3 py-2.5 text-center"
              >
                <p className="text-[18px] font-extrabold text-ink tracking-[-0.03em]">{s.value}</p>
                <p className="text-[11px] text-ink-muted mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </DetailSection>
      )}

      <DetailSection title={`Company jobs (${jobs.length})`}>
        {jobs.length === 0 ? (
          <p className="text-[13px] text-ink-faint">No jobs posted yet.</p>
        ) : (
          <ul className="space-y-2">
            {jobs.map((j) => (
              <li
                key={j.id}
                className="flex items-center justify-between gap-3 bg-canvas border border-line-soft rounded-[10px] px-3 py-2.5"
              >
                <div className="min-w-0">
                  <p className="text-[13px] font-semibold text-ink truncate">{j.title}</p>
                  <p className="text-[11.5px] text-ink-muted truncate">
                    {j._count.applications} applicant
                    {j._count.applications === 1 ? '' : 's'} · {j.views} view
                    {j.views === 1 ? '' : 's'}
                  </p>
                </div>
                <StatusPill label={j.status} tone={JOB_STATUS_TONE[j.status] ?? 'neutral'} />
              </li>
            ))}
          </ul>
        )}
      </DetailSection>

      {extra && (
        <DetailSection title={`Hiring history (${extra.hires.length})`}>
          {extra.hires.length === 0 ? (
            <p className="text-[13px] text-ink-faint">No candidates hired yet.</p>
          ) : (
            <ul className="space-y-1.5">
              {extra.hires.map((h) => (
                <li key={h.id} className="flex items-center justify-between gap-3 text-[12.5px]">
                  <span className="text-ink-soft truncate">
                    {h.candidate.user.name} — {h.job.title}
                  </span>
                  <span className="text-ink-faint shrink-0">{fmtDate(h.updatedAt)}</span>
                </li>
              ))}
            </ul>
          )}
        </DetailSection>
      )}

      {company?.slug && (
        <Link
          href={`/company/${company.slug}`}
          className="text-[13px] font-semibold text-brand-600 hover:text-brand-700"
        >
          View public company page
        </Link>
      )}
    </>
  );
}
