'use client';

import { useEffect, useState } from 'react';
import { KeyRound, Loader2, LogOut, User } from 'lucide-react';
import { apiFetch } from '@/lib/http';
import { useAuth } from '@/hooks/useAuth';
import {
  ADMIN_INPUT,
  ActionButton,
  Labelled,
  PageHeader,
  Panel,
  StatusPill,
} from '@/components/admin/ui';

interface Profile {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: string;
  lastLoginAt: string | null;
  createdAt: string;
}

interface LoginRow {
  id: string;
  success: boolean;
  ipAddress: string | null;
  createdAt: string;
}

const fmtDateTime = (iso: string) =>
  new Date(iso).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });

export default function AdminProfilePage() {
  const { logout, updateUser } = useAuth();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [logins, setLogins] = useState<LoginRow[]>([]);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(true);

  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState('');
  const [profileError, setProfileError] = useState('');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState('');
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({});
  const [passwordError, setPasswordError] = useState('');

  useEffect(() => {
    let cancelled = false;
    fetch('/api/admin/profile')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (cancelled || !d?.user) return;
        setProfile(d.user);
        setName(d.user.name ?? '');
        setPhone(d.user.phone ?? '');
        setLogins(d.recentLogins ?? []);
      })
      .catch(() => {})
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  async function saveProfile() {
    setSavingProfile(true);
    setProfileMessage('');
    setProfileError('');
    try {
      const res = await apiFetch('/api/admin/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), phone: phone.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Could not save');
      updateUser({ name: name.trim() });
      setProfileMessage('Saved');
    } catch (err) {
      setProfileError(err instanceof Error ? err.message : 'Could not save');
    } finally {
      setSavingProfile(false);
    }
  }

  async function changePassword() {
    setSavingPassword(true);
    setPasswordMessage('');
    setPasswordError('');
    setPasswordErrors({});
    try {
      const res = await apiFetch('/api/admin/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'password', currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.fieldErrors) setPasswordErrors(data.fieldErrors);
        throw new Error(data.error ?? 'Could not change password');
      }
      setCurrentPassword('');
      setNewPassword('');
      setPasswordMessage('Password updated');
    } catch (err) {
      setPasswordError(err instanceof Error ? err.message : 'Could not change password');
    } finally {
      setSavingPassword(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-7 h-7 text-brand-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-[720px] space-y-5">
      <PageHeader title="Profile" subtitle="Your admin account" />

      <Panel title="Account">
        <div className="p-5 space-y-4">
          {profileError && (
            <p className="bg-critical-soft border border-critical/20 text-critical rounded-[10px] px-3 py-2.5 text-[13px] font-medium">
              {profileError}
            </p>
          )}

          <div className="grid sm:grid-cols-2 gap-4">
            <Labelled label="Name">
              <input
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setProfileMessage('');
                }}
                className={ADMIN_INPUT}
              />
            </Labelled>
            <Labelled label="Phone">
              <input
                value={phone}
                maxLength={10}
                inputMode="numeric"
                onChange={(e) => {
                  setPhone(e.target.value.replace(/\D/g, ''));
                  setProfileMessage('');
                }}
                className={ADMIN_INPUT}
              />
            </Labelled>
          </div>

          <Labelled
            label="Email"
            hint="This is your login. Contact support to change it."
          >
            <input value={profile?.email ?? ''} readOnly disabled className={`${ADMIN_INPUT} opacity-60`} />
          </Labelled>

          <div className="flex items-center gap-3">
            <ActionButton
              tone="primary"
              onClick={saveProfile}
              disabled={savingProfile || name.trim().length < 2}
            >
              {savingProfile && <Loader2 className="w-3.5 h-3.5 animate-spin" />} Save changes
            </ActionButton>
            {profileMessage && (
              <span className="text-[13px] font-semibold text-positive">{profileMessage}</span>
            )}
          </div>
        </div>
      </Panel>

      <Panel title="Password">
        <div className="p-5 space-y-4">
          {passwordError && (
            <p className="bg-critical-soft border border-critical/20 text-critical rounded-[10px] px-3 py-2.5 text-[13px] font-medium">
              {passwordError}
            </p>
          )}

          <Labelled label="Current password" error={passwordErrors.currentPassword}>
            <input
              type="password"
              autoComplete="current-password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className={ADMIN_INPUT}
            />
          </Labelled>

          <Labelled
            label="New password"
            error={passwordErrors.newPassword}
            hint="At least 8 characters, with a letter and a number."
          >
            <input
              type="password"
              autoComplete="new-password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className={ADMIN_INPUT}
            />
          </Labelled>

          <div className="flex items-center gap-3">
            <ActionButton
              onClick={changePassword}
              disabled={savingPassword || !currentPassword || newPassword.length < 8}
            >
              {savingPassword ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <KeyRound className="w-3.5 h-3.5" />
              )}
              Change password
            </ActionButton>
            {passwordMessage && (
              <span className="text-[13px] font-semibold text-positive">{passwordMessage}</span>
            )}
          </div>
        </div>
      </Panel>

      <Panel title="Recent sign-ins">
        {logins.length === 0 ? (
          <p className="text-[13.5px] text-ink-muted px-5 py-10 text-center">
            No sign-ins recorded yet.
          </p>
        ) : (
          <ul className="divide-y divide-line-soft">
            {logins.map((l) => (
              <li key={l.id} className="flex items-center justify-between gap-3 px-5 py-3">
                <span className="text-[13px] text-ink-soft">{fmtDateTime(l.createdAt)}</span>
                <span className="flex items-center gap-2 shrink-0">
                  {l.ipAddress && <span className="text-[12px] text-ink-faint">{l.ipAddress}</span>}
                  <StatusPill
                    label={l.success ? 'Success' : 'Failed'}
                    tone={l.success ? 'positive' : 'critical'}
                  />
                </span>
              </li>
            ))}
          </ul>
        )}
      </Panel>

      <Panel title="Session">
        <div className="p-5 flex items-center gap-3">
          <button
            type="button"
            onClick={logout}
            className="press inline-flex items-center gap-1.5 border border-line rounded-[11px] px-3.5 py-2 text-[13px] font-semibold text-ink-muted hover:text-critical hover:border-critical/30 hover:bg-critical-soft transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" /> Log out
          </button>
          <span className="inline-flex items-center gap-1.5 text-[12.5px] text-ink-faint">
            <User className="w-3.5 h-3.5" />
            Signed in as {profile?.email}
          </span>
        </div>
      </Panel>
    </div>
  );
}
