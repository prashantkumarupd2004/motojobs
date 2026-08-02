'use client';
import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ShieldCheck, Lock, Eye, EyeOff, Loader2, ArrowLeft, CheckCircle2 } from 'lucide-react';
import AuthShell from '@/components/auth/AuthShell';
import OtpInput from '@/components/ui/OtpInput';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailParam = searchParams.get('email') ?? '';

  const [email, setEmail] = useState(emailParam);
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, password, confirmPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not reset password');
      setDone(true);
      setTimeout(() => router.push('/login'), 1800);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Could not reset password');
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div className="text-center animate-scale-in">
        <div className="w-20 h-20 bg-positive-soft border border-[#BEE7D8] rounded-[24px] flex items-center justify-center mx-auto mb-7 shadow-[0_8px_20px_rgba(14,159,110,0.16)]">
          <CheckCircle2 className="w-10 h-10 text-positive" strokeWidth={2.1} />
        </div>
        <h1 className="text-[30px] font-extrabold text-ink mb-3 tracking-[-0.038em]">
          Password updated
        </h1>
        <p className="text-ink-muted text-[15px]">Redirecting you to login…</p>
      </div>
    );
  }

  const pwInput = (
    id: string,
    label: string,
    value: string,
    onChange: (v: string) => void,
    autoComplete: string
  ) => (
    <div className="mb-5">
      <label
        htmlFor={id}
        className="block text-[13px] font-semibold text-ink-soft mb-2 tracking-[-0.01em]"
      >
        {label}
      </label>
      <div className="relative flex items-center group">
        <Lock className="absolute left-4 w-4.5 h-4.5 text-ink-faint pointer-events-none transition-colors duration-300 group-focus-within:text-brand-600" />
        <input
          id={id}
          type={showPassword ? 'text' : 'password'}
          required
          value={value}
          autoComplete={autoComplete}
          onChange={(e) => onChange(e.target.value)}
          placeholder="••••••••"
          className="w-full bg-white text-ink placeholder-ink-faint text-sm rounded-[14px] pl-11 pr-11 py-3 border border-line outline-none shadow-[inset_0_1px_2px_rgba(16,24,40,0.04)] transition-all duration-300 hover:border-[#D9DEE9] focus:border-brand-600 focus:shadow-[0_0_0_4px_rgba(15,76,129,0.10)]"
        />
        <button
          type="button"
          onClick={() => setShowPassword((s) => !s)}
          aria-label={showPassword ? 'Hide password' : 'Show password'}
          className="absolute right-4 text-ink-faint hover:text-brand-600 transition-colors"
        >
          {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
        </button>
      </div>
    </div>
  );

  return (
    <>
      <Link
        href="/forgot-password"
        className="inline-flex items-center gap-2 text-[13.5px] font-semibold text-ink-muted hover:text-brand-600 transition-colors mb-8"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </Link>

      <div className="w-16 h-16 rounded-[20px] bg-brand-50 border border-brand-100 flex items-center justify-center mb-7 shadow-e2">
        <ShieldCheck className="w-8 h-8 text-brand-600" strokeWidth={2.1} />
      </div>

      <h1 className="text-[32px] font-extrabold text-ink mb-3 tracking-[-0.038em] leading-[1.15]">
        Set a new password
      </h1>
      <p className="text-ink-muted text-[15px] leading-[1.65] mb-8">
        Enter the code sent to{' '}
        <span className="font-semibold text-ink">{email || 'your email'}</span> and choose a
        new password.
      </p>

      <form onSubmit={handleSubmit}>
        {!emailParam && (
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email address"
            className="w-full bg-white text-ink placeholder-ink-faint text-sm rounded-[14px] px-4 py-3 border border-line outline-none mb-6 focus:border-brand-600 focus:shadow-[0_0_0_4px_rgba(15,76,129,0.10)] transition-all duration-300"
          />
        )}

        <div className="mb-7">
          <OtpInput value={otp} onChange={setOtp} disabled={loading} error={!!error} />
        </div>

        {pwInput('password', 'New password', password, setPassword, 'new-password')}
        {pwInput(
          'confirmPassword',
          'Confirm new password',
          confirmPassword,
          setConfirmPassword,
          'new-password'
        )}

        <p className="text-[12.5px] text-ink-faint -mt-1 mb-5">
          At least 8 characters, including a letter and a number.
        </p>

        {error && (
          <p className="mb-5 text-[13.5px] font-medium text-critical animate-fade-in" role="alert">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading || otp.length !== 6 || !password || !email}
          className="w-full grad-brand text-white font-semibold text-[15px] rounded-[14px] py-3.5 shadow-brand transition-all duration-300 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:shadow-e4 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-y-0 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-4.5 h-4.5 animate-spin" />
              Updating…
            </>
          ) : (
            'Update password'
          )}
        </button>
      </form>

      <p className="mt-8 text-center text-[13.5px] text-ink-muted">
        Didn&apos;t get a code?{' '}
        <Link
          href="/forgot-password"
          className="font-semibold text-brand-600 hover:text-brand-700"
        >
          Request another
        </Link>
      </p>
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <AuthShell
      headline={
        <>
          Almost There.
          <br />
          <span className="text-[#3B82F6]">Set a New Password.</span>
        </>
      }
      subtitle="Choose a strong password you haven't used elsewhere."
      altPrompt="Remembered it?"
      altLabel="Login"
      altHref="/login"
    >
      <Suspense
        fallback={
          <div className="flex justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-brand-600" />
          </div>
        }
      >
        <ResetPasswordForm />
      </Suspense>
    </AuthShell>
  );
}
