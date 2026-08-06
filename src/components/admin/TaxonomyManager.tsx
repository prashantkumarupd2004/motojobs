'use client';

import { useCallback, useEffect, useState } from 'react';
import { Check, Loader2, Pencil, Plus, Trash2, X } from 'lucide-react';
import { apiFetch } from '@/lib/http';
import DataTable, { type Column } from '@/components/admin/DataTable';
import {
  ADMIN_INPUT,
  ActionButton,
  EmptyState,
  FilterBar,
  PageHeader,
  Panel,
  SearchInput,
  Select,
  StatusPill,
} from '@/components/admin/ui';

interface Entry {
  id: string;
  kind: string;
  value: string;
  label: string;
  group: string | null;
  blurb: string | null;
  isActive: boolean;
  sortOrder: number;
}

/**
 * Backs Categories, Skills, Qualifications and the two employment lists. They
 * differ only in copy and whether a `group` column applies, so they share one
 * component rather than four near-identical pages.
 */
export default function TaxonomyManager({
  kind,
  title,
  subtitle,
  itemNoun,
  showGroup = false,
  groupLabel = 'Group',
  showBlurb = false,
  icon: Icon,
}: {
  kind: string;
  title: string;
  subtitle: string;
  itemNoun: string;
  showGroup?: boolean;
  groupLabel?: string;
  showBlurb?: boolean;
  icon: React.ComponentType<{ className?: string }>;
}) {
  const [items, setItems] = useState<Entry[]>([]);
  const [groups, setGroups] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [group, setGroup] = useState('');

  const [newLabel, setNewLabel] = useState('');
  const [newGroup, setNewGroup] = useState('');
  const [adding, setAdding] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState('');

  const load = useCallback(async () => {
    setError('');
    const params = new URLSearchParams({ kind });
    if (search) params.set('search', search);
    if (group) params.set('group', group);
    try {
      const res = await fetch(`/api/admin/taxonomy?${params}`);
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Could not load this list');
        return;
      }
      setItems(data.items ?? []);
      setGroups(data.groups ?? []);
    } catch {
      setError('Could not load this list');
    } finally {
      setLoading(false);
    }
  }, [kind, search, group]);

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(load, 250);
    return () => clearTimeout(timer);
  }, [load]);

  async function create() {
    const label = newLabel.trim();
    if (!label) return;
    setAdding(true);
    setError('');
    try {
      const res = await apiFetch('/api/admin/taxonomy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kind,
          label,
          group: showGroup ? newGroup.trim() || undefined : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Could not add this entry');
        return;
      }
      setNewLabel('');
      void load();
    } finally {
      setAdding(false);
    }
  }

  async function saveEdit(entry: Entry) {
    const label = editLabel.trim();
    if (!label || label === entry.label) {
      setEditingId(null);
      return;
    }
    setBusy(entry.id);
    try {
      const res = await apiFetch('/api/admin/taxonomy', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: entry.id, label }),
      });
      if (res.ok) {
        setItems((list) => list.map((i) => (i.id === entry.id ? { ...i, label } : i)));
      }
    } finally {
      setBusy(null);
      setEditingId(null);
    }
  }

  async function toggleActive(entry: Entry) {
    setBusy(entry.id);
    try {
      const res = await apiFetch('/api/admin/taxonomy', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: entry.id, isActive: !entry.isActive }),
      });
      if (res.ok) {
        setItems((list) =>
          list.map((i) => (i.id === entry.id ? { ...i, isActive: !entry.isActive } : i))
        );
      }
    } finally {
      setBusy(null);
    }
  }

  async function remove(entry: Entry) {
    if (
      !window.confirm(
        `Delete "${entry.label}"? Records that already use it keep the value — it just stops appearing in dropdowns.`
      )
    ) {
      return;
    }
    setBusy(entry.id);
    try {
      const res = await apiFetch(`/api/admin/taxonomy?id=${entry.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok) {
        setItems((list) => list.filter((i) => i.id !== entry.id));
        if (data.inUse > 0) {
          setError(
            `"${entry.label}" was removed from the list, but ${data.inUse} existing record${data.inUse === 1 ? '' : 's'} still reference it.`
          );
        }
      }
    } finally {
      setBusy(null);
    }
  }

  const columns: Array<Column<Entry>> = [
    {
      key: 'label',
      header: 'Name',
      render: (r) =>
        editingId === r.id ? (
          <div className="flex items-center gap-1.5">
            <input
              autoFocus
              value={editLabel}
              onChange={(e) => setEditLabel(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') void saveEdit(r);
                if (e.key === 'Escape') setEditingId(null);
              }}
              className="h-[34px] flex-1 min-w-0 bg-white border border-brand-600 rounded-[9px] px-2.5 text-[13px] text-ink outline-none"
            />
            <button
              onClick={() => saveEdit(r)}
              aria-label="Save"
              className="p-1.5 rounded-[8px] text-[#0A7A54] hover:bg-positive-soft transition-colors"
            >
              <Check className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setEditingId(null)}
              aria-label="Cancel"
              className="p-1.5 rounded-[8px] text-ink-faint hover:bg-canvas transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <div className="min-w-0">
            <p className="font-semibold text-ink truncate">{r.label}</p>
            {showBlurb && r.blurb && (
              <p className="text-[12px] text-ink-muted truncate">{r.blurb}</p>
            )}
          </div>
        ),
    },
    ...(showGroup
      ? [
          {
            key: 'group',
            header: groupLabel,
            hideOnMobile: true,
            render: (r: Entry) => r.group || '—',
          },
        ]
      : []),
    {
      key: 'value',
      header: 'Stored value',
      hideOnMobile: true,
      render: (r) => <code className="text-[12px] text-ink-muted">{r.value}</code>,
    },
    {
      key: 'isActive',
      header: 'Status',
      render: (r) =>
        r.isActive ? (
          <StatusPill label="Active" tone="positive" />
        ) : (
          <StatusPill label="Hidden" tone="neutral" />
        ),
    },
    {
      key: 'actions',
      header: '',
      className: 'text-right',
      render: (r) => (
        <div className="inline-flex items-center gap-1.5">
          <button
            onClick={() => {
              setEditingId(r.id);
              setEditLabel(r.label);
            }}
            disabled={busy === r.id}
            aria-label={`Rename ${r.label}`}
            className="p-2 rounded-[9px] border border-line bg-white text-ink-muted hover:text-brand-700 hover:border-brand-200 transition-colors disabled:opacity-50"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => toggleActive(r)}
            disabled={busy === r.id}
            aria-label={r.isActive ? `Hide ${r.label}` : `Show ${r.label}`}
            className="p-2 rounded-[9px] border border-line bg-white text-ink-muted hover:text-[#9A5D00] hover:border-[#F3DBB4] transition-colors disabled:opacity-50"
          >
            {r.isActive ? <X className="w-3.5 h-3.5" /> : <Check className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={() => remove(r)}
            disabled={busy === r.id}
            aria-label={`Delete ${r.label}`}
            className="p-2 rounded-[9px] border border-line bg-white text-ink-muted hover:text-[#B32B2B] hover:border-[#F3C9C9] transition-colors disabled:opacity-50"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <PageHeader title={title} subtitle={`${items.length} ${subtitle}`} />

      <Panel title={`Add ${itemNoun}`}>
        <div className="flex flex-col sm:flex-row gap-3 p-4">
          <input
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') void create();
            }}
            placeholder={`New ${itemNoun} name`}
            className={`${ADMIN_INPUT} flex-1`}
          />
          {showGroup && (
            <input
              value={newGroup}
              onChange={(e) => setNewGroup(e.target.value)}
              placeholder={`${groupLabel} (optional)`}
              className={`${ADMIN_INPUT} sm:w-[200px]`}
              list={`${kind}-groups`}
            />
          )}
          {showGroup && (
            <datalist id={`${kind}-groups`}>
              {groups.map((g) => (
                <option key={g} value={g} />
              ))}
            </datalist>
          )}
          <ActionButton tone="primary" onClick={create} disabled={adding || !newLabel.trim()}>
            {adding ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
            Add
          </ActionButton>
        </div>
      </Panel>

      <FilterBar>
        <SearchInput value={search} onChange={setSearch} placeholder={`Search ${title.toLowerCase()}…`} />
        {showGroup && groups.length > 0 && (
          <Select
            value={group}
            onChange={setGroup}
            placeholder={`All ${groupLabel.toLowerCase()}s`}
            aria-label={`Filter by ${groupLabel.toLowerCase()}`}
            options={groups.map((g) => ({ value: g, label: g }))}
          />
        )}
      </FilterBar>

      {error && (
        <p className="bg-caution-soft border border-[#F3DBB4] text-[#9A5D00] rounded-[12px] px-4 py-3 text-[13.5px]">
          {error}
        </p>
      )}

      <DataTable
        columns={columns}
        rows={items}
        rowKey={(r) => r.id}
        loading={loading}
        empty={
          <EmptyState
            icon={Icon}
            title={`No ${title.toLowerCase()} yet`}
            body={`Add your first ${itemNoun} above.`}
          />
        }
      />
    </div>
  );
}
