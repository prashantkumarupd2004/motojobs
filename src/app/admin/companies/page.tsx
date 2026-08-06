'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { BadgeCheck, Building2, Download, Loader2, Pencil, Trash2 } from 'lucide-react';
import { apiFetch } from '@/lib/http';
import { COMPANY_TYPES, EMPLOYER_COMPANY_SIZES, INDIAN_STATES, MAX_IMAGE_BYTES } from '@/lib/automotive';
import { useAdminList } from '@/hooks/useAdminList';
import DataTable, { type Column } from '@/components/admin/DataTable';
import Drawer, { DetailSection } from '@/components/admin/Drawer';
import FileUpload from '@/components/form/FileUpload';
import {
  ADMIN_INPUT,
  ADMIN_TEXTAREA,
  ActionButton,
  EmptyState,
  FilterBar,
  Labelled,
  PageHeader,
  SearchInput,
  Select,
  StatusPill,
} from '@/components/admin/ui';

interface Row {
  id: string;
  name: string;
  slug: string | null;
  logo: string | null;
  industry: string | null;
  size: string | null;
  city: string | null;
  state: string | null;
  website: string | null;
  email: string | null;
  phone: string | null;
  isVerified: boolean;
  isProfileComplete: boolean;
  profileCompletion: number;
  createdAt: string;
  _count: { jobs: number; recruiters: number };
}

interface Detail extends Row {
  description: string | null;
  gstNumber: string | null;
  panNumber: string | null;
  addressLine: string | null;
  pincode: string | null;
  recruiters: Array<{
    id: string;
    designation: string | null;
    user: { id: string; name: string; email: string; isActive: boolean };
  }>;
  documents: Array<{
    id: string;
    type: string;
    fileUrl: string;
    fileName: string | null;
    status: string;
    uploadedAt: string;
  }>;
}

type FormState = {
  name: string;
  industry: string;
  size: string;
  description: string;
  website: string;
  email: string;
  phone: string;
  gstNumber: string;
  panNumber: string;
  addressLine: string;
  city: string;
  state: string;
  pincode: string;
  logo: string;
  isVerified: boolean;
};

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

const toForm = (c: Detail): FormState => ({
  name: c.name ?? '',
  industry: c.industry ?? '',
  size: c.size ?? '',
  description: c.description ?? '',
  website: c.website ?? '',
  email: c.email ?? '',
  phone: c.phone ?? '',
  gstNumber: c.gstNumber ?? '',
  panNumber: c.panNumber ?? '',
  addressLine: c.addressLine ?? '',
  city: c.city ?? '',
  state: c.state ?? '',
  pincode: c.pincode ?? '',
  logo: c.logo ?? '',
  isVerified: c.isVerified,
});

