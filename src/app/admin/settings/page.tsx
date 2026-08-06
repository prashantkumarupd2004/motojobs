'use client';

import { useEffect, useMemo, useState } from 'react';
import { Loader2, Settings as SettingsIcon } from 'lucide-react';
import { apiFetch } from '@/lib/http';
import { MAX_IMAGE_BYTES } from '@/lib/automotive';
import FileUpload from '@/components/form/FileUpload';
import {
  ADMIN_INPUT,
  ADMIN_TEXTAREA,
  ActionButton,
  EmptyState,
  Labelled,
  PageHeader,
  Panel,
} from '@/components/admin/ui';

interface Setting {
  key: string;
  label: string;
  group: string;
  inputType: string;
  hint: string | null;
  isSecret: boolean;
  value: string;
  hasValue: boolean;
}

const GROUP_LABEL: Record<string, string> = {
  BRANDING: 'Branding',
  CONTACT: 'Contact',
  SOCIAL: 'Social media',
  SEO: 'SEO',
  ANALYTICS: 'Analytics',
  EMAIL: 'Email',
};

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Setting[]>([]);
  const [values, setValues] = useState<Record<string, string>>({});
  const [activeGroup, setActiveGroup] = useState('BRANDING');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    fetch('/api/admin/settings')
      .then(async (res) => {
        const data = await res.json();
        if (cancelled) return;
        if (!res.ok) {
          setError(data.error ?? 'Could not load settings');
          return;
        }
        const list: Setting[] = data.settings ?? [];
        setSettings(list);
        setValues(Object.fromEntries(list.map((s) => [s.key, s.value])));
        if (list.length > 0 && !list.some((s) => s.group === 'BRANDING')) {
          setActiveGroup(list[0].group);
        }
      })
      .catch(() => !cancelled && setError('Could not load settings'))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  const groups = useMemo(
    () => [...new Set(settings.map((s) => s.group))],
    [settings]
  );

  const visible = settings.filter((s) => s.group === activeGroup);

  function set(key: string, value: string) {
    setValues((v) => ({ ...v, [key]: value }));
    setMessage('');
  }

  async function save() {
    setSaving(true);
    setMessage('');
    setError('');
    try {
      // Only the visible group is submitted, so an untouched tab is never
      // rewritten with stale state.
      const payload = Object.fromEntries(visible.map((s) => [s.key, values[s.key] ?? '']));
      const res = await apiFetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ values: payload }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Could not save');
      setMessage('Saved');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-7 h-7 text-brand-600 animate-spin" />
      </div>
    );
  }

  if (settings.length === 0) {
    return (
      <div className="space-y-5">
        <PageHeader title="Website Settings" subtitle="Branding, contact and integrations" />
        <Panel>
          <div className="py-16 px-6">
            <EmptyState
              icon={SettingsIcon}
              title="No settings found"
              body="Run the database seed to create the default settings."
            />
          </div>
        </Panel>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Website Settings"
        subtitle="Branding, contact details and integrations"
        action={
          <div className="flex items-center gap-2">
            {message && <span className="text-[13px] font-semibold text-positive">{message}</span>}
            <ActionButton tone="primary" onClick={save} disabled={saving}>
              {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />} Save
            </ActionButton>
          </div>
        }
      />

      <div className="flex gap-2 overflow-x-auto scroll-none">
        {groups.map((g) => (
          <button
            key={g}
            onClick={() => {
              setActiveGroup(g);
              setMessage('');
            }}
            className={`press shrink-0 px-4 py-2.5 rounded-[12px] text-[12.5px] font-semibold border transition-all duration-300 ${
              g === activeGroup
                ? 'grad-brand text-white border-transparent shadow-brand'
                : 'bg-white border-line text-ink-muted hover:border-brand-200 hover:text-brand-700'
            }`}
          >
            {GROUP_LABEL[g] ?? g}
          </button>
        ))}
      </div>

      {error && (
        <p className="bg-critical-soft border border-critical/20 text-critical rounded-[12px] px-4 py-3 text-[13.5px] font-medium">
          {error}
        </p>
      )}

      <Panel title={GROUP_LABEL[activeGroup] ?? activeGroup}>
        <div className="p-5 space-y-4">
          {visible.map((s) => (
            <Labelled
              key={s.key}
              label={s.label}
              hint={
                s.isSecret
                  ? s.hasValue
                    ? 'A value is saved. Leave blank to keep it, or type a new one to replace it.'
                    : 'Not set.'
                  : (s.hint ?? undefined)
              }
            >
              {s.inputType === 'IMAGE' ? (
                <div className="flex items-start gap-4">
                  {values[s.key] && (
                    <div className="w-16 h-16 shrink-0 rounded-[12px] bg-canvas border border-line overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={values[s.key]}
                        alt=""
                        className="w-full h-full object-contain"
                      />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <FileUpload
                      accept=".jpg,.jpeg,.png,.webp"
                      maxBytes={MAX_IMAGE_BYTES}
                      value={values[s.key]}
                      fileName={s.label}
                      onChange={(r) => set(s.key, r?.url ?? '')}
                      label={`Upload ${s.label.toLowerCase()}`}
                    />
                  </div>
                </div>
              ) : s.inputType === 'TEXTAREA' ? (
                <textarea
                  value={values[s.key] ?? ''}
                  onChange={(e) => set(s.key, e.target.value)}
                  rows={4}
                  className={ADMIN_TEXTAREA}
                />
              ) : (
                <input
                  type={s.isSecret ? 'password' : s.inputType === 'EMAIL' ? 'email' : 'text'}
                  value={values[s.key] ?? ''}
                  onChange={(e) => set(s.key, e.target.value)}
                  autoComplete={s.isSecret ? 'new-password' : undefined}
                  className={ADMIN_INPUT}
                />
              )}
            </Labelled>
          ))}
        </div>
      </Panel>

      {activeGroup === 'SEO' && (
        <Panel title="Generated files">
          <div className="p-5 space-y-2">
            <p className="text-[13px] text-ink-muted">
              These are generated from your routes and the settings above.
            </p>
            <div className="flex gap-2">
              <a
                href="/robots.txt"
                target="_blank"
                rel="noopener noreferrer"
                className="press inline-flex items-center gap-1.5 bg-white border border-line rounded-[11px] px-3.5 py-2 text-[13px] font-semibold text-ink-soft hover:text-brand-700 hover:border-brand-200 transition-all"
              >
                View robots.txt
              </a>
              <a
                href="/sitemap.xml"
                target="_blank"
                rel="noopener noreferrer"
                className="press inline-flex items-center gap-1.5 bg-white border border-line rounded-[11px] px-3.5 py-2 text-[13px] font-semibold text-ink-soft hover:text-brand-700 hover:border-brand-200 transition-all"
              >
                View sitemap.xml
              </a>
            </div>
          </div>
        </Panel>
      )}
    </div>
  );
}
