'use client';
import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Mail, Lock, Loader2, AlertCircle, ShieldCheck } from 'lucide-react';
import Field from '@/components/auth/Field';
import SubmitButton from '@/components/auth/SubmitButton';

/**
 * The admin panel's own entrance, deliberately separate from `/login`.
 *
 * There are no role tabs, no register link and no password-reset link: the
 * single privileged account is provisioned by `scripts/create-admin.cjs`, so
 * every one of those affordances would lead nowhere. The page also never
 * confirms whether an address belongs to an admin — a non-admin who signs in
 * here is rejected with the same generic message as a wrong password, so the
 * form cannot be used to enumerate the privileged account.
 */
function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get('from');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Sign in failed');

      // A valid non-admin credential must not land in the panel. The cookie the
      // API just set is left in place — it is a legitimate session for that
      // user, just not one this page will follow.
      if (data.user?.role !== 'ADMIN') {
        throw new Error('These credentials do not have admin access.');
      }

      // Only `/admin` destinations are honoured, so a crafted `?from=` cannot
      // turn this form into an open redirect.
      const target = from?.startsWith('/admin') ? from : '/admin/dashboard';
      router.push(target);
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Sign in failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <Field
        id="email"
        label="Email address"
        type="email"
        icon={Mail}
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="admin@motojobs.in"
        autoComplete="email"
      />

      <Field
        id="password"
        label="Password"
        type="password"
        icon={Lock}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Enter your password"
        autoComplete="current-password"
      />

      {error && (
        <div
          className="flex items-start gap-2.5 rounded-[9px] bg-[#FEF2F2] border border-[#FECACA] px-3.5 py-3 animate-fade-in"
          role="alert"
        >
          <AlertCircle className="w-[17px] h-[17px] text-[#EF4444] shrink-0 mt-px" />
          <p className="text-[13px] font-medium text-[#EF4444] leading-snug">{error}</p>
        </div>
      )}

      <div className="pt-1">
        <SubmitButton loading={loading} disabled={!email || !password} loadingLabel="Signing in…">
          Sign In
        </SubmitButton>
      </div>
    </form>
  );
}

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0B1220] px-4 py-12">
      <div className="w-full max-w-[400px]">
        <div className="bg-white rounded-[16px] shadow-[0_18px_50px_rgba(0,0,0,0.35)] p-7 sm:p-9">
          <div className="text-center mb-8">
            <span className="inline-flex w-12 h-12 rounded-[14px] grad-brand items-center justify-center mb-4">
              <ShieldCheck className="w-[22px] h-[22px] text-white" strokeWidth={2.2} />
            </span>
            <h1
              className="text-[24px] font-bold tracking-tight leading-[1.2]"
              style={{ color: '#0F172A' }}
            >
              MotoJobs Admin
            </h1>
            <p className="mt-1.5 text-[13px] text-[#64748B]">
              Restricted access — authorised personnel only
            </p>
          </div>

          <Suspense
            fallback={
              <div className="flex justify-center py-16">
                <Loader2 className="w-6 h-6 animate-spin text-[#2563EB]" />
              </div>
            }
          >
            <AdminLoginForm />
          </Suspense>
        </div>

        <p className="mt-5 text-center text-[12px] text-[#64748B]">
          Looking for the job seeker or employer sign in?{' '}
          <a href="/login" className="text-[#93C5FD] font-semibold hover:underline">
            Go to motojobs.in/login
          </a>
        </p>
      </div>
    </div>
  );
}
