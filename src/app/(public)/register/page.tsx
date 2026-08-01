'use client';
import { useState, Suspense, useMemo } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Mail,
  Lock,
  User,
  Phone,
  Loader2,
  Users,
  Building2,
  Briefcase,
  AlertCircle,
  Check,
} from 'lucide-react';
import AuthShell from '@/components/auth/AuthShell';
import Field from '@/components/auth/Field';
import SubmitButton from '@/components/auth/SubmitButton';

type Role = 'CANDIDATE' | 'RECRUITER';

/** Mirrors the server rule: 8+ chars with at least one letter and one number. */
function strengthOf(pw: string) {
  if (!pw) return null;
  const checks = [pw.length >= 8, /[a-z]/.test(pw) && /[A-Z]/.test(pw), /\d/.test(pw), /[^A-Za-z0-9]/.test(pw)];
  const score = checks.filter(Boolean).length;
  if (score <= 1) return { score, label: 'Weak', tone: 'bg-critical', text: 'text-critical' };
  if (score === 2) return { score, label: 'Fair', tone: 'bg-caution', text: 'text-caution' };
  if (score === 3) return { score, label: 'Good', tone: 'bg-brand-500', text: 'text-brand-600' };
  return { score, label: 'Strong', tone: 'bg-positive', text: 'text-positive' };
}

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [role, setRole] = useState<Role>(
    searchParams.get('role') === 'recruiter' ? 'RECRUITER' : 'CANDIDATE'
  );
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    companyName: '',
    designation: '',
  });
  const [accepted, setAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const isEmployer = role === 'RECRUITER';
  const strength = useMemo(() => strengthOf(form.password), [form.password]);
  const mismatch =
    form.confirmPassword.length > 0 && form.password !== form.confirmPassword;

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const switchRole = (next: Role) => {
    setRole(next);
    setFieldErrors({});
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (!accepted) {
      setError('Please accept the Terms & Conditions to continue');
      return;
    }
    setLoading(true);
    setError('');
    setFieldErrors({});
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, role }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.fieldErrors) setFieldErrors(data.fieldErrors);
        throw new Error(data.error || 'Registration failed');
      }
      router.push(`/verify-email?email=${encodeURIComponent(data.email ?? form.email)}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <h1 className="text-[29px] sm:text-[32px] font-extrabold text-ink tracking-[-0.038em] leading-[1.12]">
        Create your account
      </h1>
      <p className="mt-2.5 text-ink-muted text-[14.5px] leading-[1.65]">
        Already have one?{' '}
        <Link
          href="/login"
          className="font-semibold text-brand-600 hover:text-brand-700 transition-colors"
        >
          Log in
        </Link>
      </p>

      {/* Role selector — the sliding pill makes the switch feel physical. */}
      <div
        role="radiogroup"
        aria-label="Account type"
        className="relative mt-7 grid grid-cols-2 gap-1.5 rounded-[16px] border border-line bg-line-soft p-1.5"
      >
        <span
          aria-hidden
          className={`absolute inset-y-1.5 w-[calc(50%-0.375rem)] rounded-[12px] transition-transform duration-500 [transition-timing-function:var(--ease-premium)] ${
            isEmployer
              ? 'translate-x-[calc(100%+0.375rem)] grad-ignite shadow-[0_3px_10px_rgba(255,107,0,0.28)]'
              : 'translate-x-0 grad-brand shadow-[0_3px_10px_rgba(15,76,129,0.26)]'
          }`}
        />
        {(
          [
            { value: 'CANDIDATE', label: 'Job Seeker', Icon: Users },
            { value: 'RECRUITER', label: 'Employer', Icon: Building2 },
          ] as const
        ).map(({ value, label, Icon }) => {
          const active = role === value;
          return (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => switchRole(value)}
              className={`relative z-10 flex items-center justify-center gap-2 py-3 rounded-[12px] text-[13.5px] font-semibold transition-colors duration-300 ${
                active ? 'text-white' : 'text-ink-muted hover:text-ink-soft'
              }`}
            >
              <Icon className="w-4 h-4" strokeWidth={2.2} />
              {label}
            </button>
          );
        })}
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-5">
        {isEmployer && (
          <Field
            id="companyName"
            label="Company name"
            icon={Building2}
            value={form.companyName}
            onChange={set('companyName')}
            placeholder="Sharma Motors Pvt Ltd"
            autoComplete="organization"
            error={fieldErrors.companyName}
          />
        )}

        <div className="grid grid-cols-2 gap-3.5">
          <Field
            id="firstName"
            label={isEmployer ? 'HR first name' : 'First name'}
            icon={User}
            value={form.firstName}
            onChange={set('firstName')}
            placeholder="Rahul"
            autoComplete="given-name"
            error={fieldErrors.firstName}
          />
          <Field
            id="lastName"
            label={isEmployer ? 'HR last name' : 'Last name'}
            icon={User}
            value={form.lastName}
            onChange={set('lastName')}
            placeholder="Sharma"
            autoComplete="family-name"
            error={fieldErrors.lastName}
          />
        </div>

        {isEmployer && (
          <Field
            id="designation"
            label="Your designation"
            icon={Briefcase}
            value={form.designation}
            onChange={set('designation')}
            placeholder="HR Manager"
            autoComplete="organization-title"
            required={false}
            error={fieldErrors.designation}
          />
        )}

        <Field
          id="email"
          label={isEmployer ? 'Business email' : 'Email address'}
          type="email"
          icon={Mail}
          value={form.email}
          onChange={set('email')}
          placeholder={isEmployer ? 'hr@yourcompany.com' : 'you@example.com'}
          autoComplete="email"
          error={fieldErrors.email}
        />

        <Field
          id="phone"
          label="Phone number"
          type="tel"
          icon={Phone}
          value={form.phone}
          onChange={set('phone')}
          placeholder="+91 98765 43210"
          autoComplete="tel"
          required={false}
          error={fieldErrors.phone}
        />

        <div>
          <Field
            id="password"
            label="Password"
            type="password"
            icon={Lock}
            value={form.password}
            onChange={set('password')}
            placeholder="••••••••"
            autoComplete="new-password"
            error={fieldErrors.password}
            hint={strength ? undefined : 'At least 8 characters, including a letter and a number.'}
          />
          {strength && !fieldErrors.password && (
            <div className="mt-2.5 flex items-center gap-3">
              <div className="flex-1 flex gap-1.5">
                {[0, 1, 2, 3].map((i) => (
                  <span
                    key={i}
                    className={`h-1 flex-1 rounded-full transition-colors duration-400 ${
                      i < strength.score ? strength.tone : 'bg-line'
                    }`}
                  />
                ))}
              </div>
              <span className={`text-[11.5px] font-bold ${strength.text}`}>
                {strength.label}
              </span>
            </div>
          )}
        </div>

        <Field
          id="confirmPassword"
          label="Confirm password"
          type="password"
          icon={Lock}
          value={form.confirmPassword}
          onChange={set('confirmPassword')}
          placeholder="••••••••"
          autoComplete="new-password"
          error={mismatch ? 'Passwords do not match' : fieldErrors.confirmPassword}
        />

        <label className="flex items-start gap-3 cursor-pointer group">
          <span className="relative mt-px shrink-0">
            <input
              type="checkbox"
              checked={accepted}
              onChange={(e) => setAccepted(e.target.checked)}
              className="peer sr-only"
            />
            <span className="block w-[18px] h-[18px] rounded-[6px] border border-line bg-white transition-all duration-250 peer-checked:bg-brand-600 peer-checked:border-brand-600 peer-focus-visible:shadow-[0_0_0_4px_rgba(15,76,129,0.12)] group-hover:border-brand-300" />
            <Check
              className="absolute left-[3px] top-[3px] w-3 h-3 text-white opacity-0 transition-opacity duration-200 peer-checked:opacity-100 pointer-events-none"
              strokeWidth={3.5}
            />
          </span>
          <span className="text-[12.5px] text-ink-muted leading-[1.6]">
            I agree to the{' '}
            <Link href="/terms" className="font-semibold text-brand-600 hover:text-brand-700">
              Terms &amp; Conditions
            </Link>{' '}
            and{' '}
            <Link href="/privacy" className="font-semibold text-brand-600 hover:text-brand-700">
              Privacy Policy
            </Link>
            .
          </span>
        </label>

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
            loadingLabel="Creating account…"
            tone={isEmployer ? 'ignite' : 'brand'}
          >
            {isEmployer ? 'Create employer account' : 'Create account'}
          </SubmitButton>
        </div>

        <p className="text-center text-[12px] text-ink-faint">
          We&apos;ll email you a 6-digit code to verify your address.
        </p>
      </form>
    </>
  );
}

export default function RegisterPage() {
  return (
    <AuthShell
      title="Start your journey"
      subtitle="Join India's dedicated hiring platform for the automobile industry."
      bullets={[
        'Dealerships, workshops, OEMs & EV companies',
        'Roles from technician to dealer principal',
        'Free for job seekers, always',
      ]}
    >
      <Suspense
        fallback={
          <div className="flex justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-brand-600" />
          </div>
        }
      >
        <RegisterForm />
      </Suspense>
    </AuthShell>
  );
}
