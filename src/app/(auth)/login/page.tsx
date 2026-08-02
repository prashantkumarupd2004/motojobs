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
      <h1 className="text-center text-[32px] sm:text-[34px] font-bold text-[#0F172A] tracking-[-0.035em] leading-[1.15]">
        Welcome Back
      </h1>
      <p className="mt-2.5 text-center text-[#475569] text-[15px]">
        {role === 'RECRUITER'
          ? 'Login to your employer account to continue'
          : 'Login to your account to continue'}
      </p>

      <div className="mt-8">
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
            Login
          </SubmitButton>
        </div>
      </form>

      <div className="mt-8 flex items-center gap-4">
        <span className="flex-1 h-px bg-[#E2E8F0]" />
        <span className="text-[13px] text-[#94A3B8]">or</span>
        <span className="flex-1 h-px bg-[#E2E8F0]" />
      </div>

      <p className="mt-6 text-center text-[12.5px] text-[#64748B] leading-[1.7]">
        By continuing, you agree to our{' '}
        <Link href="/terms" className="font-semibold text-[#2563EB] hover:text-[#1D4ED8]">
          Terms &amp; Conditions
        </Link>{' '}
        and{' '}
        <Link href="/privacy" className="font-semibold text-[#2563EB] hover:text-[#1D4ED8]">
          Privacy Policy
        </Link>
        .
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
