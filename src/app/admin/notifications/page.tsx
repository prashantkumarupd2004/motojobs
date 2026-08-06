'use client';

import { useCallback, useEffect, useState } from 'react';
import { Bell, Loader2, Plus, Send, Trash2 } from 'lucide-react';
import { apiFetch } from '@/lib/http';
import DataTable, { type Column } from '@/components/admin/DataTable';
import Drawer from '@/components/admin/Drawer';
import {
  ADMIN_INPUT,
  ADMIN_TEXTAREA,
  ActionButton,
  EmptyState,
  Labelled,
  PageHeader,
  StatusPill,
} from '@/components/admin/ui';

interface Announcement {
  id: string;
  title: string;
  body: string;
  audience: string;
  channel: string;
  link: string | null;
  status: string;
  sentCount: number;
  sentAt: string | null;
  createdAt: string;
}

interface NotificationRow {
  id: string;
  type: string;
  title: string;
  body: string | null;
  readAt: string | null;
  createdAt: string;
  user: { name: string; email: string; role: string };
}

const AUDIENCE_LABEL: Record<string, string> = {
  ALL: 'Everyone',
  CANDIDATES: 'Job seekers',
  EMPLOYERS: 'Employers',
};

const fmtDateTime = (iso: string) =>
  new Date(iso).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });

