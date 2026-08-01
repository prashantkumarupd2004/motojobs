'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  Building2,
  CheckCircle,
  FileBadge,
  Globe,
  Link2,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Save,
} from 'lucide-react';
import { apiFetch } from '@/lib/http';
import {
  COMPANY_SIZES,
  EMPLOYER_TYPES,
  INDIAN_STATES,
  MAX_IMAGE_BYTES,
} from '@/lib/automotive';
import { companyProfileSchema } from '@/lib/validation/company';
import { Field, FileUpload, SearchableSelect, TextInput } from '@/components/form';
import CompanyDocuments from '@/components/recruiter/CompanyDocuments';

type FormState = {
  name: string;
  industry: string;
  size: string;
  description: string;
  foundedYear: string;
  website: string;
  linkedinUrl: string;
  phone: string;
  email: string;
  gstNumber: string;
  addressLine: string;
  city: string;
  state: string;
  pincode: string;
  logo: string;
  designation: string;
  hrName: string;
};

const EMPTY: FormState = {
  name: '',
  industry: '',
  size: '',
  description: '',
  foundedYear: '',
  website: '',
  linkedinUrl: '',
  phone: '',
  email: '',
  gstNumber: '',
  addressLine: '',
  city: '',
  state: '',
  pincode: '',
  logo: '',
  designation: '',
  hrName: '',
};

/** Strips blanks so optional fields arrive as `undefined`, not `""`. */
function toPayload(form: FormState) {
  const trimmed = Object.fromEntries(
    Object.entries(form).map(([k, v]) => [k, v.trim()])
  ) as FormState;
  return {
    ...trimmed,
    foundedYear: trimmed.foundedYear ? Number(trimmed.foundedYear) : undefined,
    logo: trimmed.logo || undefined,
    description: trimmed.description || undefined,
    addressLine: trimmed.addressLine || undefined,
    city: trimmed.city || undefined,
    industry: trimmed.industry || undefined,
    size: trimmed.size || undefined,
    state: trimmed.state || undefined,
    designation: trimmed.designation || undefined,
    hrName: trimmed.hrName || undefined,
  };
}

const CARD = 'surface sheen p-6 sm:p-8';
const HEADING = 'text-[17px] font-bold text-ink tracking-[-0.025em] mb-6';

