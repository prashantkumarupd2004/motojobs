'use client';

import { Suspense, useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Ban,
  CheckCircle2,
  Download,
  Eye,
  FileText,
  Loader2,
  Trash2,
  Users,
} from 'lucide-react';
import { apiFetch } from '@/lib/http';
import {
  EXPERIENCE_BANDS,
  INDIAN_STATES,
  formatINR,
} from '@/lib/automotive';
import { useTaxonomy } from '@/hooks/useTaxonomy';
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

interface Candidate {
  id: string;
  headline: string | null;
  currentCity: string | null;
  currentState: string | null;
  qualification: string | null;
  totalExperience: string | null;
  expectedSalary: number | null;
  isProfileComplete: boolean;
  profileScore: number;
  _count: { applications: number };
}

interface Row {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  isActive: boolean;
  isEmailVerified: boolean;
  profileImage: string | null;
  suspendedAt: string | null;
  suspendedReason: string | null;
  lastLoginAt: string | null;
  createdAt: string;
  candidate: Candidate | null;
}

interface Detail extends Row {
  candidate:
    | (Candidate & {
        panNumber: string | null;
        panCardUrl: string | null;
        resumeUrl: string | null;
        resumeName: string | null;
        candidateType: string | null;
        currentCompany: string | null;
        currentDesignation: string | null;
        drivingLicense: boolean;
        ownVehicle: boolean;
        skills: string[];
        jobTitles: string[];
        languages: string[];
        resumes: Array<{ id: string; title: string; fileUrl: string | null; isPrimary: boolean }>;
        applications: Array<{
          id: string;
          status: string;
          appliedAt: string;
          job: { id: string; title: string; company: { name: string } | null };
        }>;
      })
    | null;
}

interface LoginRow {
  id: string;
  success: boolean;
  failReason: string | null;
  ipAddress: string | null;
  createdAt: string;
}

const APP_STATUS_TONE: Record<string, PillTone> = {
  APPLIED: 'brand',
  SCREENING: 'caution',
  SHORTLISTED: 'brand',
  INTERVIEW: 'brand',
  OFFERED: 'positive',
  HIRED: 'positive',
  REJECTED: 'critical',
};

const fmtDate = (iso: string | null) =>
  iso ? new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

const fmtDateTime = (iso: string) =>
  new Date(iso).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });

export default function JobSeekersPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-7 h-7 text-brand-600 animate-spin" />
        </div>
      }
    >
      <JobSeekers />
    </Suspense>
  );
}

