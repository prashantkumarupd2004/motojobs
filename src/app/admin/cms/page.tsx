'use client';

import { useCallback, useEffect, useState } from 'react';
import { Blocks, Loader2, Plus, Trash2 } from 'lucide-react';
import { apiFetch } from '@/lib/http';
import {
  ADMIN_INPUT,
  ADMIN_TEXTAREA,
  ActionButton,
  Labelled,
  PageHeader,
  Panel,
  StatusPill,
} from '@/components/admin/ui';

type Blocks = Record<string, unknown>;

interface PageSummary {
  id: string;
  key: string;
  title: string;
  isPublished: boolean;
  updatedAt: string;
}

interface PageDetail extends PageSummary {
  blocks: Blocks;
  seoTitle: string | null;
  seoDescription: string | null;
}

/**
 * Which fields each page exposes. Keeping this here rather than deriving it
 * from the stored JSON means a page always shows its full form, including
 * fields the saved row happens not to have yet.
 */
const FIELDS: Record<string, Array<{ key: string; label: string; multiline?: boolean }>> = {
  HOME: [
    { key: 'heroTitle', label: 'Hero title' },
    { key: 'heroSubtitle', label: 'Hero subtitle', multiline: true },
    { key: 'heroImage', label: 'Hero image URL' },
    { key: 'primaryCtaLabel', label: 'Primary button label' },
    { key: 'primaryCtaHref', label: 'Primary button link' },
    { key: 'secondaryCtaLabel', label: 'Secondary button label' },
    { key: 'secondaryCtaHref', label: 'Secondary button link' },
  ],
  ABOUT: [{ key: 'body', label: 'Body copy', multiline: true }],
  CONTACT: [
    { key: 'body', label: 'Intro copy', multiline: true },
    { key: 'email', label: 'Contact email' },
    { key: 'phone', label: 'Contact phone' },
    { key: 'address', label: 'Address', multiline: true },
  ],
  PRIVACY: [{ key: 'body', label: 'Policy text', multiline: true }],
  TERMS: [{ key: 'body', label: 'Terms text', multiline: true }],
  FOOTER: [
    { key: 'tagline', label: 'Tagline' },
    { key: 'copyright', label: 'Copyright name' },
  ],
};

const asText = (v: unknown) => (typeof v === 'string' ? v : '');

