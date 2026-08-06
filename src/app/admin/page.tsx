import { redirect } from 'next/navigation';

/**
 * `/admin` is the address people actually type. It holds no content of its own —
 * the proxy has already established there is a valid admin session by the time
 * this renders, so the only sensible destination is the dashboard.
 */
export default function AdminIndexPage() {
  redirect('/admin/dashboard');
}
