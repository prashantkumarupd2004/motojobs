'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Bell, Check } from 'lucide-react';
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

function relativeTime(iso: string, now: number) {
  const seconds = Math.round((now - new Date(iso).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}

export default function NotificationBell() {
  const [items, setItems] = useState<Item[]>([]);
  const [unread, setUnread] = useState(0);
  const [open, setOpen] = useState(false);
  // Captured on the client so the server render can't disagree about "now".
  const [now, setNow] = useState(0);
  const panelRef = useRef<HTMLDivElement>(null);

  const load = useCallback(
    () =>
      apiFetch('/api/notifications')
        .then((res) => (res.ok ? res.json() : { notifications: [], unread: 0 }))
        .catch(() => ({ notifications: [], unread: 0 })),
    []
  );

  useEffect(() => {
    let cancelled = false;
    const refresh = () =>
      load().then((data) => {
        if (cancelled) return;
        setItems(data.notifications ?? []);
        setUnread(data.unread ?? 0);
        setNow(Date.now());
      });

    refresh();
    const timer = setInterval(refresh, 60_000);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [load]);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (!panelRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [open]);

  async function markAll() {
    await apiFetch('/api/notifications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    const data = await load();
    setItems(data.notifications ?? []);
    setUnread(data.unread ?? 0);
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

  return (
    <div className="relative" ref={panelRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={unread > 0 ? `Notifications, ${unread} unread` : 'Notifications'}
        className="relative w-10 h-10 rounded-[12px] flex items-center justify-center text-ink-soft hover:text-brand-700 hover:bg-brand-50/70 transition-all duration-300"
      >
        <Bell className="w-[19px] h-[19px]" />
        {unread > 0 && (
          <span className="absolute top-1.5 right-1.5 min-w-[17px] h-[17px] px-1 rounded-full grad-ignite text-white text-[10px] font-bold flex items-center justify-center shadow-[0_2px_6px_rgba(255,107,0,0.35)]">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-3 w-[340px] max-w-[calc(100vw-2rem)] bg-white border border-line rounded-[18px] shadow-[0_16px_32px_rgba(16,24,40,0.07),0_40px_80px_rgba(16,24,40,0.10)] overflow-hidden animate-scale-in origin-top-right z-50">
          <div className="flex items-center justify-between px-4 py-3.5 border-b border-line">
            <h3 className="text-[14px] font-bold text-ink">Notifications</h3>
            {unread > 0 && (
              <button
                type="button"
                onClick={markAll}
                className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-brand-600 hover:text-brand-700 transition-colors"
              >
                <Check className="w-3.5 h-3.5" />
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-[380px] overflow-y-auto scroll-slim">
            {items.length === 0 ? (
              <div className="px-4 py-10 text-center">
                <Bell className="w-7 h-7 text-ink-faint mx-auto" />
                <p className="text-[13.5px] text-ink-muted mt-3">
                  Nothing yet — updates on your jobs and applications land here.
                </p>
              </div>
            ) : (
              items.map((item) => {
                const inner = (
                  <>
                    <div className="flex items-start gap-2.5">
                      {!item.readAt && (
                        <span className="w-1.5 h-1.5 rounded-full bg-ignite-500 mt-2 shrink-0" />
                      )}
                      <div className={`min-w-0 ${item.readAt ? 'pl-4' : ''}`}>
                        <p className="text-[13.5px] font-semibold text-ink leading-snug">
                          {item.title}
                        </p>
                        {item.body && (
                          <p className="text-[12.5px] text-ink-muted leading-[1.55] mt-1">
                            {item.body}
                          </p>
                        )}
                        <p className="text-[11.5px] text-ink-faint mt-1.5">
                          {now ? relativeTime(item.createdAt, now) : ''}
                        </p>
                      </div>
                    </div>
                  </>
                );

                const className = `block w-full text-left px-4 py-3.5 border-b border-line-soft last:border-0 transition-colors duration-200 ${
                  item.readAt ? 'hover:bg-canvas' : 'bg-brand-50/40 hover:bg-brand-50'
                }`;

                return item.link ? (
                  <Link
                    key={item.id}
                    href={item.link}
                    onClick={() => {
                      markOne(item);
                      setOpen(false);
                    }}
                    className={className}
                  >
                    {inner}
                  </Link>
                ) : (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => markOne(item)}
                    className={className}
                  >
                    {inner}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
