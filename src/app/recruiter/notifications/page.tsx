'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Bell, Check, Loader2 } from 'lucide-react';
import { apiFetch } from '@/lib/http';

interface Item {
  id: string;
  type: string;
  title: string;
  body: string | null;
  link: string | null;
  readAt: string | null;
  createdAt: string;
}

export default function NotificationsPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const res = await fetch('/api/notifications');
    if (!res.ok) return;
    const data = await res.json();
    setItems(data.notifications ?? []);
    setUnread(data.unread ?? 0);
  }, []);

  useEffect(() => {
    let cancelled = false;
    load()
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [load]);

  async function markAll() {
    setItems((list) =>
      list.map((i) => (i.readAt ? i : { ...i, readAt: new Date().toISOString() }))
    );
    setUnread(0);
    await apiFetch('/api/notifications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
  }

  async function markOne(item: Item) {
    if (item.readAt) return;
    setItems((list) =>
      list.map((i) => (i.id === item.id ? { ...i, readAt: new Date().toISOString() } : i))
    );
    setUnread((n) => Math.max(0, n - 1));
    await apiFetch('/api/notifications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: item.id }),
    });
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-7 h-7 text-brand-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-[26px] sm:text-[28px] font-extrabold text-ink tracking-[-0.035em]">
            Notifications
          </h1>
          <p className="text-ink-muted text-[14.5px] mt-1.5">
            {unread > 0 ? `${unread} unread` : 'You are all caught up'}
          </p>
        </div>
        {unread > 0 && (
          <button
            onClick={markAll}
            className="press inline-flex shrink-0 items-center gap-2 bg-white border border-line text-ink font-semibold px-5 py-2.5 rounded-[12px] text-[13.5px] hover:border-brand-200 hover:text-brand-700 transition-all"
          >
            <Check className="w-4 h-4" /> Mark all read
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="surface sheen text-center py-16 px-6">
          <div className="w-14 h-14 rounded-[18px] bg-canvas border border-line-soft flex items-center justify-center mx-auto mb-4">
            <Bell className="w-6 h-6 text-ink-faint" />
          </div>
          <h3 className="text-[16px] font-bold text-ink tracking-[-0.02em] mb-1.5">
            Nothing yet
          </h3>
          <p className="text-ink-muted text-[14px]">
            New applicants, interview replies and job updates land here.
          </p>
        </div>
      ) : (
        <div className="surface sheen overflow-hidden">
          <ul className="divide-y divide-line-soft">
            {items.map((item) => {
              const inner = (
                <div className="flex items-start gap-3">
                  {!item.readAt && (
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-600 mt-2 shrink-0" />
                  )}
                  <div className={`min-w-0 ${item.readAt ? 'pl-4.5' : ''}`}>
                    <p className="text-[14px] font-semibold text-ink leading-snug">
                      {item.title}
                    </p>
                    {item.body && (
                      <p className="text-[13px] text-ink-muted leading-[1.55] mt-1">
                        {item.body}
                      </p>
                    )}
                    <p className="text-[12px] text-ink-faint mt-1.5">
                      {new Date(item.createdAt).toLocaleString('en-IN', {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })}
                    </p>
                  </div>
                </div>
              );

              const className = `block w-full text-left px-5 sm:px-6 py-4 transition-colors ${
                item.readAt ? 'hover:bg-canvas' : 'bg-brand-50/40 hover:bg-brand-50'
              }`;

              return (
                <li key={item.id}>
                  {item.link ? (
                    <Link href={item.link} onClick={() => markOne(item)} className={className}>
                      {inner}
                    </Link>
                  ) : (
                    <button
                      type="button"
                      onClick={() => markOne(item)}
                      className={className}
                    >
                      {inner}
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
