'use client';
import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Mail, Lock, Loader2, AlertCircle } from 'lucide-react';
import AuthShell from '@/components/auth/AuthShell';
import Field from '@/components/auth/Field';
import SubmitButton from '@/components/auth/SubmitButton';

function dashboardFor(role?: string) {
  if (role === 'RECRUITER') return '/recruiter/dashboard';
  if (role === 'ADMIN') return '/admin/dashboard';
  return '/candidate/dashboard';
}

function LoginForm() {
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

      // Correct credentials on an unconfirmed address — continue to verification.
      if (res.status === 403 && data.needsVerification) {
        router.push(`/verify-email?email=${encodeURIComponent(data.email ?? email)}`);
        return;
      }

      if (!res.ok) throw new Error(data.error || 'Login failed');

      router.push(from?.startsWith('/') ? from : dashboardFor(data.user?.role));
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <h1 className="text-[29px] sm:text-[32px] font-extrabold text-ink tracking-[-0.038em] leading-[1.12]">
        Log in
      </h1>
      <p className="mt-2.5 text-ink-muted text-[14.5px] leading-[1.65]">
        Welcome back. Sign in to continue your automobile career journey.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        <Field
          id="email"
          label="Email address"
          type="email"
          icon={Mail}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          autoComplete="email"
        />

        <Field
          id="password"
          label="Password"
          type="password"
          icon={Lock}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          autoComplete="current-password"
          action={
            <Link
              href="/forgot-password"
              className="text-[12px] font-semibold text-brand-600 hover:text-brand-700 transition-colors"
            >
              Forgot password?
            </Link>
          }
        />

        {error && (
          <div
            className="flex items-start gap-2.5 rounded-[13px] bg-critical-soft border border-critical/20 px-3.5 py-3 animate-fade-in"
            role="alert"
          >
            <AlertCircle className="w-[17px] h-[17px] text-critical shrink-0 mt-px" />
            <p className="text-[13px] font-medium text-critical leading-snug">{error}</p>
          </div>
        )}

        <div className="pt-1">
          <SubmitButton
            loading={loading}
            disabled={!email || !password}
            loadingLabel="Signing in…"
          >
            Log in
          </SubmitButton>
        </div>
      </form>

      <div className="mt-8 pt-7 border-t border-line-soft">
        <p className="text-center text-[13.5px] text-ink-muted">
          New to MotoJobs?{' '}
          <Link
            href="/register"
            className="font-semibold text-brand-600 hover:text-brand-700 transition-colors"
          >
            Create an account
          </Link>
        </p>
      </div>
    </>
  );
}

export default function LoginPage() {
  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to access your dashboard, applications and job matches."
      bullets={[
        'Auto-sector jobs only — no noise',
        'Track every application in one place',
        'Verified dealerships, workshops & OEMs',
      ]}
    >
      <Suspense
        fallback={
          <div className="flex justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-brand-600" />
          </div>
        }
      >
        <LoginForm />
      </Suspense>
    </AuthShell>
  );
}
