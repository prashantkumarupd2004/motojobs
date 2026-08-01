'use client';
import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Mail, Lock, Eye, EyeOff, Loader2, ArrowRight } from 'lucide-react';
import AuthShell from '@/components/auth/AuthShell';

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
  const [showPassword, setShowPassword] = useState(false);
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
      <h1 className="text-[32px] font-extrabold text-ink mb-3 tracking-[-0.038em] leading-[1.15]">
        Log in
      </h1>
      <p className="text-ink-muted text-[15px] leading-[1.65] mb-8">
        Welcome back. Sign in to continue your automobile career journey.
      </p>

      <form onSubmit={handleSubmit}>
        <div className="mb-5">
          <label
            htmlFor="email"
            className="block text-[13px] font-semibold text-ink-soft mb-2 tracking-[-0.01em]"
          >
            Email address
          </label>
          <div className="relative flex items-center group">
            <Mail className="absolute left-4 w-[18px] h-[18px] text-ink-faint pointer-events-none transition-colors duration-300 group-focus-within:text-brand-600" />
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full bg-white text-ink placeholder-ink-faint text-sm rounded-[14px] pl-11 pr-4 py-3 border border-line outline-none shadow-[inset_0_1px_2px_rgba(16,24,40,0.04)] transition-all duration-300 hover:border-[#D9DEE9] focus:border-brand-600 focus:shadow-[0_0_0_4px_rgba(15,76,129,0.10)]"
            />
          </div>
        </div>

        <div className="mb-3">
          <div className="flex items-center justify-between mb-2">
            <label
              htmlFor="password"
              className="text-[13px] font-semibold text-ink-soft tracking-[-0.01em]"
            >
              Password
            </label>
            <Link
              href="/forgot-password"
              className="text-[12.5px] font-semibold text-brand-600 hover:text-brand-700 transition-colors"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative flex items-center group">
            <Lock className="absolute left-4 w-[18px] h-[18px] text-ink-faint pointer-events-none transition-colors duration-300 group-focus-within:text-brand-600" />
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-white text-ink placeholder-ink-faint text-sm rounded-[14px] pl-11 pr-11 py-3 border border-line outline-none shadow-[inset_0_1px_2px_rgba(16,24,40,0.04)] transition-all duration-300 hover:border-[#D9DEE9] focus:border-brand-600 focus:shadow-[0_0_0_4px_rgba(15,76,129,0.10)]"
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              className="absolute right-4 text-ink-faint hover:text-brand-600 transition-colors"
            >
              {showPassword ? (
                <EyeOff className="w-[18px] h-[18px]" />
              ) : (
                <Eye className="w-[18px] h-[18px]" />
              )}
            </button>
          </div>
        </div>

        {error && (
          <p className="mt-4 text-[13.5px] font-medium text-critical animate-fade-in" role="alert">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading || !email || !password}
          className="w-full mt-6 grad-brand text-white font-semibold text-[15px] rounded-[14px] py-3.5 shadow-brand transition-all duration-300 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:shadow-e4 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-y-0 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-[18px] h-[18px] animate-spin" />
              Signing in…
            </>
          ) : (
            <>
              Log in
              <ArrowRight className="w-[18px] h-[18px]" />
            </>
          )}
        </button>
      </form>

      <p className="mt-8 text-center text-[13.5px] text-ink-muted">
        New to MotoJobs?{' '}
        <Link href="/register" className="font-semibold text-brand-600 hover:text-brand-700">
          Create an account
        </Link>
      </p>
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
