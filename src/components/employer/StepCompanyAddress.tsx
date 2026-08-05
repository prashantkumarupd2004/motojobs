'use client';

import { MapPin, Navigation } from 'lucide-react';
import { CITIES_BY_STATE, INDIAN_STATES } from '@/lib/automotive';
import { Field, SearchableSelect, TextInput } from '@/components/form';
import type { EmployerStepProps } from './wizard-state';

export default function StepCompanyAddress({ state, patch, errors }: EmployerStepProps) {
  const cities = CITIES_BY_STATE[state.state] ?? [];

  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 gap-5 animate-fade-in">
      <Field label="State" required error={errors.state}>
        <SearchableSelect
          options={INDIAN_STATES}
          value={state.state}
          // Clearing the city prevents a mismatched pair such as Pune, Kerala.
          onChange={(v) => patch({ state: v, city: '' })}
          error={Boolean(errors.state)}
          placeholder="Select state"
        />
      </Field>

      <Field
        label="City"
        required
        error={errors.city}
        hint={state.state ? undefined : 'Pick a state first'}
      >
        <SearchableSelect
          options={cities}
          value={state.city}
          onChange={(v) => patch({ city: v })}
          error={Boolean(errors.city)}
          disabled={!state.state}
          allowCustom
          placeholder="Select city"
        />
      </Field>

      <Field
        label="Complete address"
        required
        error={errors.addressLine}
        className="sm:col-span-2"
      >
        <div className="relative">
          <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-faint pointer-events-none z-10" />
          <TextInput
            value={state.addressLine}
            onChange={(e) => patch({ addressLine: e.target.value })}
            error={Boolean(errors.addressLine)}
            placeholder="Plot 14, MIDC Industrial Area, Bhosari"
            className="pl-11"
          />
        </div>
      </Field>

      <Field label="Pincode" required error={errors.pincode}>
        <TextInput
          inputMode="numeric"
          maxLength={6}
          value={state.pincode}
          onChange={(e) => patch({ pincode: e.target.value.replace(/\D/g, '') })}
          error={Boolean(errors.pincode)}
          placeholder="411019"
        />
      </Field>

      <Field
        label="Google Maps location"
        error={errors.mapsUrl}
        hint="Optional · helps candidates find you"
      >
        <div className="relative">
          <Navigation className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-faint pointer-events-none z-10" />
          <TextInput
            value={state.mapsUrl}
            onChange={(e) => patch({ mapsUrl: e.target.value })}
            error={Boolean(errors.mapsUrl)}
            placeholder="https://maps.app.goo.gl/…"
            className="pl-11"
          />
        </div>
      </Field>
    </section>
  );
}
