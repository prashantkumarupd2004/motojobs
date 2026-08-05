'use client';

import { Building2, Globe, Mail, Phone } from 'lucide-react';
import { COMPANY_TYPES, MAX_IMAGE_BYTES } from '@/lib/automotive';
import { Field, FileUpload, SearchableSelect, TextInput } from '@/components/form';
import type { EmployerStepProps } from './wizard-state';

export default function StepCompanyInfo({ state, patch, errors }: EmployerStepProps) {
  return (
    <section className="space-y-5 animate-fade-in">
      <Field label="Company logo" hint="PNG, JPG or WEBP up to 2MB. Square images look best.">
        <div className="flex flex-col sm:flex-row sm:items-start gap-4">
          <div className="w-20 h-20 shrink-0 rounded-[20px] bg-canvas border-2 border-dashed border-line flex items-center justify-center overflow-hidden">
            {state.logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={state.logo} alt="" className="w-full h-full object-contain" />
            ) : (
              <Building2 className="w-8 h-8 text-ink-faint" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <FileUpload
              accept=".jpg,.jpeg,.png,.webp"
              maxBytes={MAX_IMAGE_BYTES}
              value={state.logo}
              fileName="Company logo"
              onChange={(r) => patch({ logo: r?.url ?? '' })}
              label="Upload logo"
            />
          </div>
        </div>
      </Field>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <Field
          label="Company name"
          htmlFor="company-name"
          required
          error={errors.name}
          className="sm:col-span-2"
        >
          <TextInput
            id="company-name"
            value={state.name}
            onChange={(e) => patch({ name: e.target.value })}
            error={Boolean(errors.name)}
            placeholder="Sharma Motors Pvt Ltd"
          />
        </Field>

        <Field label="Company type" required error={errors.companyType} className="sm:col-span-2">
          <SearchableSelect
            options={COMPANY_TYPES}
            value={state.companyType}
            onChange={(v) => patch({ companyType: v })}
            error={Boolean(errors.companyType)}
            placeholder="Select your company type"
          />
        </Field>

        <Field
          label="Company description"
          error={errors.description}
          className="sm:col-span-2"
          hint="Shown on your public company page and every job you post."
        >
          <textarea
            value={state.description}
            onChange={(e) => patch({ description: e.target.value })}
            rows={4}
            maxLength={2000}
            placeholder="Tell candidates about your showroom or workshop, the brands you handle, and what it's like to work with you…"
            className={`w-full bg-white text-ink placeholder-ink-faint text-sm rounded-[14px] px-4 py-3 border outline-none shadow-[inset_0_1px_2px_rgba(16,24,40,0.04)] transition-all duration-300 leading-[1.7] resize-none ${
              errors.description
                ? 'border-critical'
                : 'border-line hover:border-[#D9DEE9] focus:border-brand-600 focus:shadow-[0_0_0_4px_rgba(15,76,129,0.10)]'
            }`}
          />
        </Field>

        <Field label="Website" error={errors.website} className="sm:col-span-2">
          <div className="relative">
            <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-faint pointer-events-none z-10" />
            <TextInput
              value={state.website}
              onChange={(e) => patch({ website: e.target.value })}
              error={Boolean(errors.website)}
              placeholder="https://yourcompany.com"
              className="pl-11"
            />
          </div>
        </Field>

        <Field label="GST number" error={errors.gstNumber} hint="Optional · 15-character GSTIN">
          <TextInput
            value={state.gstNumber}
            onChange={(e) => patch({ gstNumber: e.target.value.toUpperCase() })}
            error={Boolean(errors.gstNumber)}
            placeholder="27ABCDE1234F1Z5"
            maxLength={15}
            className="uppercase tracking-[0.04em]"
          />
        </Field>

        <Field label="PAN number" error={errors.panNumber} hint="Optional · 10-character PAN">
          <TextInput
            value={state.panNumber}
            onChange={(e) => patch({ panNumber: e.target.value.toUpperCase() })}
            error={Boolean(errors.panNumber)}
            placeholder="ABCDE1234F"
            maxLength={10}
            className="uppercase tracking-[0.04em]"
          />
        </Field>

        <Field
          label="Company email"
          required
          error={errors.email}
          hint="Where candidate queries land."
        >
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-faint pointer-events-none z-10" />
            <TextInput
              type="email"
              value={state.email}
              onChange={(e) => patch({ email: e.target.value })}
              error={Boolean(errors.email)}
              placeholder="hr@yourcompany.com"
              className="pl-11"
            />
          </div>
        </Field>

        <Field label="Company mobile" required error={errors.phone}>
          <div className="relative">
            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-faint pointer-events-none z-10" />
            <TextInput
              inputMode="numeric"
              maxLength={10}
              value={state.phone}
              onChange={(e) => patch({ phone: e.target.value.replace(/\D/g, '') })}
              error={Boolean(errors.phone)}
              placeholder="9876543210"
              className="pl-11"
            />
          </div>
        </Field>
      </div>
    </section>
  );
}
