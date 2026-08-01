'use client';

import { useState } from 'react';
import { CheckCircle, Loader2, Mail, MapPin, Phone, Send } from 'lucide-react';
import { apiFetch } from '@/lib/http';
import { Field, TextInput } from '@/components/form';

const SUBJECTS = [
  'General enquiry',
  'Employer plans & pricing',
  'Trouble with my account',
  'Report a job posting',
  'Partnership',
];

const CHANNELS = [
  { Icon: Mail, label: 'Email', value: 'hello@motojobs.in', href: 'mailto:hello@motojobs.in' },
  { Icon: Phone, label: 'Phone', value: '+91 90000 00000', href: 'tel:+919000000000' },
  { Icon: MapPin, label: 'Office', value: 'Pune, Maharashtra', href: null },
];

const EMPTY = { name: '', email: '', phone: '', subject: SUBJECTS[0], message: '' };

export default function ContactPage() {
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState('');
  const [error, setError] = useState('');

  const set =
    (key: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      setForm((f) => ({ ...f, [key]: e.target.value }));
      setErrors((prev) => {
        if (!prev[key]) return prev;
        const next = { ...prev };
        delete next[key];
        return next;
      });
    };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    setError('');
    setErrors({});
    try {
      const res = await apiFetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.fieldErrors) setErrors(data.fieldErrors);
        throw new Error(data.error || 'Could not send your message');
      }
      setSent(data.message);
      setForm(EMPTY);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Could not send your message');
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-5 sm:px-8 lg:px-10 py-12 lg:py-20">
      <div className="max-w-2xl">
        <h1 className="text-[34px] sm:text-[42px] font-extrabold text-ink tracking-[-0.04em] leading-[1.1]">
          Talk to us
        </h1>
        <p className="text-ink-muted text-[16px] leading-[1.75] mt-4">
          Hiring question, account trouble, or something that looks wrong on the site — send
          it over and a real person will reply within one working day.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-12">
        <div className="lg:col-span-2 surface sheen p-7 sm:p-9">
          {sent ? (
            <div className="py-12 text-center animate-scale-in">
              <span className="w-14 h-14 rounded-full bg-positive-soft flex items-center justify-center mx-auto">
                <CheckCircle className="w-7 h-7 text-positive" />
              </span>
              <h2 className="text-[20px] font-bold text-ink tracking-[-0.025em] mt-5">
                Message sent
              </h2>
              <p className="text-ink-muted text-[14.5px] leading-[1.7] mt-2.5 max-w-sm mx-auto">
                {sent}
              </p>
              <button
                type="button"
                onClick={() => setSent('')}
                className="mt-7 text-[14px] font-semibold text-brand-600 hover:text-brand-700"
              >
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div
                  role="alert"
                  className="bg-critical-soft border border-critical/20 text-critical rounded-[14px] px-4 py-3 text-sm font-medium"
                >
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <Field label="Your name" htmlFor="name" required error={errors.name}>
                  <TextInput
                    id="name"
                    value={form.name}
                    onChange={set('name')}
                    error={Boolean(errors.name)}
                    placeholder="Rahul Sharma"
                    autoComplete="name"
                  />
                </Field>

                <Field label="Email" htmlFor="email" required error={errors.email}>
                  <TextInput
                    id="email"
                    type="email"
                    value={form.email}
                    onChange={set('email')}
                    error={Boolean(errors.email)}
                    placeholder="you@example.com"
                    autoComplete="email"
                  />
                </Field>

                <Field label="Phone" htmlFor="phone" error={errors.phone}>
                  <TextInput
                    id="phone"
                    type="tel"
                    value={form.phone}
                    onChange={set('phone')}
                    error={Boolean(errors.phone)}
                    placeholder="+91 98765 43210"
                    autoComplete="tel"
                  />
                </Field>

                <Field label="Subject" htmlFor="subject" required error={errors.subject}>
                  <select
                    id="subject"
                    value={form.subject}
                    onChange={set('subject')}
                    className="w-full bg-white text-ink text-sm rounded-[14px] px-4 py-3 border border-line outline-none shadow-[inset_0_1px_2px_rgba(16,24,40,0.04)] transition-all duration-300 hover:border-[#D9DEE9] focus:border-brand-600 focus:shadow-[0_0_0_4px_rgba(15,76,129,0.10)]"
                  >
                    {SUBJECTS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>

              <Field
                label="Message"
                htmlFor="message"
                required
                error={errors.message}
                hint="At least 20 characters, so we can actually help."
              >
                <textarea
                  id="message"
                  value={form.message}
                  onChange={set('message')}
                  rows={6}
                  maxLength={4000}
                  placeholder="Tell us what you need help with…"
                  className={`w-full bg-white text-ink placeholder-ink-faint text-sm rounded-[14px] px-4 py-3 border outline-none shadow-[inset_0_1px_2px_rgba(16,24,40,0.04)] transition-all duration-300 leading-[1.7] resize-none ${
                    errors.message
                      ? 'border-critical'
                      : 'border-line hover:border-[#D9DEE9] focus:border-brand-600 focus:shadow-[0_0_0_4px_rgba(15,76,129,0.10)]'
                  }`}
                />
              </Field>

              <button
                type="submit"
                disabled={sending}
                className="w-full sm:w-auto grad-brand text-white font-semibold text-[15px] rounded-[14px] px-7 py-3.5 shadow-brand hover:-translate-y-0.5 hover:shadow-e4 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-y-0 inline-flex items-center justify-center gap-2 transition-all duration-300 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)]"
              >
                {sending ? (
                  <>
                    <Loader2 className="w-[18px] h-[18px] animate-spin" />
                    Sending…
                  </>
                ) : (
                  <>
                    <Send className="w-[18px] h-[18px]" />
                    Send message
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        <aside className="space-y-4">
          {CHANNELS.map(({ Icon, label, value, href }) => {
            const body = (
              <>
                <span className="w-10 h-10 shrink-0 rounded-[13px] bg-brand-50 flex items-center justify-center">
                  <Icon className="w-[18px] h-[18px] text-brand-600" />
                </span>
                <span className="min-w-0">
                  <span className="block text-[12.5px] font-semibold uppercase tracking-[0.1em] text-ink-faint">
                    {label}
                  </span>
                  <span className="block text-[14.5px] font-semibold text-ink mt-1 truncate">
                    {value}
                  </span>
                </span>
              </>
            );
            return href ? (
              <a
                key={label}
                href={href}
                className="surface p-5 flex items-center gap-4 hover:-translate-y-0.5 hover:shadow-e3 transition-all duration-300"
              >
                {body}
              </a>
            ) : (
              <div key={label} className="surface p-5 flex items-center gap-4">
                {body}
              </div>
            );
          })}

          <div className="surface p-5">
            <h2 className="text-[14px] font-bold text-ink tracking-[-0.02em]">
              Support hours
            </h2>
            <p className="text-ink-muted text-[13.5px] leading-[1.7] mt-2">
              Monday to Saturday, 9:30 AM – 6:30 PM IST. Closed on national holidays.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
