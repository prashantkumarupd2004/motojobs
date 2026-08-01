'use client';

import { CSRF_COOKIE, CSRF_HEADER } from '@/lib/csrf-shared';

function readCsrfToken(): string | null {
  const match = document.cookie.match(
    new RegExp(`(?:^|; )${CSRF_COOKIE}=([^;]*)`)
  );
  return match ? decodeURIComponent(match[1]) : null;
}

const SAFE = new Set(['GET', 'HEAD', 'OPTIONS']);

/**
 * Same-origin fetch that echoes the double-submit CSRF cookie into the
 * `x-csrf-token` header. Use for every state-changing call to `/api/*`.
 */
export async function apiFetch(input: string, init: RequestInit = {}) {
  const method = (init.method ?? 'GET').toUpperCase();
  if (SAFE.has(method)) return fetch(input, init);

  const token = readCsrfToken();
  const headers = new Headers(init.headers);
  if (token) headers.set(CSRF_HEADER, token);

  return fetch(input, { ...init, headers });
}
