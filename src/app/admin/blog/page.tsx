'use client';

import { useCallback, useEffect, useState } from 'react';
import { FileText, Loader2, Pencil, Plus, Trash2 } from 'lucide-react';
import { apiFetch } from '@/lib/http';
import { MAX_IMAGE_BYTES } from '@/lib/automotive';
import { useAdminList } from '@/hooks/useAdminList';
import DataTable, { type Column } from '@/components/admin/DataTable';
import Drawer, { DetailSection } from '@/components/admin/Drawer';
import FileUpload from '@/components/form/FileUpload';
import {
  ADMIN_INPUT,
  ADMIN_TEXTAREA,
  ActionButton,
  EmptyState,
  FilterBar,
  Labelled,
  PageHeader,
  SearchInput,
  Select,
  StatusPill,
} from '@/components/admin/ui';

interface Row {
  id: string;
  slug: string;
  title: string;
  category: string | null;
  status: string;
  views: number;
  readMinutes: number;
  publishedAt: string | null;
  updatedAt: string;
}

interface Draft {
  id?: string;
  title: string;
  slug: string;
  excerpt: string;
  body: string;
  category: string;
  tags: string;
  coverImage: string;
  authorName: string;
  seoTitle: string;
  seoDescription: string;
  status: 'DRAFT' | 'PUBLISHED';
}

const EMPTY: Draft = {
  title: '',
  slug: '',
  excerpt: '',
  body: '',
  category: '',
  tags: '',
  coverImage: '',
  authorName: 'Motojobs Editorial',
  seoTitle: '',
  seoDescription: '',
  status: 'DRAFT',
};

const fmtDate = (iso: string | null) =>
  iso ? new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

