'use client';
import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Mail, Lock, Loader2, AlertCircle } from 'lucide-react';
import AuthShell from '@/components/auth/AuthShell';
import RoleTabs, { type Role } from '@/components/auth/RoleTabs';
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

  // The account type is inferred server-side from the credentials; this tab
  // only tailors the copy and where "Create Account" points.
  const [role, setRole] = useState<Role>(
    searchParams.get('role') === 'recruiter' ? 'RECRUITER' : 'CANDIDATE'
  );
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
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
        body: JSON.stringify({ email, password, remember }),
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
      {/* ── Heading ── */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-1.5 bg-[#EFF6FF] border border-[#DBEAFE] rounded-full px-3 py-1 mb-4">
          <span className="w-1.5 h-1.5 rounded-full bg-[#2563EB]" />
          <span className="text-[11.5px] font-semibold text-[#2563EB] tracking-wide uppercase">
            {role === 'RECRUITER' ? 'Employer Portal' : 'Job Seeker Portal'}
          </span>
        </div>
        <h1 className="text-[28px] sm:text-[32px] font-bold tracking-tight leading-[1.2]"
          style={{ color: '#0F172A' }}>
          Welcome back 👋
        </h1>
        <p className="mt-2 text-[14px] text-[#64748B] leading-relaxed">
          {role === 'RECRUITER'
            ? 'Sign in to your employer account'
            : 'Sign in to continue your job search'}
        </p>
      </div>

      <div className="mb-6">
        <RoleTabs value={role} onChange={setRole} />
      </div>

      <form onSubmit={handleSubmit} className="mt-7 space-y-5">
        <Field
          id="email"
          label="Email address"
          type="email"
          icon={Mail}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email address"
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
          action={
            <Link
              href="/forgot-password"
              className="text-[13px] font-medium text-[#2563EB] hover:text-[#1D4ED8] transition-colors"
            >
              Forgot Password?
            </Link>
          }
        />

        <label className="flex items-center gap-2.5 cursor-pointer w-fit">
          <input
            type="checkbox"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
            className="w-4 h-4 rounded border-[#E2E8F0] accent-[#2563EB] cursor-pointer"
          />
          <span className="text-[13px] text-[#334155]">Remember me for 30 days</span>
        </label>

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

      <p className="mt-6 text-center text-[12px] text-[#94A3B8] leading-relaxed">
        By signing in you agree to our{' '}
        <Link href="/terms" className="text-[#2563EB] font-semibold hover:underline">Terms</Link>{' '}&amp;{' '}
        <Link href="/privacy" className="text-[#2563EB] font-semibold hover:underline">Privacy Policy</Link>.
      </p>
    </>
  );
}

export default function LoginPage() {
  return (
    <AuthShell
      headline={
        <>
          Find the Right Job.
          <br />
          Drive Your <span className="text-[#3B82F6]">Future.</span>
        </>
      }
      subtitle="Connecting talented professionals with top automotive companies across India."
      altPrompt="New to MotoJobs.in?"
      altLabel="Create Account"
      altHref="/register"
    >
      <Suspense
        fallback={
          <div className="flex justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-[#2563EB]" />
          </div>
        }
      >
        <LoginForm />
      </Suspense>
    </AuthShell>
  );
}