export default function AdminNotificationsPage() {
  const [tab, setTab] = useState<'announcements' | 'notifications'>('announcements');
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [notifications, setNotifications] = useState<NotificationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState<string | null>(null);

  const [composing, setComposing] = useState(false);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [audience, setAudience] = useState('ALL');
  const [link, setLink] = useState('');
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/admin/notifications?view=${tab}&limit=50`);
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Could not load');
        return;
      }
      if (tab === 'announcements') setAnnouncements(data.announcements ?? []);
      else setNotifications(data.notifications ?? []);
    } catch {
      setError('Could not load');
    } finally {
      setLoading(false);
    }
  }, [tab]);

  useEffect(() => {
    void load();
  }, [load]);

  async function create() {
    setSaving(true);
    setFormError('');
    try {
      const res = await apiFetch('/api/admin/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          body: body.trim(),
          audience,
          link: link.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Could not save');
      setComposing(false);
      setTitle('');
      setBody('');
      setLink('');
      void load();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Could not save');
    } finally {
      setSaving(false);
    }
  }

  async function send(row: Announcement) {
    if (
      !window.confirm(
        `Send "${row.title}" to ${AUDIENCE_LABEL[row.audience].toLowerCase()}? This cannot be undone.`
      )
    ) {
      return;
    }
    setBusy(row.id);
    try {
      const res = await apiFetch('/api/admin/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: row.id }),
      });
      if (res.ok) void load();
    } finally {
      setBusy(null);
    }
  }

  async function remove(row: Announcement) {
    if (!window.confirm(`Delete "${row.title}"?`)) return;
    setBusy(row.id);
    try {
      const res = await apiFetch(`/api/admin/notifications?id=${row.id}`, { method: 'DELETE' });
      if (res.ok) void load();
    } finally {
      setBusy(null);
    }
  }

  const announcementColumns: Array<Column<Announcement>> = [
    {
      key: 'title',
      header: 'Announcement',
      render: (r) => (
        <div className="min-w-0">
          <p className="font-semibold text-ink truncate">{r.title}</p>
          <p className="text-[12px] text-ink-muted truncate">{r.body}</p>
        </div>
      ),
    },
    {
      key: 'audience',
      header: 'Audience',
      hideOnMobile: true,
      render: (r) => AUDIENCE_LABEL[r.audience] ?? r.audience,
    },
    {
      key: 'status',
      header: 'Status',
      render: (r) =>
        r.status === 'SENT' ? (
          <StatusPill label={`Sent · ${r.sentCount}`} tone="positive" />
        ) : (
          <StatusPill label="Draft" tone="neutral" />
        ),
    },
    {
      key: 'sentAt',
      header: 'Sent',
      hideOnMobile: true,
      render: (r) => (r.sentAt ? fmtDateTime(r.sentAt) : '—'),
    },
    {
      key: 'actions',
      header: '',
      className: 'text-right',
      render: (r) => (
        <div className="inline-flex items-center gap-1.5">
          {r.status !== 'SENT' && (
            <button
              onClick={() => send(r)}
              disabled={busy === r.id}
              aria-label={`Send ${r.title}`}
              className="p-2 rounded-[9px] border border-line bg-white text-ink-muted hover:text-brand-700 hover:border-brand-200 transition-colors disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            onClick={() => remove(r)}
            disabled={busy === r.id}
            aria-label={`Delete ${r.title}`}
            className="p-2 rounded-[9px] border border-line bg-white text-ink-muted hover:text-[#B32B2B] hover:border-[#F3C9C9] transition-colors disabled:opacity-50"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ];

  const notificationColumns: Array<Column<NotificationRow>> = [
    {
      key: 'title',
      header: 'Notification',
      render: (r) => (
        <div className="min-w-0">
          <p className="font-semibold text-ink truncate">{r.title}</p>
          {r.body && <p className="text-[12px] text-ink-muted truncate">{r.body}</p>}
        </div>
      ),
    },
    {
      key: 'user',
      header: 'Recipient',
      render: (r) => (
        <div className="min-w-0">
          <p className="text-ink truncate">{r.user.name}</p>
          <p className="text-[12px] text-ink-muted truncate">{r.user.email}</p>
        </div>
      ),
    },
    { key: 'type', header: 'Type', hideOnMobile: true, render: (r) => r.type },
    {
      key: 'readAt',
      header: 'Read',
      render: (r) =>
        r.readAt ? (
          <StatusPill label="Read" tone="positive" />
        ) : (
          <StatusPill label="Unread" tone="caution" />
        ),
    },
    {
      key: 'createdAt',
      header: 'Sent',
      hideOnMobile: true,
      render: (r) => fmtDateTime(r.createdAt),
    },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        title="Notifications"
        subtitle="Broadcast announcements and review what the platform has sent"
        action={
          tab === 'announcements' && (
            <ActionButton tone="primary" onClick={() => setComposing(true)}>
              <Plus className="w-3.5 h-3.5" /> New announcement
            </ActionButton>
          )
        }
      />

      <div className="flex gap-2">
        {(
          [
            ['announcements', 'Announcements'],
            ['notifications', 'Sent notifications'],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`press px-4 py-2.5 rounded-[12px] text-[12.5px] font-semibold border transition-all duration-300 ${
              tab === key
                ? 'grad-brand text-white border-transparent shadow-brand'
                : 'bg-white border-line text-ink-muted hover:border-brand-200 hover:text-brand-700'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {error && (
        <p className="bg-critical-soft border border-critical/20 text-critical rounded-[12px] px-4 py-3 text-[13.5px] font-medium">
          {error}
        </p>
      )}

      {tab === 'announcements' ? (
        <DataTable
          columns={announcementColumns}
          rows={announcements}
          rowKey={(r) => r.id}
          loading={loading}
          empty={
            <EmptyState
              icon={Bell}
              title="No announcements yet"
              body="Write one to broadcast a message to your users."
            />
          }
        />
      ) : (
        <DataTable
          columns={notificationColumns}
          rows={notifications}
          rowKey={(r) => r.id}
          loading={loading}
          empty={
            <EmptyState
              icon={Bell}
              title="No notifications sent"
              body="Application updates and announcements appear here."
            />
          }
        />
      )}

      <Drawer
        open={composing}
        onClose={() => setComposing(false)}
        title="New announcement"
        subtitle="Saved as a draft — you send it separately"
        footer={
          <ActionButton
            tone="primary"
            onClick={create}
            disabled={saving || !title.trim() || !body.trim()}
          >
            {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />} Save draft
          </ActionButton>
        }
      >
        <div className="space-y-4">
          {formError && (
            <p className="bg-critical-soft border border-critical/20 text-critical rounded-[10px] px-3 py-2.5 text-[13px] font-medium">
              {formError}
            </p>
          )}

          <Labelled label="Title">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={200}
              className={ADMIN_INPUT}
            />
          </Labelled>

          <Labelled label="Message">
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={6}
              maxLength={4000}
              className={ADMIN_TEXTAREA}
            />
          </Labelled>

          <Labelled label="Audience">
            <select
              value={audience}
              onChange={(e) => setAudience(e.target.value)}
              className={ADMIN_INPUT}
            >
              {Object.entries(AUDIENCE_LABEL).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </Labelled>

          <Labelled label="Link" hint="Optional — where clicking the notification lands.">
            <input
              value={link}
              onChange={(e) => setLink(e.target.value)}
              placeholder="/jobs"
              className={ADMIN_INPUT}
            />
          </Labelled>
        </div>
      </Drawer>
    </div>
  );
}
