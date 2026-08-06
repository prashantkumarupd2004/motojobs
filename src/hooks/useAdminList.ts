'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Fetches a paginated admin list and re-fetches when the filters change.
 *
 * Filters are debounced so typing in a search box does not fire a request per
 * keystroke, and every response carries the request id it belongs to — without
 * that, a slow early request can land after a fast later one and overwrite the
 * newer results.
 */
export function useAdminList<T>(
  path: string,
  filters: Record<string, string | number | undefined>,
  { key = 'items', debounceMs = 300 }: { key?: string; debounceMs?: number } = {}
) {
  const [items, setItems] = useState<T[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const requestId = useRef(0);
  const serialised = JSON.stringify(filters);

  const load = useCallback(async () => {
    const id = ++requestId.current;
    setError('');

    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(JSON.parse(serialised) as Record<string, unknown>)) {
      if (v !== undefined && v !== null && v !== '') params.set(k, String(v));
    }

    try {
      const res = await fetch(`${path}?${params}`);
      const data = await res.json();
      // A stale response must not clobber fresher state.
      if (id !== requestId.current) return;

      if (!res.ok) {
        setError(data.error ?? 'Could not load this list');
        setItems([]);
        return;
      }
      setItems(data[key] ?? []);
      setTotal(data.total ?? 0);
      setTotalPages(data.totalPages ?? 1);
    } catch {
      if (id === requestId.current) setError('Could not load this list');
    } finally {
      if (id === requestId.current) setLoading(false);
    }
  }, [path, serialised, key]);

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(load, debounceMs);
    return () => clearTimeout(timer);
  }, [load, debounceMs]);

  return { items, total, totalPages, loading, error, reload: load, setItems };
}