export default function CmsPage() {
  const [pages, setPages] = useState<PageSummary[]>([]);
  const [activeKey, setActiveKey] = useState('HOME');
  const [detail, setDetail] = useState<PageDetail | null>(null);
  const [blocks, setBlocks] = useState<Blocks>({});
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    fetch('/api/admin/cms')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!cancelled && d?.pages) setPages(d.pages);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const loadPage = useCallback(async (key: string) => {
    setLoading(true);
    setMessage('');
    setError('');
    try {
      const res = await fetch(`/api/admin/cms?key=${key}`);
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Could not load this page');
        return;
      }
      setDetail(data.page);
      setBlocks(data.page.blocks ?? {});
      setSeoTitle(data.page.seoTitle ?? '');
      setSeoDescription(data.page.seoDescription ?? '');
    } catch {
      setError('Could not load this page');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadPage(activeKey);
  }, [activeKey, loadPage]);

  function setBlock(key: string, value: unknown) {
    setBlocks((b) => ({ ...b, [key]: value }));
    setMessage('');
  }

  async function save(publish?: boolean) {
    if (!detail) return;
    setSaving(true);
    setMessage('');
    setError('');
    try {
      const res = await apiFetch('/api/admin/cms', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key: activeKey,
          blocks,
          seoTitle: seoTitle.trim() || null,
          seoDescription: seoDescription.trim() || null,
          ...(publish !== undefined ? { isPublished: publish } : {}),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Could not save');
      setDetail(data.page);
      setPages((list) =>
        list.map((p) =>
          p.key === activeKey ? { ...p, isPublished: data.page.isPublished } : p
        )
      );
      setMessage('Saved');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save');
    } finally {
      setSaving(false);
    }
  }

  const fields = FIELDS[activeKey] ?? [];
  const isFaq = activeKey === 'FAQ';
  const faqItems = Array.isArray(blocks.items)
    ? (blocks.items as Array<{ q: string; a: string }>)
    : [];

  return (
    <div className="space-y-5">
      <PageHeader
        title="CMS"
        subtitle="Edit the copy on your public pages"
        action={
          detail && (
            <div className="flex items-center gap-2">
              {message && (
                <span className="text-[13px] font-semibold text-positive">{message}</span>
              )}
              <ActionButton tone="primary" onClick={() => save()} disabled={saving}>
                {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />} Save
              </ActionButton>
            </div>
          )
        }
      />

      <div className="flex gap-2 overflow-x-auto scroll-none">
        {pages.map((p) => (
          <button
            key={p.key}
            onClick={() => setActiveKey(p.key)}
            className={`press shrink-0 px-4 py-2.5 rounded-[12px] text-[12.5px] font-semibold border transition-all duration-300 ${
              p.key === activeKey
                ? 'grad-brand text-white border-transparent shadow-brand'
                : 'bg-white border-line text-ink-muted hover:border-brand-200 hover:text-brand-700'
            }`}
          >
            {p.title}
          </button>
        ))}
      </div>

      {error && (
        <p className="bg-critical-soft border border-critical/20 text-critical rounded-[12px] px-4 py-3 text-[13.5px] font-medium">
          {error}
        </p>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-7 h-7 text-brand-600 animate-spin" />
        </div>
      ) : detail ? (
        <div className="space-y-5">
          <Panel
            title={detail.title}
            action={
              <div className="flex items-center gap-2">
                <StatusPill
                  label={detail.isPublished ? 'Published' : 'Hidden'}
                  tone={detail.isPublished ? 'positive' : 'neutral'}
                />
                <button
                  onClick={() => save(!detail.isPublished)}
                  disabled={saving}
                  className="text-[12.5px] font-semibold text-brand-600 hover:text-brand-700 transition-colors disabled:opacity-50"
                >
                  {detail.isPublished ? 'Unpublish' : 'Publish'}
                </button>
              </div>
            }
          >
            <div className="p-5 space-y-4">
              {isFaq ? (
                <FaqEditor
                  items={faqItems}
                  onChange={(items) => setBlock('items', items)}
                />
              ) : (
                fields.map((f) => (
                  <Labelled key={f.key} label={f.label}>
                    {f.multiline ? (
                      <textarea
                        value={asText(blocks[f.key])}
                        onChange={(e) => setBlock(f.key, e.target.value)}
                        rows={f.key === 'body' ? 10 : 3}
                        className={ADMIN_TEXTAREA}
                      />
                    ) : (
                      <input
                        value={asText(blocks[f.key])}
                        onChange={(e) => setBlock(f.key, e.target.value)}
                        className={ADMIN_INPUT}
                      />
                    )}
                  </Labelled>
                ))
              )}
            </div>
          </Panel>

          <Panel title="SEO">
            <div className="p-5 space-y-4">
              <Labelled label="Meta title" hint="Falls back to the page title when empty.">
                <input
                  value={seoTitle}
                  onChange={(e) => {
                    setSeoTitle(e.target.value);
                    setMessage('');
                  }}
                  maxLength={200}
                  className={ADMIN_INPUT}
                />
              </Labelled>
              <Labelled label="Meta description">
                <textarea
                  value={seoDescription}
                  onChange={(e) => {
                    setSeoDescription(e.target.value);
                    setMessage('');
                  }}
                  rows={3}
                  maxLength={400}
                  className={ADMIN_TEXTAREA}
                />
              </Labelled>
            </div>
          </Panel>
        </div>
      ) : (
        <Panel>
          <div className="py-16 px-6 text-center">
            <Blocks className="w-6 h-6 text-ink-faint mx-auto mb-3" />
            <p className="text-[13.5px] text-ink-muted">Pick a page to edit.</p>
          </div>
        </Panel>
      )}
    </div>
  );
}

function FaqEditor({
  items,
  onChange,
}: {
  items: Array<{ q: string; a: string }>;
  onChange: (items: Array<{ q: string; a: string }>) => void;
}) {
  return (
    <div className="space-y-4">
      {items.map((item, i) => (
        <div key={i} className="bg-canvas border border-line-soft rounded-[12px] p-4 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <span className="text-[11.5px] font-bold uppercase tracking-[0.09em] text-ink-faint">
              Question {i + 1}
            </span>
            <button
              onClick={() => onChange(items.filter((_, j) => j !== i))}
              aria-label={`Remove question ${i + 1}`}
              className="text-ink-faint hover:text-critical transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
          <input
            value={item.q}
            onChange={(e) =>
              onChange(items.map((x, j) => (j === i ? { ...x, q: e.target.value } : x)))
            }
            placeholder="Question"
            className={ADMIN_INPUT}
          />
          <textarea
            value={item.a}
            onChange={(e) =>
              onChange(items.map((x, j) => (j === i ? { ...x, a: e.target.value } : x)))
            }
            placeholder="Answer"
            rows={3}
            className={ADMIN_TEXTAREA}
          />
        </div>
      ))}

      <ActionButton onClick={() => onChange([...items, { q: '', a: '' }])}>
        <Plus className="w-3.5 h-3.5" /> Add question
      </ActionButton>
    </div>
  );
}
