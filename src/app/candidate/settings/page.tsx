'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Bell, KeyRound, Loader2, LogOut, User } from 'lucide-react';
import { apiFetch } from '@/lib/http';
import { useAuth } from '@/hooks/useAuth';

export default function CandidateSettingsPage() {
  const { user, logout, updateUser } = useAuth();
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [openToWork, setOpenToWork] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    fetch('/api/candidate/profile')
      .then((r) => (r.ok ? r.json() : null))
      .then((res) => {
        if (cancelled || !res?.data) return;
        const d = res.data;
        setFullName(d.user?.name ?? '');
        setPhone(d.user?.phone ?? '');
        setEmail(d.user?.email ?? '');
        setOpenToWork(d.isOpenToWork ?? true);
      })
      .catch(() => {})
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  const save = useCallback(
    async (patch: Record<string, unknown>) => {
      setSaving(true);
      setMessage('');
      setError('');
      try {
        const res = await apiFetch('/api/candidate/profile', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(patch),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? 'Could not save');
        if (typeof patch.fullName === 'string') updateUser({ name: patch.fullName });
        setMessage('Saved');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Could not save');
      } finally {
        setSaving(false);
      }
    },
    [updateUser]
  );

  if (loading) {
    return (
      <div className="max-w-[720px] space-y-4">
        <div className="bg-white border border-line rounded-[16px] h-64 skeleton" />
        <div className="bg-white border border-line rounded-[16px] h-36 skeleton" />
      </div>
    );
  }

  return (
    <div className="max-w-[720px] space-y-6">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-[24px] font-extrabold text-ink tracking-[-0.03em]">Settings</h1>
          <p className="text-[14px] text-ink-muted mt-1">Manage your account and preferences.</p>
        </div>
        {saving ? (
          <Loader2 className="w-4 h-4 text-brand-600 animate-spin mt-2 shrink-0" />
        ) : message ? (
          <span className="text-[13px] font-semibold text-positive mt-2 shrink-0">{message}</span>
        ) : null}
      </header>

      {error && (
        <p className="text-[13.5px] font-medium text-critical" role="alert">
          {error}
        </p>
      )}

      <Section icon={User} title="Account">
        <div className="grid sm:grid-cols-2 gap-4">
          <Labelled label="Full name">
            <input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className={INPUT}
              placeholder="Your name"
            />
          </Labelled>
          <Labelled label="Mobile number">
            <input
              value={phone}
              maxLength={10}
              inputMode="numeric"
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
              className={INPUT}
              placeholder="9876543210"
            />
          </Labelled>
        </div>

        <Labelled label="Email address" hint="Verified at sign-up. Contact support to change it.">
          <input value={email} readOnly disabled className={`${INPUT} opacity-60`} />
        </Labelled>

        <button
          type="button"
          onClick={() => save({ fullName: fullName.trim(), phone: phone.trim() })}
          disabled={saving || fullName.trim().length < 2}
          className="grad-brand text-white font-semibold text-[14px] rounded-[12px] px-5 py-2.5 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Save changes
        </button>
      </Section>

      <Section icon={Bell} title="Job search preferences">
        <label className="flex items-start justify-between gap-4 cursor-pointer">
          <span className="min-w-0">
            <span className="block text-[14px] font-semibold text-ink">Open to work</span>
            <span className="block text-[12.5px] text-ink-muted mt-0.5 leading-[1.55]">
              When off, your profile is hidden from recruiter searches.
            </span>
          </span>
          <input
            type="checkbox"
            checked={openToWork}
            onChange={(e) => {
              setOpenToWork(e.target.checked);
              void save({ isOpenToWork: e.target.checked });
            }}
            className="mt-1 w-4 h-4 rounded border-line cursor-pointer accent-brand-600 shrink-0"
          />
        </label>
      </Section>

      <Section icon={KeyRound} title="Password">
        <p className="text-[13.5px] text-ink-muted leading-[1.6]">
          We email you a one-time code to set a new password.
        </p>
        <Link
          href={`/forgot-password?email=${encodeURIComponent(email)}`}
          className="inline-flex items-center gap-1.5 border border-line rounded-[12px] px-4 py-2.5 text-[13.5px] font-semibold text-ink-soft hover:text-brand-700 hover:border-brand-200 transition-colors w-fit"
        >
          Change password <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </Section>

      <Section icon={LogOut} title="Sign out">
        <button
          type="button"
          onClick={logout}
          className="border border-line rounded-[12px] px-4 py-2.5 text-[13.5px] font-semibold text-ink-muted hover:text-critical hover:border-critical/30 hover:bg-critical-soft transition-colors w-fit"
        >
          Logout of {user?.email ?? 'this account'}
        </button>
      </Section>
    </div>
  );
}

const INPUT =
  'w-full h-[46px] bg-white border border-line rounded-[12px] px-3.5 text-[14px] text-ink outline-none focus:border-brand-600 transition-colors';

function Section({
  icon: Icon,
  title,
  children,
}: {
  icon: typeof User;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="bg-white border border-line rounded-[16px] p-6">
      <div className="flex items-center gap-2.5 mb-5">
        <span className="w-9 h-9 rounded-[11px] bg-brand-50 border border-brand-100 flex items-center justify-center shrink-0">
          <Icon className="w-[17px] h-[17px] text-brand-600" strokeWidth={2.1} />
        </span>
        <h2 className="text-[15.5px] font-bold text-ink">{title}</h2>
      </div>
      <div className="flex flex-col gap-4">{children}</div>
    </section>
  );
}

function Labelled({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="block text-[13px] font-semibold text-ink mb-1.5">{label}</span>
      {children}
      {hint && <span className="block text-[12px] text-ink-faint mt-1.5">{hint}</span>}
    </label>
  );
}