export default function AdminBlogPage() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(1);

  const [categories, setCategories] = useState<string[]>([]);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [loadingPost, setLoadingPost] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState('');

  const { items, total, totalPages, loading, error, reload } = useAdminList<Row>(
    '/api/admin/blog',
    { search, status, category, page },
    { key: 'posts' }
  );

  useEffect(() => {
    setPage(1);
  }, [search, status, category]);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/admin/blog?limit=1')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!cancelled && d?.categories) setCategories(d.categories);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const openEditor = useCallback(async (id?: string) => {
    setEditorOpen(true);
    setErrors({});
    setFormError('');
    if (!id) {
      setDraft({ ...EMPTY });
      return;
    }
    setLoadingPost(true);
    try {
      const res = await fetch(`/api/admin/blog?id=${id}`);
      const data = await res.json();
      if (res.ok) {
        const p = data.post;
        setDraft({
          id: p.id,
          title: p.title ?? '',
          slug: p.slug ?? '',
          excerpt: p.excerpt ?? '',
          body: p.body ?? '',
          category: p.category ?? '',
          tags: (p.tags ?? []).join(', '),
          coverImage: p.coverImage ?? '',
          authorName: p.authorName ?? '',
          seoTitle: p.seoTitle ?? '',
          seoDescription: p.seoDescription ?? '',
          status: p.status ?? 'DRAFT',
        });
      }
    } finally {
      setLoadingPost(false);
    }
  }, []);

  function set<K extends keyof Draft>(key: K, value: Draft[K]) {
    setDraft((d) => (d ? { ...d, [key]: value } : d));
    setErrors((e) => {
      if (!e[key as string]) return e;
      const next = { ...e };
      delete next[key as string];
      return next;
    });
  }

  async function save(nextStatus?: 'DRAFT' | 'PUBLISHED') {
    if (!draft) return;
    setSaving(true);
    setErrors({});
    setFormError('');

    const payload = {
      ...(draft.id ? { id: draft.id } : {}),
      title: draft.title.trim(),
      slug: draft.slug.trim() || undefined,
      excerpt: draft.excerpt.trim() || null,
      body: draft.body,
      category: draft.category.trim() || null,
      tags: draft.tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
      coverImage: draft.coverImage || null,
      authorName: draft.authorName.trim() || null,
      seoTitle: draft.seoTitle.trim() || null,
      seoDescription: draft.seoDescription.trim() || null,
      status: nextStatus ?? draft.status,
    };

    try {
      const res = await apiFetch('/api/admin/blog', {
        method: draft.id ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.fieldErrors) setErrors(data.fieldErrors);
        throw new Error(data.error ?? 'Could not save');
      }
      setEditorOpen(false);
      setDraft(null);
      void reload();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Could not save');
    } finally {
      setSaving(false);
    }
  }

  async function remove(row: Row) {
    if (!window.confirm(`Delete "${row.title}"? This cannot be undone.`)) return;
    const res = await apiFetch(`/api/admin/blog?id=${row.id}`, { method: 'DELETE' });
    if (res.ok) void reload();
  }

  const columns: Array<Column<Row>> = [
    {
      key: 'title',
      header: 'Post',
      render: (r) => (
        <div className="min-w-0">
          <p className="font-semibold text-ink truncate">{r.title}</p>
          <p className="text-[12px] text-ink-muted truncate">/{r.slug}</p>
        </div>
      ),
    },
    { key: 'category', header: 'Category', hideOnMobile: true, render: (r) => r.category || '—' },
    { key: 'views', header: 'Views', hideOnMobile: true, render: (r) => r.views },
    {
      key: 'status',
      header: 'Status',
      render: (r) => (
        <StatusPill
          label={r.status === 'PUBLISHED' ? 'Published' : 'Draft'}
          tone={r.status === 'PUBLISHED' ? 'positive' : 'neutral'}
        />
      ),
    },
    {
      key: 'publishedAt',
      header: 'Published',
      hideOnMobile: true,
      render: (r) => fmtDate(r.publishedAt),
    },
    {
      key: 'actions',
      header: '',
      className: 'text-right',
      render: (r) => (
        <div className="inline-flex items-center gap-1.5">
          <button
            onClick={() => openEditor(r.id)}
            aria-label={`Edit ${r.title}`}
            className="p-2 rounded-[9px] border border-line bg-white text-ink-muted hover:text-brand-700 hover:border-brand-200 transition-colors"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => remove(r)}
            aria-label={`Delete ${r.title}`}
            className="p-2 rounded-[9px] border border-line bg-white text-ink-muted hover:text-[#B32B2B] hover:border-[#F3C9C9] transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        title="Blog"
        subtitle={`${total} post${total === 1 ? '' : 's'}`}
        action={
          <ActionButton tone="primary" onClick={() => openEditor()}>
            <Plus className="w-3.5 h-3.5" /> New post
          </ActionButton>
        }
      />

      <FilterBar>
        <SearchInput value={search} onChange={setSearch} placeholder="Search posts…" />
        <Select
          value={status}
          onChange={setStatus}
          placeholder="Any status"
          aria-label="Filter by status"
          options={[
            { value: 'PUBLISHED', label: 'Published' },
            { value: 'DRAFT', label: 'Draft' },
          ]}
        />
        {categories.length > 0 && (
          <Select
            value={category}
            onChange={setCategory}
            placeholder="All categories"
            aria-label="Filter by category"
            options={categories.map((c) => ({ value: c, label: c }))}
          />
        )}
      </FilterBar>

      {error && (
        <p className="bg-critical-soft border border-critical/20 text-critical rounded-[12px] px-4 py-3 text-[13.5px] font-medium">
          {error}
        </p>
      )}

      <DataTable
        columns={columns}
        rows={items}
        rowKey={(r) => r.id}
        loading={loading}
        page={page}
        total={total}
        totalPages={totalPages}
        onPageChange={setPage}
        empty={
          <EmptyState
            icon={FileText}
            title="No posts yet"
            body="Write your first post to start the blog."
          />
        }
      />

      <Drawer
        open={editorOpen}
        onClose={() => {
          setEditorOpen(false);
          setDraft(null);
        }}
        title={draft?.id ? 'Edit post' : 'New post'}
        subtitle={draft?.title || undefined}
        footer={
          draft && (
            <div className="flex flex-wrap items-center gap-2">
              <ActionButton tone="primary" onClick={() => save()} disabled={saving}>
                {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />} Save
              </ActionButton>
              {draft.status !== 'PUBLISHED' ? (
                <ActionButton onClick={() => save('PUBLISHED')} disabled={saving}>
                  Publish
                </ActionButton>
              ) : (
                <ActionButton onClick={() => save('DRAFT')} disabled={saving}>
                  Unpublish
                </ActionButton>
              )}
            </div>
          )
        }
      >
        {loadingPost && !draft ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 text-brand-600 animate-spin" />
          </div>
        ) : draft ? (
          <>
            {formError && (
              <p className="bg-critical-soft border border-critical/20 text-critical rounded-[10px] px-3 py-2.5 text-[13px] font-medium mb-4">
                {formError}
              </p>
            )}

            <DetailSection title="Content">
              <div className="space-y-3.5">
                <Labelled label="Title" error={errors.title}>
                  <input
                    value={draft.title}
                    onChange={(e) => set('title', e.target.value)}
                    className={ADMIN_INPUT}
                  />
                </Labelled>

                <Labelled
                  label="URL slug"
                  hint={draft.id ? 'Changing this breaks existing links.' : 'Generated from the title when empty.'}
                >
                  <input
                    value={draft.slug}
                    onChange={(e) => set('slug', e.target.value)}
                    placeholder="my-post-title"
                    className={ADMIN_INPUT}
                  />
                </Labelled>

                <Labelled label="Excerpt" hint="Shown on the blog listing.">
                  <textarea
                    value={draft.excerpt}
                    onChange={(e) => set('excerpt', e.target.value)}
                    rows={2}
                    className={ADMIN_TEXTAREA}
                  />
                </Labelled>

                <Labelled
                  label="Body"
                  error={errors.body}
                  hint="Lines starting with ## render as headings."
                >
                  <textarea
                    value={draft.body}
                    onChange={(e) => set('body', e.target.value)}
                    rows={16}
                    className={ADMIN_TEXTAREA}
                  />
                </Labelled>
              </div>
            </DetailSection>

            <DetailSection title="Featured image">
              <div className="flex items-start gap-4">
                <div className="w-20 h-16 shrink-0 rounded-[10px] bg-canvas border border-line overflow-hidden">
                  {draft.coverImage && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={draft.coverImage} alt="" className="w-full h-full object-cover" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <FileUpload
                    accept=".jpg,.jpeg,.png,.webp"
                    maxBytes={MAX_IMAGE_BYTES}
                    value={draft.coverImage}
                    fileName="Cover image"
                    onChange={(r) => set('coverImage', r?.url ?? '')}
                    label="Upload cover"
                  />
                </div>
              </div>
            </DetailSection>

            <DetailSection title="Metadata">
              <div className="space-y-3.5">
                <Labelled label="Category">
                  <input
                    value={draft.category}
                    onChange={(e) => set('category', e.target.value)}
                    placeholder="Interview Prep"
                    list="blog-categories"
                    className={ADMIN_INPUT}
                  />
                  <datalist id="blog-categories">
                    {categories.map((c) => (
                      <option key={c} value={c} />
                    ))}
                  </datalist>
                </Labelled>

                <Labelled label="Tags" hint="Comma separated.">
                  <input
                    value={draft.tags}
                    onChange={(e) => set('tags', e.target.value)}
                    placeholder="service advisor, interview, dealership"
                    className={ADMIN_INPUT}
                  />
                </Labelled>

                <Labelled label="Author byline">
                  <input
                    value={draft.authorName}
                    onChange={(e) => set('authorName', e.target.value)}
                    className={ADMIN_INPUT}
                  />
                </Labelled>
              </div>
            </DetailSection>

            <DetailSection title="SEO">
              <div className="space-y-3.5">
                <Labelled label="Meta title" hint="Falls back to the post title.">
                  <input
                    value={draft.seoTitle}
                    onChange={(e) => set('seoTitle', e.target.value)}
                    maxLength={200}
                    className={ADMIN_INPUT}
                  />
                </Labelled>
                <Labelled label="Meta description" hint="Falls back to the excerpt.">
                  <textarea
                    value={draft.seoDescription}
                    onChange={(e) => set('seoDescription', e.target.value)}
                    rows={3}
                    maxLength={400}
                    className={ADMIN_TEXTAREA}
                  />
                </Labelled>
              </div>
            </DetailSection>
          </>
        ) : null}
      </Drawer>
    </div>
  );
}