export default function CompanyProfilePage() {
  const [form, setForm] = useState<FormState>(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const [hasCompany, setHasCompany] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await apiFetch('/api/recruiter/company');
        if (!res.ok) return;
        const data = await res.json();
        if (cancelled) return;
        const c = data.company ?? {};
        setIsVerified(Boolean(data.isVerified));
        setHasCompany(Boolean(data.company?.id));
        setForm({
          ...EMPTY,
          ...Object.fromEntries(
            Object.keys(EMPTY).map((k) => [k, c[k] == null ? '' : String(c[k])])
          ),
          designation: data.designation ?? '',
          hrName: data.hrName ?? '',
        } as FormState);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const set = useCallback(
    <K extends keyof FormState>(key: K) =>
      (value: string) => {
        setForm((f) => ({ ...f, [key]: value }));
        setErrors((e) => {
          if (!e[key]) return e;
          const next = { ...e };
          delete next[key];
          return next;
        });
      },
    []
  );

  const text =
    (key: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      set(key)(e.target.value);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSaved(false);

    const payload = toPayload(form);
    const parsed = companyProfileSchema.safeParse(payload);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0] ?? 'form');
        if (!fieldErrors[key]) fieldErrors[key] = issue.message;
      }
      setErrors(fieldErrors);
      setError('Please fix the highlighted fields.');
      return;
    }

    setSaving(true);
    setErrors({});
    try {
      const res = await apiFetch('/api/recruiter/company', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.fieldErrors) setErrors(data.fieldErrors);
        throw new Error(data.error || 'Failed to save');
      }
      setSaved(true);
      setHasCompany(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-ignite-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-7">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-[28px] font-extrabold text-ink tracking-[-0.035em]">
            Company Profile
          </h1>
          <p className="text-ink-muted text-[15px] mt-1.5">
            Help candidates learn about your organization
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {isVerified && (
            <span className="flex items-center gap-1.5 bg-brand-50 border border-brand-200 text-brand-700 text-[13px] font-semibold px-3.5 py-2 rounded-full">
              <CheckCircle className="w-4 h-4" />
              Verified
            </span>
          )}
          {saved && (
            <span className="flex items-center gap-2 bg-positive-soft border border-positive/20 text-positive text-[13px] font-semibold px-3.5 py-2 rounded-full animate-scale-in">
              <CheckCircle className="w-4 h-4" />
              Saved
            </span>
          )}
        </div>
      </div>

      {error && (
        <div
          role="alert"
          className="bg-critical-soft border border-critical/20 text-critical rounded-[14px] px-4 py-3 text-sm font-medium"
        >
          {error}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        <div className={CARD}>
          <h2 className={HEADING}>Company Logo</h2>
          <div className="flex flex-col sm:flex-row sm:items-start gap-5">
            <div className="w-20 h-20 shrink-0 rounded-[20px] bg-canvas border-2 border-dashed border-line flex items-center justify-center overflow-hidden">
              {form.logo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={form.logo}
                  alt="Company logo"
                  className="w-full h-full object-contain"
                />
              ) : (
                <Building2 className="w-8 h-8 text-ink-faint" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <FileUpload
                accept=".jpg,.jpeg,.png,.webp"
                maxBytes={MAX_IMAGE_BYTES}
                value={form.logo}
                onChange={(r) => set('logo')(r?.url ?? '')}
                label="Upload logo"
                hint="PNG, JPG or WEBP up to 2MB. Square images look best."
              />
            </div>
          </div>
        </div>

        <div className={CARD}>
          <h2 className={HEADING}>Basic Information</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Field
              label="Company name"
              htmlFor="name"
              required
              error={errors.name}
              className="sm:col-span-2"
            >
              <TextInput
                id="name"
                value={form.name}
                onChange={text('name')}
                error={Boolean(errors.name)}
                placeholder="Sharma Motors Pvt Ltd"
              />
            </Field>

            <Field label="Business type" error={errors.industry}>
              <SearchableSelect
                options={EMPLOYER_TYPES}
                value={form.industry}
                onChange={set('industry')}
                error={Boolean(errors.industry)}
                placeholder="Select business type"
              />
            </Field>

            <Field label="Company size" error={errors.size}>
              <SearchableSelect
                options={COMPANY_SIZES.map((s) => s)}
                value={form.size}
                onChange={set('size')}
                error={Boolean(errors.size)}
                placeholder="Select size"
              />
            </Field>

            <Field label="Founded year" error={errors.foundedYear}>
              <TextInput
                inputMode="numeric"
                value={form.foundedYear}
                onChange={text('foundedYear')}
                error={Boolean(errors.foundedYear)}
                placeholder="2010"
              />
            </Field>

            <Field label="GST number" error={errors.gstNumber} hint="15-character GSTIN">
              <TextInput
                value={form.gstNumber}
                onChange={(e) => set('gstNumber')(e.target.value.toUpperCase())}
                error={Boolean(errors.gstNumber)}
                placeholder="27ABCDE1234F1Z5"
                maxLength={15}
                className="uppercase tracking-[0.04em]"
              />
            </Field>

            <Field
              label="About the company"
              error={errors.description}
              className="sm:col-span-2"
              hint="Shown on your public company page."
            >
              <textarea
                value={form.description}
                onChange={text('description')}
                rows={4}
                maxLength={2000}
                placeholder="Tell candidates about your workshops, brands you handle, and what it's like to work with you..."
                className={`w-full bg-white text-ink placeholder-ink-faint text-sm rounded-[14px] px-4 py-3 border outline-none shadow-[inset_0_1px_2px_rgba(16,24,40,0.04)] transition-all duration-300 leading-[1.7] resize-none ${
                  errors.description
                    ? 'border-critical'
                    : 'border-line hover:border-[#D9DEE9] focus:border-brand-600 focus:shadow-[0_0_0_4px_rgba(15,76,129,0.10)]'
                }`}
              />
            </Field>
          </div>
        </div>

        <div className={CARD}>
          <h2 className={HEADING}>Registered Address</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Field
              label="Address"
              error={errors.addressLine}
              className="sm:col-span-2"
            >
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-faint pointer-events-none z-10" />
                <TextInput
                  value={form.addressLine}
                  onChange={text('addressLine')}
                  error={Boolean(errors.addressLine)}
                  placeholder="Plot 14, MIDC Industrial Area"
                  className="pl-11"
                />
              </div>
            </Field>

            <Field label="City" error={errors.city}>
              <TextInput
                value={form.city}
                onChange={text('city')}
                error={Boolean(errors.city)}
                placeholder="Pune"
              />
            </Field>

            <Field label="State" error={errors.state}>
              <SearchableSelect
                options={INDIAN_STATES}
                value={form.state}
                onChange={set('state')}
                error={Boolean(errors.state)}
                placeholder="Select state"
              />
            </Field>

            <Field label="PIN code" error={errors.pincode}>
              <TextInput
                inputMode="numeric"
                maxLength={6}
                value={form.pincode}
                onChange={text('pincode')}
                error={Boolean(errors.pincode)}
                placeholder="411019"
              />
            </Field>
          </div>
        </div>

        <div className={CARD}>
          <h2 className={HEADING}>Contact & Links</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Field label="Website" error={errors.website}>
              <div className="relative">
                <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-faint pointer-events-none z-10" />
                <TextInput
                  value={form.website}
                  onChange={text('website')}
                  error={Boolean(errors.website)}
                  placeholder="https://yourcompany.com"
                  className="pl-11"
                />
              </div>
            </Field>

            <Field label="LinkedIn" error={errors.linkedinUrl}>
              <div className="relative">
                <Link2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-faint pointer-events-none z-10" />
                <TextInput
                  value={form.linkedinUrl}
                  onChange={text('linkedinUrl')}
                  error={Boolean(errors.linkedinUrl)}
                  placeholder="https://linkedin.com/company/..."
                  className="pl-11"
                />
              </div>
            </Field>

            <Field label="Contact phone" error={errors.phone}>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-faint pointer-events-none z-10" />
                <TextInput
                  value={form.phone}
                  onChange={text('phone')}
                  error={Boolean(errors.phone)}
                  placeholder="+91 98765 43210"
                  className="pl-11"
                />
              </div>
            </Field>

            <Field
              label="Recruitment email"
              error={errors.email}
              hint="Where candidate queries land."
            >
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-faint pointer-events-none z-10" />
                <TextInput
                  type="email"
                  value={form.email}
                  onChange={text('email')}
                  error={Boolean(errors.email)}
                  placeholder="hr@yourcompany.com"
                  className="pl-11"
                />
              </div>
            </Field>
          </div>
        </div>

        <div className={CARD}>
          <h2 className={HEADING}>HR Contact</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Field label="Your name" error={errors.hrName}>
              <TextInput
                value={form.hrName}
                onChange={text('hrName')}
                error={Boolean(errors.hrName)}
                placeholder="Rahul Sharma"
              />
            </Field>

            <Field label="Your designation" error={errors.designation}>
              <div className="relative">
                <FileBadge className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-faint pointer-events-none z-10" />
                <TextInput
                  value={form.designation}
                  onChange={text('designation')}
                  error={Boolean(errors.designation)}
                  placeholder="HR Manager"
                  className="pl-11"
                />
              </div>
            </Field>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="sweep press flex items-center justify-center gap-2 grad-ignite disabled:opacity-50 text-white font-semibold px-6 py-3 rounded-[14px] shadow-[0_4px_12px_rgba(255,107,0,0.22)] hover:shadow-[0_8px_22px_rgba(255,107,0,0.32)] hover:-translate-y-0.5 transition-all duration-300 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)]"
          >
            {saving ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Save className="w-5 h-5" />
            )}
            Save Company Profile
          </button>
        </div>
      </form>

      <CompanyDocuments hasCompany={hasCompany} />
    </div>
  );
}
