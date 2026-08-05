'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { apiFetch } from '@/lib/http';
import { INTERVIEW_MODES } from '@/lib/automotive';
import { Field, RadioCards, TextInput } from '@/components/form';
import Modal from '@/components/ui/Modal';

const MODE_OPTIONS = INTERVIEW_MODES.map((m) => ({
  value: m.id,
  label: m.label,
  blurb: m.hint,
}));

const VENUE_LABEL: Record<string, string> = {
  IN_PERSON: 'Address',
  PHONE: 'Number to call',
  VIDEO: 'Meeting link',
};

const VENUE_PLACEHOLDER: Record<string, string> = {
  IN_PERSON: 'Plot 14, MIDC Industrial Area, Pune',
  PHONE: '9876543210',
  VIDEO: 'https://meet.google.com/…',
};

/**
 * `datetime-local` yields a value with no timezone, which `new Date()` reads as
 * local time — exactly what the employer typed. Sent as an ISO string so the
 * server stores an unambiguous instant.
 */
function toIso(local: string): string | null {
  if (!local) return null;
  const date = new Date(local);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

export default function ScheduleInterviewModal({
  applicationId,
  candidateName,
  jobTitle,
  onClose,
  onScheduled,
}: {
  applicationId: string;
  candidateName: string;
  jobTitle: string;
  onClose: () => void;
  onScheduled: () => void;
}) {
  const [scheduledAt, setScheduledAt] = useState('');
  const [durationMins, setDurationMins] = useState('30');
  const [mode, setMode] = useState('IN_PERSON');
  const [venue, setVenue] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function submit() {
    const iso = toIso(scheduledAt);
    if (!iso) {
      setError('Pick a date and time for the interview');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const res = await apiFetch('/api/recruiter/interviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicationId,
          scheduledAt: iso,
          durationMins: Number(durationMins) || 30,
          mode,
          venue: venue.trim() || undefined,
          notes: notes.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not schedule the interview');
      onScheduled();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Could not schedule the interview');
      setSaving(false);
    }
  }

  return (
    <Modal
      isOpen
      onClose={onClose}
      title="Schedule interview"
      size="lg"
      footer={
        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="press px-5 py-2.5 rounded-[12px] text-[13.5px] font-semibold text-ink-muted hover:text-ink transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={saving}
            className="press inline-flex items-center gap-2 grad-brand text-white font-semibold text-[13.5px] rounded-[12px] px-5 py-2.5 shadow-brand hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:translate-y-0"
          >
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            Schedule
          </button>
        </div>
      }
    >
      <div className="space-y-5">
        <p className="text-[13.5px] text-ink-muted">
          <span className="font-semibold text-ink">{candidateName}</span> · {jobTitle}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Field label="Date and time" required>
            <TextInput
              type="datetime-local"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
            />
          </Field>

          <Field label="Duration (minutes)">
            <TextInput
              inputMode="numeric"
              value={durationMins}
              onChange={(e) => setDurationMins(e.target.value.replace(/\D/g, ''))}
              placeholder="30"
            />
          </Field>
        </div>

        <Field label="Interview mode">
          <RadioCards
            name="interviewMode"
            options={MODE_OPTIONS}
            value={mode}
            onChange={(v) => setMode(v)}
          />
        </Field>

        <Field label={VENUE_LABEL[mode]}>
          <TextInput
            value={venue}
            onChange={(e) => setVenue(e.target.value)}
            placeholder={VENUE_PLACEHOLDER[mode]}
          />
        </Field>

        <Field label="Notes for your team" hint="Not shared with the candidate.">
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            maxLength={2000}
            placeholder="Ask about brands worked on, licence, notice period…"
            className="w-full bg-white text-ink placeholder-ink-faint text-sm rounded-[14px] px-4 py-3 border border-line outline-none shadow-[inset_0_1px_2px_rgba(16,24,40,0.04)] transition-all duration-300 leading-[1.7] resize-none hover:border-[#D9DEE9] focus:border-brand-600 focus:shadow-[0_0_0_4px_rgba(15,76,129,0.10)]"
          />
        </Field>

        {error && (
          <p className="text-[13.5px] font-medium text-critical" role="alert">
            {error}
          </p>
        )}
      </div>
    </Modal>
  );
}