function JobSeekers() {
  const params = useSearchParams();

  const [search, setSearch] = useState('');
  const [state, setState] = useState('');
  const [qualification, setQualification] = useState('');
  const [experience, setExperience] = useState('');
  const [status, setStatus] = useState(params.get('status') ?? '');
  const [verified, setVerified] = useState(params.get('verified') ?? '');
  const [from, setFrom] = useState('');
  const [page, setPage] = useState(1);

  const qualifications = useTaxonomy('QUALIFICATION');

  const [detail, setDetail] = useState<Detail | null>(null);
  const [loginHistory, setLoginHistory] = useState<LoginRow[]>([]);
  const [detailLoading, setDetailLoading] = useState(false);
  const [busy, setBusy] = useState(false);

  const { items, total, totalPages, loading, error, reload, setItems } = useAdminList<Row>(
    '/api/admin/job-seekers',
    { search, state, qualification, experience, status, verified, from, page },
    { key: 'users' }
  );

  // Any filter change invalidates the current page number.
  useEffect(() => {
    setPage(1);
  }, [search, state, qualification, experience, status, verified, from]);

  const open = useCallback(async (userId: string) => {
    setDetailLoading(true);
    try {
      const res = await apiFetch('/api/admin/job-seekers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      const data = await res.json();
      if (res.ok) {
        setDetail(data.user);
        setLoginHistory(data.loginHistory ?? []);
      }
    } finally {
      setDetailLoading(false);
    }
  }, []);

  async function toggleStatus(row: Row | Detail) {
    const suspending = row.isActive;
    const reason = suspending
      ? window.prompt(`Why are you suspending ${row.name}? (optional)`) ?? undefined
      : undefined;

    setBusy(true);
    try {
      const res = await apiFetch('/api/admin/job-seekers', {
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
      }
    } finally {
      setBusy(false);
    }
  }

  async function remove(row: Row | Detail) {
    const applications = row.candidate?._count.applications ?? 0;
    const warning =
      applications > 0
        ? `${row.name} has ${applications} application${applications === 1 ? '' : 's'}. Deleting removes the account and every application permanently.`
        : `Delete ${row.name}? This cannot be undone.`;
    if (!window.confirm(warning)) return;

    setBusy(true);
    try {
      const res = await apiFetch(`/api/admin/job-seekers?userId=${row.id}`, {
        method: 'DELETE',
      });
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
      key: 'name',
      header: 'Candidate',
      render: (r) => (
        <div className="flex items-center gap-2.5 min-w-0">
          {r.profileImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={r.profileImage}
              alt=""
              className="w-8 h-8 rounded-[10px] object-cover border border-line shrink-0"
            />
          ) : (
            <span className="w-8 h-8 rounded-[10px] grad-brand flex items-center justify-center text-white text-[12px] font-bold shrink-0">
              {r.name[0]?.toUpperCase()}
            </span>
          )}
          <div className="min-w-0">
            <p className="font-semibold text-ink truncate">{r.name}</p>
            <p className="text-[12px] text-ink-muted truncate">{r.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'location',
      header: 'Location',
      hideOnMobile: true,
      render: (r) =>
        [r.candidate?.currentCity, r.candidate?.currentState].filter(Boolean).join(', ') || '—',
    },
    {
      key: 'experience',
      header: 'Experience',
      hideOnMobile: true,
      render: (r) => r.candidate?.totalExperience || '—',
    },
    {
      key: 'applications',
      header: 'Applied',
      render: (r) => r.candidate?._count.applications ?? 0,
    },
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

  const exportUrl = `/api/admin/job-seekers?export=csv&${new URLSearchParams({
    search, state, qualification, experience, status, verified, from,
  })}`;

  return (
    <div className="space-y-5">
      <PageHeader
        title="Job Seekers"
        subtitle={`${total} registered candidate${total === 1 ? '' : 's'}`}
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
          placeholder="Search by name, email or phone…"
        />
        <Select
          value={state}
          onChange={setState}
          placeholder="All states"
          aria-label="Filter by state"
          options={INDIAN_STATES.map((s) => ({ value: s, label: s }))}
        />
        <Select
          value={qualification}
          onChange={setQualification}
          placeholder="All qualifications"
          aria-label="Filter by qualification"
          options={qualifications.map((q) => ({ value: q.value, label: q.label }))}
        />
        <Select
          value={experience}
          onChange={setExperience}
          placeholder="Any experience"
          aria-label="Filter by experience"
          options={EXPERIENCE_BANDS.map((e) => ({ value: e, label: e }))}
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
            icon={Users}
            title="No candidates found"
            body="Try clearing a filter or widening the date range."
          />
        }
      />

      <Drawer
        open={Boolean(detail) || detailLoading}
        onClose={() => setDetail(null)}
        title={detail?.name ?? 'Loading…'}
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
          <CandidateDetail detail={detail} loginHistory={loginHistory} />
        ) : null}
      </Drawer>
    </div>
  );
}

function CandidateDetail({
  detail,
  loginHistory,
}: {
  detail: Detail;
  loginHistory: LoginRow[];
}) {
  const c = detail.candidate;
  const resume = c?.resumes.find((r) => r.isPrimary)?.fileUrl ?? c?.resumeUrl;

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
        <DetailRow label="Email verified">{detail.isEmailVerified ? 'Yes' : 'No'}</DetailRow>
        <DetailRow label="Phone">{detail.phone}</DetailRow>
        <DetailRow label="Registered">{fmtDate(detail.createdAt)}</DetailRow>
        <DetailRow label="Last login">
          {detail.lastLoginAt ? fmtDateTime(detail.lastLoginAt) : 'Never'}
        </DetailRow>
        {detail.suspendedReason && (
          <DetailRow label="Suspension reason">{detail.suspendedReason}</DetailRow>
        )}
      </DetailSection>

      {c && (
        <>
          <DetailSection title="Profile">
            <DetailRow label="Headline">{c.headline}</DetailRow>
            <DetailRow label="Location">
              {[c.currentCity, c.currentState].filter(Boolean).join(', ')}
            </DetailRow>
            <DetailRow label="Qualification">{c.qualification}</DetailRow>
            <DetailRow label="Experience">{c.totalExperience}</DetailRow>
            <DetailRow label="Current company">{c.currentCompany}</DetailRow>
            <DetailRow label="Designation">{c.currentDesignation}</DetailRow>
            <DetailRow label="Expected salary">
              {c.expectedSalary != null ? formatINR(c.expectedSalary) : null}
            </DetailRow>
            <DetailRow label="Driving licence">{c.drivingLicense ? 'Yes' : 'No'}</DetailRow>
            <DetailRow label="Own vehicle">{c.ownVehicle ? 'Yes' : 'No'}</DetailRow>
            <DetailRow label="Profile complete">
              {c.isProfileComplete ? `Yes · ${c.profileScore}%` : `No · ${c.profileScore}%`}
            </DetailRow>
          </DetailSection>

          <DetailSection title="Identity documents">
            <DetailRow label="PAN number">{c.panNumber}</DetailRow>
            <DetailRow label="PAN card">
              {c.panCardUrl ? (
                <a
                  href={c.panCardUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brand-600 hover:text-brand-700 font-semibold"
                >
                  View
                </a>
              ) : null}
            </DetailRow>
          </DetailSection>

          <DetailSection title="Resume">
            {resume ? (
              <div className="flex flex-wrap gap-2">
                <a
                  href={resume}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="press inline-flex items-center gap-1.5 bg-white border border-line rounded-[11px] px-3.5 py-2 text-[13px] font-semibold text-ink-soft hover:text-brand-700 hover:border-brand-200 transition-all"
                >
                  <Eye className="w-3.5 h-3.5" /> View
                </a>
                <a
                  href={resume}
                  download
                  className="press inline-flex items-center gap-1.5 bg-white border border-line rounded-[11px] px-3.5 py-2 text-[13px] font-semibold text-ink-soft hover:text-brand-700 hover:border-brand-200 transition-all"
                >
                  <Download className="w-3.5 h-3.5" /> Download
                </a>
              </div>
            ) : (
              <p className="text-[13px] text-ink-faint">No resume uploaded.</p>
            )}
          </DetailSection>

          {c.skills.length > 0 && (
            <DetailSection title="Skills">
              <div className="flex flex-wrap gap-1.5">
                {c.skills.map((s) => (
                  <span
                    key={s}
                    className="text-[11.5px] font-medium bg-canvas border border-line-soft text-ink-soft rounded-full px-2.5 py-1"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </DetailSection>
          )}

          <DetailSection title={`Application history (${c.applications.length})`}>
            {c.applications.length === 0 ? (
              <p className="text-[13px] text-ink-faint">No applications yet.</p>
            ) : (
              <ul className="space-y-2">
                {c.applications.map((a) => (
                  <li
                    key={a.id}
                    className="flex items-center justify-between gap-3 bg-canvas border border-line-soft rounded-[10px] px-3 py-2.5"
                  >
                    <div className="min-w-0">
                      <p className="text-[13px] font-semibold text-ink truncate">{a.job.title}</p>
                      <p className="text-[11.5px] text-ink-muted truncate">
                        {a.job.company?.name ?? 'No company'} · {fmtDate(a.appliedAt)}
                      </p>
                    </div>
                    <StatusPill label={a.status} tone={APP_STATUS_TONE[a.status] ?? 'neutral'} />
                  </li>
                ))}
              </ul>
            )}
          </DetailSection>
        </>
      )}

      <DetailSection title="Login activity">
        {loginHistory.length === 0 ? (
          <p className="text-[13px] text-ink-faint">No sign-ins recorded yet.</p>
        ) : (
          <ul className="space-y-1.5">
            {loginHistory.map((l) => (
              <li key={l.id} className="flex items-center justify-between gap-3 text-[12.5px]">
                <span className="text-ink-muted">{fmtDateTime(l.createdAt)}</span>
                <span className="flex items-center gap-2 shrink-0">
                  {l.ipAddress && <span className="text-ink-faint">{l.ipAddress}</span>}
                  <StatusPill
                    label={l.success ? 'OK' : (l.failReason ?? 'Failed')}
                    tone={l.success ? 'positive' : 'critical'}
                  />
                </span>
              </li>
            ))}
          </ul>
        )}
      </DetailSection>
    </>
  );
}
