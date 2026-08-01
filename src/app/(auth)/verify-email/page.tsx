'use client';
import { useState, useEffect, Suspense, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { MailCheck, Loader2, ArrowLeft, CheckCircle2, RotateCcw } from 'lucide-react';
import AuthShell from '@/components/auth/AuthShell';
import OtpInput from '@/components/ui/OtpInput';

const RESEND_COOLDOWN = 45;

function VerifyEmailForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailParam = searchParams.get('email') ?? '';

  const [email, setEmail] = useState(emailParam);
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [verified, setVerified] = useState(false);
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const verify = useCallback(
    async (code: string) => {
      if (code.length !== 6 || loading) return;
      setLoading(true);
      setError('');
      setNotice('');
      try {
        const res = await fetch('/api/auth/verify-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, otp: code }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Verification failed');

        if (data.alreadyVerified) {
          router.push('/login');
          return;
        }

        setVerified(true);
        const role = data.user?.role;
        const dest =
          role === 'RECRUITER'
            ? '/recruiter/dashboard'
            : role === 'ADMIN'
              ? '/admin/dashboard'
              : '/candidate/dashboard';
        setTimeout(() => router.push(dest), 1400);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Verification failed');
        setOtp('');
      } finally {
        setLoading(false);
      }
    },
    [email, loading, router]
  );

  const resend = async () => {
    if (cooldown > 0 || resending) return;
    setResending(true);
    setError('');
    setNotice('');
    try {
      const res = await fetch('/api/auth/resend-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not send code');
      setNotice(data.message ?? 'A new code is on its way.');
      setCooldown(RESEND_COOLDOWN);
      setOtp('');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Could not send code');
    } finally {
      setResending(false);
    }
  };

  if (verified) {
    return (
      <div className="text-center animate-scale-in">
        <div className="w-20 h-20 bg-positive-soft border border-[#BEE7D8] rounded-[24px] flex items-center justify-center mx-auto mb-7 shadow-[0_8px_20px_rgba(14,159,110,0.16)]">
          <CheckCircle2 className="w-10 h-10 text-positive" strokeWidth={2.1} />
        </div>
        <h1 className="text-[30px] font-extrabold text-ink mb-3 tracking-[-0.038em]">
          Email verified
        </h1>
        <p className="text-ink-muted text-[15px]">
          Your account is active. Taking you to your dashboard…
        </p>
      </div>
    );
  }

  return (
    <>
      <Link
        href="/login"
        className="inline-flex items-center gap-2 text-[13.5px] font-semibold text-ink-muted hover:text-brand-600 transition-colors mb-8"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to login
      </Link>

      <div className="w-16 h-16 rounded-[20px] bg-brand-50 border border-brand-100 flex items-center justify-center mb-7 shadow-e2">
        <MailCheck className="w-8 h-8 text-brand-600" strokeWidth={2.1} />
      </div>

      <h1 className="text-[32px] font-extrabold text-ink mb-3 tracking-[-0.038em] leading-[1.15]">
        Verify your email
      </h1>
      <p className="text-ink-muted text-[15px] leading-[1.65] mb-8">
        We sent a 6-digit code to{' '}
        <span className="font-semibold text-ink">{email || 'your email'}</span>. It expires
        in 10 minutes.
      </p>

      {!emailParam && (
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email address"
          className="w-full bg-white text-ink placeholder-ink-faint text-sm rounded-[14px] px-4 py-3 border border-line outline-none mb-6 focus:border-brand-600 focus:shadow-[0_0_0_4px_rgba(15,76,129,0.10)] transition-all duration-300"
        />
      )}

      <OtpInput
        value={otp}
        onChange={setOtp}
        onComplete={verify}
        disabled={loading}
        error={!!error}
      />

      {error && (
        <p className="mt-5 text-[13.5px] font-medium text-critical text-center animate-fade-in" role="alert">
          {error}
        </p>
      )}
      {notice && !error && (
        <p className="mt-5 text-[13.5px] font-medium text-positive text-center animate-fade-in">
          {notice}
        </p>
      )}

      <button
        type="button"
        onClick={() => verify(otp)}
        disabled={loading || otp.length !== 6 || !email}
        className="w-full mt-7 grad-brand text-white font-semibold text-[15px] rounded-[14px] py-3.5 shadow-brand transition-all duration-300 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:shadow-e4 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-y-0 flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <Loader2 className="w-4.5 h-4.5 animate-spin" />
            Verifying…
          </>
        ) : (
          'Verify email'
        )}
      </button>

      <div className="mt-7 text-center">
        <button
          type="button"
          onClick={resend}
          disabled={cooldown > 0 || resending || !email}
          className="inline-flex items-center gap-2 text-[13.5px] font-semibold text-brand-600 hover:text-brand-700 transition-colors disabled:text-ink-faint disabled:cursor-not-allowed"
        >
          {resending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <RotateCcw className="w-4 h-4" />
          )}
          {cooldown > 0 ? `Resend code in ${cooldown}s` : 'Resend code'}
        </button>
      </div>

      <p className="mt-8 text-center text-[13.5px] text-ink-muted">
        Wrong address?{' '}
        <Link href="/register" className="font-semibold text-brand-600 hover:text-brand-700">
          Sign up again
        </Link>
      </p>
    </>
  );
}

export default function VerifyEmailPage() {
  return (
    <AuthShell
      title="One last step"
      subtitle="Confirm your email address to activate your MotoJobs account and start applying."
      bullets={[
        'Codes expire after 10 minutes',
        'Five attempts per code, then request a new one',
        'Never share your code with anyone',
      ]}
    >
      <Suspense
        fallback={
          <div className="flex justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-brand-600" />
          </div>
        }
      >
        <VerifyEmailForm />
      </Suspense>
    </AuthShell>
  );
}
