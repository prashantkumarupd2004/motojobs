'use client';

import { useEffect, useState } from 'react';
import { Loader2, Mail } from 'lucide-react';
import { apiFetch } from '@/lib/http';
import {
  ADMIN_INPUT,
  ADMIN_TEXTAREA,
  ActionButton,
  EmptyState,
  Labelled,
  PageHeader,
  Panel,
  StatusPill,
} from '@/components/admin/ui';

interface Template {
  key: string;
  name: string;
  subject: string;
  bodyHtml: string;
  bodyText: string;
  variables: string[];
  isActive: boolean;
}

export default function EmailTemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [activeKey, setActiveKey] = useState('');
  const [draft, setDraft] = useState<Template | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    fetch('/api/admin/email-templates')
      .then(async (res) => {
        const data = await res.json();
        if (cancelled) return;
        if (!res.ok) {
          setError(data.error ?? 'Could not load templates');
          return;
        }
        const list: Template[] = data.templates ?? [];
        setTemplates(list);
        if (list.length > 0) {
          setActiveKey(list[0].key);
          setDraft({ ...list[0] });
        }
      })
      .catch(() => !cancelled && setError('Could not load templates'))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  function select(key: string) {
    const found = templates.find((t) => t.key === key);
    if (!found) return;
    setActiveKey(key);
    setDraft({ ...found });
    setMessage('');
    setError('');
  }

  function set<K extends keyof Template>(field: K, value: Template[K]) {
    setDraft((d) => (d ? { ...d, [field]: value } : d));
    setMessage('');
  }

  async function save() {
    if (!draft) return;
    setSaving(true);
    setMessage('');
    setError('');
    try {
      const res = await apiFetch('/api/admin/email-templates', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key: draft.key,
          name: draft.name,
          subject: draft.subject,
          bodyHtml: draft.bodyHtml,
          bodyText: draft.bodyText,
          isActive: draft.isActive,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Could not save');
      setTemplates((list) => list.map((t) => (t.key === draft.key ? data.template : t)));
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

  if (templates.length === 0) {
    return (
      <div className="space-y-5">
        <PageHeader title="Email Templates" subtitle="Transactional email copy" />
        <Panel>
          <div className="py-16 px-6">
            <EmptyState
              icon={Mail}
              title="No templates found"
              body="Run the database seed to create the default templates."
            />
          </div>
        </Panel>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Email Templates"
        subtitle="Copy for the transactional emails the platform sends"
        action={
          draft && (
            <div className="flex items-center gap-2">
              {message && (
                <span className="text-[13px] font-semibold text-positive">{message}</span>
              )}
              <ActionButton tone="primary" onClick={save} disabled={saving}>
                {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />} Save
              </ActionButton>
            </div>
          )
        }
      />

      <div className="flex gap-2 overflow-x-auto scroll-none">
        {templates.map((t) => (
          <button
            key={t.key}
            onClick={() => select(t.key)}
            className={`press shrink-0 px-4 py-2.5 rounded-[12px] text-[12.5px] font-semibold border transition-all duration-300 ${
              t.key === activeKey
                ? 'grad-brand text-white border-transparent shadow-brand'
                : 'bg-white border-line text-ink-muted hover:border-brand-200 hover:text-brand-700'
            }`}
          >
            {t.name}
          </button>
        ))}
      </div>

      {error && (
        <p className="bg-critical-soft border border-critical/20 text-critical rounded-[12px] px-4 py-3 text-[13.5px] font-medium">
          {error}
        </p>
      )}

      {draft && (
        <>
          <Panel
            title={draft.name}
            action={
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={draft.isActive}
                  onChange={(e) => set('isActive', e.target.checked)}
                  className="w-4 h-4 rounded border-line accent-brand-600 cursor-pointer"
                />
                <span className="text-[12.5px] text-ink-soft">Use this template</span>
              </label>
            }
          >
            <div className="p-5 space-y-4">
              {draft.variables.length > 0 && (
                <div>
                  <p className="text-[12px] text-ink-muted mb-2">
                    Available placeholders — copy these into the subject or body:
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {draft.variables.map((v) => (
                      <code
                        key={v}
                        className="text-[11.5px] font-medium bg-canvas border border-line-soft text-ink-soft rounded-full px-2.5 py-1"
                      >
                        {`{{${v}}}`}
                      </code>
                    ))}
                  </div>
                </div>
              )}

              <Labelled label="Subject line">
                <input
                  value={draft.subject}
                  onChange={(e) => set('subject', e.target.value)}
                  className={ADMIN_INPUT}
                />
              </Labelled>

              <Labelled
                label="HTML body"
                hint="Rendered for inboxes that support it."
              >
                <textarea
                  value={draft.bodyHtml}
                  onChange={(e) => set('bodyHtml', e.target.value)}
                  rows={10}
                  className={`${ADMIN_TEXTAREA} font-mono text-[12.5px]`}
                />
              </Labelled>

              <Labelled
                label="Plain-text body"
                hint="Always sent alongside the HTML — HTML-only mail scores badly with spam filters."
              >
                <textarea
                  value={draft.bodyText}
                  onChange={(e) => set('bodyText', e.target.value)}
                  rows={8}
                  className={`${ADMIN_TEXTAREA} font-mono text-[12.5px]`}
                />
              </Labelled>
            </div>
          </Panel>

          <Panel title="Preview">
            <div className="p-5">
              <p className="text-[12px] text-ink-muted mb-2">
                Subject: <span className="text-ink font-semibold">{draft.subject}</span>
              </p>
              <div
                className="bg-canvas border border-line-soft rounded-[12px] p-4 text-[13.5px] text-ink-soft leading-[1.7] [&_p]:mb-2 [&_strong]:font-semibold [&_strong]:text-ink"
                // The admin authored this copy themselves; it is not user input.
                dangerouslySetInnerHTML={{ __html: draft.bodyHtml }}
              />
              <p className="text-[11.5px] text-ink-faint mt-2">
                Placeholders are substituted when the email is sent.
              </p>
            </div>
          </Panel>
        </>
      )}
    </div>
  );
}