export default function AdminCompaniesPage() {
  const [search, setSearch] = useState('');
  const [industry, setIndustry] = useState('');
  const [state, setState] = useState('');
  const [verified, setVerified] = useState('');
  const [page, setPage] = useState(1);

  const [detail, setDetail] = useState<Detail | null>(null);
  const [form, setForm] = useState<FormState | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { items, total, totalPages, loading, error, reload } = useAdminList<Row>(
    '/api/admin/companies',
    { search, industry, state, verified, page },
    { key: 'companies' }
  );

  useEffect(() => {
    setPage(1);
  }, [search, industry, state, verified]);

  const open = useCallback(async (id: string) => {
    setDetailLoading(true);
    setFormError('');
    setErrors({});
    try {
      const res = await apiFetch('/api/admin/companies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      if (res.ok) {
        setDetail(data.company);
        setForm(toForm(data.company));
      }
    } finally {
      setDetailLoading(false);
    }
  }, []);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => (f ? { ...f, [key]: value } : f));
    setErrors((e) => {
      if (!e[key as string]) return e;
      const next = { ...e };
      delete next[key as string];
      return next;
    });
  }

  async function save() {
    if (!detail || !form) return;
    setSaving(true);
    setFormError('');
    setErrors({});
    try {
      const res = await apiFetch('/api/admin/companies', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: detail.id,
          // Blanks must reach the server as null, not "", so an optional field
          // can actually be cleared.
          ...Object.fromEntries(
            Object.entries(form).map(([k, v]) => [k, v === '' ? null : v])
          ),
          name: form.name.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.fieldErrors) setErrors(data.fieldErrors);
        throw new Error(data.error ?? 'Could not save');
      }
      setDetail(null);
      setForm(null);
      void reload();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Could not save');
    } finally {
      setSaving(false);
    }
  }

  async function remove(row: Row | Detail) {
    if (
      !window.confirm(
        `Delete "${row.name}"? Its ${row._count.jobs} job${row._count.jobs === 1 ? '' : 's'} will be kept but lose the company link. This cannot be undone.`
      )
    ) {
      return;
    }
    const res = await apiFetch(`/api/admin/companies?id=${row.id}`, { method: 'DELETE' });
    if (res.ok) {
      setDetail(null);
      void reload();
    }
  }

  const columns: Array<Column<Row>> = [
    {
      key: 'name',
      header: 'Company',
      render: (r) => (
        <div className="flex items-center gap-2.5 min-w-0">
          {r.logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={r.logo}
              alt=""
              className="w-8 h-8 rounded-[10px] object-contain bg-white border border-line shrink-0"
            />
          ) : (
            <span className="w-8 h-8 rounded-[10px] bg-canvas border border-line flex items-center justify-center shrink-0">
              <Building2 className="w-4 h-4 text-ink-faint" />
            </span>
          )}
          <div className="min-w-0">
            <p className="font-semibold text-ink truncate">{r.name}</p>
            <p className="text-[12px] text-ink-muted truncate">{r.industry ?? '—'}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'location',
      header: 'Location',
      hideOnMobile: true,
      render: (r) => [r.city, r.state].filter(Boolean).join(', ') || '—',
    },
    { key: 'jobs', header: 'Jobs', render: (r) => r._count.jobs },
    { key: 'recruiters', header: 'Users', hideOnMobile: true, render: (r) => r._count.recruiters },
    {
      key: 'verified',
      header: 'Verified',
      render: (r) =>
        r.isVerified ? (
          <StatusPill label="Verified" tone="positive" />
        ) : (
          <StatusPill label="Unverified" tone="neutral" />
        ),
    },
    { key: 'createdAt', header: 'Added', hideOnMobile: true, render: (r) => fmtDate(r.createdAt) },
    {
      key: 'actions',
      header: '',
      className: 'text-right',
      render: (r) => (
        <div className="inline-flex items-center gap-1.5">
          <button
            onClick={() => open(r.id)}
            aria-label={`Edit ${r.name}`}
            className="p-2 rounded-[9px] border border-line bg-white text-ink-muted hover:text-brand-700 hover:border-brand-200 transition-colors"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => remove(r)}
            aria-label={`Delete ${r.name}`}
            className="p-2 rounded-[9px] border border-line bg-white text-ink-muted hover:text-[#B32B2B] hover:border-[#F3C9C9] transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ];

  const exportUrl = `/api/admin/companies?export=csv&${new URLSearchParams({
    search, industry, state, verified,
  })}`;

  return (
    <div className="space-y-5">
      <PageHeader
        title="Companies"
        subtitle={`${total} compan${total === 1 ? 'y' : 'ies'} registered`}
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
        <SearchInput value={search} onChange={setSearch} placeholder="Search by company name…" />
        <Select
          value={industry}
          onChange={setIndustry}
          placeholder="All types"
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
          value={verified}
          onChange={setVerified}
          placeholder="Any verification"
          aria-label="Filter by verification"
          options={[
            { value: 'yes', label: 'Verified' },
            { value: 'no', label: 'Unverified' },
          ]}
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
        empty={<EmptyState icon={Building2} title="No companies found" body="Try clearing a filter." />}
      />

      <Drawer
        open={Boolean(detail) || detailLoading}
        onClose={() => {
          setDetail(null);
          setForm(null);
        }}
        title={detail?.name ?? 'Loading…'}
        subtitle={detail ? `${detail._count.jobs} job${detail._count.jobs === 1 ? '' : 's'}` : undefined}
        footer={
          detail &&
          form && (
            <div className="flex flex-wrap items-center gap-2">
              <ActionButton tone="primary" onClick={save} disabled={saving}>
                {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />} Save changes
              </ActionButton>
              <ActionButton tone="critical" onClick={() => remove(detail)} disabled={saving}>
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
        ) : detail && form ? (
          <>
            {formError && (
              <p className="bg-critical-soft border border-critical/20 text-critical rounded-[10px] px-3 py-2.5 text-[13px] font-medium mb-4">
                {formError}
              </p>
            )}

            <DetailSection title="Logo">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 shrink-0 rounded-[14px] bg-canvas border border-line flex items-center justify-center overflow-hidden">
                  {form.logo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={form.logo} alt="" className="w-full h-full object-contain" />
                  ) : (
                    <Building2 className="w-6 h-6 text-ink-faint" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <FileUpload
                    accept=".jpg,.jpeg,.png,.webp"
                    maxBytes={MAX_IMAGE_BYTES}
                    value={form.logo}
                    fileName="Company logo"
                    onChange={(r) => set('logo', r?.url ?? '')}
                    label="Upload logo"
                  />
                </div>
              </div>
            </DetailSection>

            <DetailSection title="Details">
              <div className="space-y-3.5">
                <Labelled label="Company name" error={errors.name}>
                  <input
                    value={form.name}
                    onChange={(e) => set('name', e.target.value)}
                    className={ADMIN_INPUT}
                  />
                </Labelled>

                <div className="grid grid-cols-2 gap-3">
                  <Labelled label="Type">
                    <select
                      value={form.industry}
                      onChange={(e) => set('industry', e.target.value)}
                      className={ADMIN_INPUT}
                    >
                      <option value="">Not set</option>
                      {COMPANY_TYPES.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </Labelled>

                  <Labelled label="Size">
                    <select
                      value={form.size}
                      onChange={(e) => set('size', e.target.value)}
                      className={ADMIN_INPUT}
                    >
                      <option value="">Not set</option>
                      {EMPLOYER_COMPANY_SIZES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </Labelled>
                </div>

                <Labelled label="Description">
                  <textarea
                    value={form.description}
                    onChange={(e) => set('description', e.target.value)}
                    rows={3}
                    className={ADMIN_TEXTAREA}
                  />
                </Labelled>
              </div>
            </DetailSection>

            <DetailSection title="Contact">
              <div className="grid grid-cols-2 gap-3">
                <Labelled label="Email" error={errors.email} className="col-span-2">
                  <input
                    value={form.email}
                    onChange={(e) => set('email', e.target.value)}
                    className={ADMIN_INPUT}
                  />
                </Labelled>
                <Labelled label="Phone">
                  <input
                    value={form.phone}
                    onChange={(e) => set('phone', e.target.value)}
                    className={ADMIN_INPUT}
                  />
                </Labelled>
                <Labelled label="Website" error={errors.website}>
                  <input
                    value={form.website}
                    onChange={(e) => set('website', e.target.value)}
                    className={ADMIN_INPUT}
                  />
                </Labelled>
              </div>
            </DetailSection>

            <DetailSection title="Address">
              <div className="grid grid-cols-2 gap-3">
                <Labelled label="Address" className="col-span-2">
                  <input
                    value={form.addressLine}
                    onChange={(e) => set('addressLine', e.target.value)}
                    className={ADMIN_INPUT}
                  />
                </Labelled>
                <Labelled label="City">
                  <input
                    value={form.city}
                    onChange={(e) => set('city', e.target.value)}
                    className={ADMIN_INPUT}
                  />
                </Labelled>
                <Labelled label="State">
                  <select
                    value={form.state}
                    onChange={(e) => set('state', e.target.value)}
                    className={ADMIN_INPUT}
                  >
                    <option value="">Not set</option>
                    {INDIAN_STATES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </Labelled>
                <Labelled label="PIN code">
                  <input
                    value={form.pincode}
                    onChange={(e) => set('pincode', e.target.value.replace(/\D/g, ''))}
                    maxLength={6}
                    className={ADMIN_INPUT}
                  />
                </Labelled>
              </div>
            </DetailSection>

            <DetailSection title="Registration">
              <div className="grid grid-cols-2 gap-3">
                <Labelled label="GST number" error={errors.gstNumber}>
                  <input
                    value={form.gstNumber}
                    onChange={(e) => set('gstNumber', e.target.value.toUpperCase())}
                    maxLength={15}
                    className={`${ADMIN_INPUT} uppercase`}
                  />
                </Labelled>
                <Labelled label="PAN number" error={errors.panNumber}>
                  <input
                    value={form.panNumber}
                    onChange={(e) => set('panNumber', e.target.value.toUpperCase())}
                    maxLength={10}
                    className={`${ADMIN_INPUT} uppercase`}
                  />
                </Labelled>
              </div>

              <label className="flex items-center gap-2.5 mt-3.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isVerified}
                  onChange={(e) => set('isVerified', e.target.checked)}
                  className="w-4 h-4 rounded border-line accent-brand-600 cursor-pointer"
                />
                <span className="text-[13px] text-ink-soft inline-flex items-center gap-1.5">
                  <BadgeCheck className="w-4 h-4 text-brand-600" />
                  Verified company
                </span>
              </label>
            </DetailSection>

            {detail.documents.length > 0 && (
              <DetailSection title={`Documents (${detail.documents.length})`}>
                <ul className="space-y-1.5">
                  {detail.documents.map((d) => (
                    <li key={d.id} className="flex items-center justify-between gap-3 text-[12.5px]">
                      <a
                        href={d.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-brand-600 hover:text-brand-700 font-semibold truncate"
                      >
                        {d.fileName || d.type}
                      </a>
                      <StatusPill
                        label={d.status}
                        tone={
                          d.status === 'APPROVED'
                            ? 'positive'
                            : d.status === 'REJECTED'
                              ? 'critical'
                              : 'caution'
                        }
                      />
                    </li>
                  ))}
                </ul>
              </DetailSection>
            )}

            {detail.recruiters.length > 0 && (
              <DetailSection title={`Users (${detail.recruiters.length})`}>
                <ul className="space-y-1.5">
                  {detail.recruiters.map((r) => (
                    <li key={r.id} className="flex items-center justify-between gap-3 text-[12.5px]">
                      <span className="text-ink-soft truncate">
                        {r.user.name}
                        {r.designation ? ` · ${r.designation}` : ''}
                      </span>
                      <StatusPill
                        label={r.user.isActive ? 'Active' : 'Suspended'}
                        tone={r.user.isActive ? 'positive' : 'critical'}
                      />
                    </li>
                  ))}
                </ul>
              </DetailSection>
            )}

            {detail.slug && (
              <Link
                href={`/company/${detail.slug}`}
                className="text-[13px] font-semibold text-brand-600 hover:text-brand-700"
              >
                View public company page
              </Link>
            )}
          </>
        ) : null}
      </Drawer>
    </div>
  );
}
