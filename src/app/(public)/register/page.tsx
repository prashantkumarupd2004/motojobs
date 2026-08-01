'use client';
import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Mail, Lock, User, Phone, Eye, EyeOff, Loader2, Users, Building2, Briefcase, ArrowRight } from 'lucide-react';
import AuthShell from '@/components/auth/AuthShell';

type Role = 'CANDIDATE' | 'RECRUITER';

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
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const isEmployer = role === 'RECRUITER';

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

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

  const field = (
    id: keyof typeof form,
    label: string,
    type: string,
    Icon: typeof Mail,
    placeholder: string,
    autoComplete: string,
    required = true
  ) => (
    <div>
      <label
        htmlFor={id}
        className="block text-[13px] font-semibold text-ink-soft mb-2 tracking-[-0.01em]"
      >
        {label}
      </label>
      <div className="relative flex items-center group">
        <Icon className="absolute left-4 w-[18px] h-[18px] text-ink-faint pointer-events-none transition-colors duration-300 group-focus-within:text-brand-600" />
        <input
          id={id}
          type={type === 'password' && showPassword ? 'text' : type}
          required={required}
          autoComplete={autoComplete}
          value={form[id]}
          onChange={set(id)}
          placeholder={placeholder}
          aria-invalid={fieldErrors[id] ? true : undefined}
          className={`w-full bg-white text-ink placeholder-ink-faint text-sm rounded-[14px] pl-11 ${
            type === 'password' ? 'pr-11' : 'pr-4'
          } py-3 border outline-none shadow-[inset_0_1px_2px_rgba(16,24,40,0.04)] transition-all duration-300 ${
            fieldErrors[id]
              ? 'border-critical focus:shadow-[0_0_0_4px_rgba(220,38,38,0.10)]'
              : 'border-line hover:border-[#D9DEE9] focus:border-brand-600 focus:shadow-[0_0_0_4px_rgba(15,76,129,0.10)]'
          }`}
        />
        {type === 'password' && (
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
        )}
      </div>
      {fieldErrors[id] && (
        <p className="mt-1.5 text-[12.5px] font-medium text-critical">{fieldErrors[id]}</p>
      )}
    </div>
  );

  return (
    <>
      <h1 className="text-[32px] font-extrabold text-ink mb-3 tracking-[-0.038em] leading-[1.15]">
        Create your account
      </h1>
      <p className="text-ink-muted text-[15px] leading-[1.65] mb-7">
        Already have one?{' '}
        <Link href="/login" className="font-semibold text-brand-600 hover:text-brand-700">
          Log in
        </Link>
      </p>

      <div className="flex bg-white border border-line rounded-[16px] p-1.5 mb-6 shadow-e2">
        <button
          type="button"
          onClick={() => {
            setRole('CANDIDATE');
            setFieldErrors({});
            setError('');
          }}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-[12px] text-[13.5px] font-semibold transition-all duration-300 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] ${
            role === 'CANDIDATE'
              ? 'bg-brand-600 text-white shadow-[0_3px_10px_rgba(15,76,129,0.24)]'
              : 'text-ink-muted hover:text-brand-700'
          }`}
        >
          <Users className="w-4 h-4" /> Job Seeker
        </button>
        <button
          type="button"
          onClick={() => {
            setRole('RECRUITER');
            setFieldErrors({});
            setError('');
          }}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-[12px] text-[13.5px] font-semibold transition-all duration-300 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] ${
            role === 'RECRUITER'
              ? 'bg-ignite-500 text-white shadow-[0_3px_10px_rgba(255,107,0,0.26)]'
              : 'text-ink-muted hover:text-ignite-600'
          }`}
        >
          <Building2 className="w-4 h-4" /> Employer
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {isEmployer &&
          field(
            'companyName',
            'Company name',
            'text',
            Building2,
            'Sharma Motors Pvt Ltd',
            'organization'
          )}

        <div className="grid grid-cols-2 gap-4">
          {field(
            'firstName',
            isEmployer ? 'HR first name' : 'First name',
            'text',
            User,
            'Rahul',
            'given-name'
          )}
          {field(
            'lastName',
            isEmployer ? 'HR last name' : 'Last name',
            'text',
            User,
            'Sharma',
            'family-name'
          )}
        </div>

        {isEmployer &&
          field(
            'designation',
            'Your designation',
            'text',
            Briefcase,
            'HR Manager',
            'organization-title',
            false
          )}

        {field(
          'email',
          isEmployer ? 'Business email' : 'Email address',
          'email',
          Mail,
          isEmployer ? 'hr@yourcompany.com' : 'you@example.com',
          'email'
        )}
        {field('phone', 'Phone number', 'tel', Phone, '+91 98765 43210', 'tel', false)}
        {field('password', 'Password', 'password', Lock, '••••••••', 'new-password')}
        {field(
          'confirmPassword',
          'Confirm password',
          'password',
          Lock,
          '••••••••',
          'new-password'
        )}

        <p className="text-[12.5px] text-ink-faint -mt-1">
          At least 8 characters, including a letter and a number.
        </p>

        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={accepted}
            onChange={(e) => setAccepted(e.target.checked)}
            className="mt-0.5 w-4 h-4 rounded border-line text-brand-600 focus:ring-brand-600 focus:ring-offset-0 cursor-pointer accent-brand-600"
          />
          <span className="text-[13px] text-ink-muted leading-[1.6]">
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
          <p className="text-[13.5px] font-medium text-critical animate-fade-in" role="alert">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full grad-brand text-white font-semibold text-[15px] rounded-[14px] py-3.5 shadow-brand transition-all duration-300 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:shadow-e4 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-y-0 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-[18px] h-[18px] animate-spin" />
              Creating account…
            </>
          ) : (
            <>
              Create account
              <ArrowRight className="w-[18px] h-[18px]" />
            </>
          )}
        </button>
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
