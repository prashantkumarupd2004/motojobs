'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { KeyRound, Mail, Loader2, ArrowLeft, ArrowRight } from 'lucide-react';
import AuthShell from '@/components/auth/AuthShell';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not send reset code');
      setMessage(data.message);
      setSent(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Could not send reset code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      headline={
        <>
          Forgot Your Password?
          <br />
          <span className="text-[#3B82F6]">We&apos;ve Got You.</span>
        </>
      }
      subtitle="Enter your registered email and we'll send you a 6-digit code to set a new password."
      altPrompt="Remembered it?"
      altLabel="Login"
      altHref="/login"
    >
      <Link
        href="/login"
        className="inline-flex items-center gap-2 text-[13.5px] font-semibold text-ink-muted hover:text-brand-600 transition-colors mb-8"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to login
      </Link>

      <div className="w-16 h-16 rounded-[20px] bg-brand-50 border border-brand-100 flex items-center justify-center mb-7 shadow-e2">
        <KeyRound className="w-8 h-8 text-brand-600" strokeWidth={2.1} />
      </div>

      <h1 className="text-[32px] font-extrabold text-ink mb-3 tracking-[-0.038em] leading-[1.15]">
        Reset password
      </h1>

      {sent ? (
        <>
          <p className="text-ink-muted text-[15px] leading-[1.65] mb-8">{message}</p>
          <button
            onClick={() =>
              router.push(`/reset-password?email=${encodeURIComponent(email)}`)
            }
            className="w-full grad-brand text-white font-semibold text-[15px] rounded-[14px] py-3.5 shadow-brand transition-all duration-300 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:shadow-e4 flex items-center justify-center gap-2"
          >
            Enter the code
            <ArrowRight className="w-4.5 h-4.5" />
          </button>
          <button
            onClick={() => {
              setSent(false);
              setMessage('');
            }}
            className="w-full mt-4 text-[13.5px] font-semibold text-ink-muted hover:text-brand-600 transition-colors"
          >
            Use a different email
          </button>
        </>
      ) : (
        <form onSubmit={handleSubmit}>
          <p className="text-ink-muted text-[15px] leading-[1.65] mb-8">
            Enter the email address linked to your account.
          </p>

          <label
            htmlFor="email"
            className="block text-[13px] font-semibold text-ink-soft mb-2 tracking-[-0.01em]"
          >
            Email address
          </label>
          <div className="relative flex items-center group">
            <Mail className="absolute left-4 w-4.5 h-4.5 text-ink-faint pointer-events-none transition-colors duration-300 group-focus-within:text-brand-600" />
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full bg-white text-ink placeholder-ink-faint text-sm rounded-[14px] pl-11 pr-4 py-3 border border-line outline-none shadow-[inset_0_1px_2px_rgba(16,24,40,0.04)] transition-all duration-300 hover:border-[#D9DEE9] focus:border-brand-600 focus:shadow-[0_0_0_4px_rgba(15,76,129,0.10)]"
            />
          </div>

          {error && (
            <p className="mt-4 text-[13.5px] font-medium text-critical animate-fade-in" role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || !email}
            className="w-full mt-7 grad-brand text-white font-semibold text-[15px] rounded-[14px] py-3.5 shadow-brand transition-all duration-300 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:shadow-e4 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-y-0 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4.5 h-4.5 animate-spin" />
                Sending code…
              </>
            ) : (
              <>
                Send reset code
                <ArrowRight className="w-4.5 h-4.5" />
              </>
            )}
          </button>
        </form>
      )}

      <p className="mt-8 text-center text-[13.5px] text-ink-muted">
        Remembered it?{' '}
        <Link href="/login" className="font-semibold text-brand-600 hover:text-brand-700">
          Log in
        </Link>
      </p>
    </AuthShell>
  );
}
