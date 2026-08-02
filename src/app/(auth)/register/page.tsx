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
  ShieldCheck,
  Zap,
  TrendingUp,
} from 'lucide-react';
import AuthShell from '@/components/auth/AuthShell';
import RoleTabs, { type Role } from '@/components/auth/RoleTabs';
import Field from '@/components/auth/Field';
import SubmitButton from '@/components/auth/SubmitButton';

/** Mirrors the server rule: 8+ chars with at least one letter and one number. */
function strengthOf(pw: string) {
  if (!pw) return null;
  const checks = [pw.length >= 8, /[a-z]/.test(pw) && /[A-Z]/.test(pw), /\d/.test(pw), /[^A-Za-z0-9]/.test(pw)];
  const score = checks.filter(Boolean).length;
  if (score <= 1) return { score, label: 'Weak', tone: 'bg-[#EF4444]', text: 'text-[#EF4444]' };
  if (score === 2) return { score, label: 'Fair', tone: 'bg-[#F59E0B]', text: 'text-[#B45309]' };
  if (score === 3) return { score, label: 'Good', tone: 'bg-[#2563EB]', text: 'text-[#2563EB]' };
  return { score, label: 'Strong', tone: 'bg-[#16A34A]', text: 'text-[#16A34A]' };
}

const TRUST = [
  { Icon: Users, title: '100% Free', detail: 'No hidden charges for job seekers' },
  { Icon: ShieldCheck, title: 'Secure & Private', detail: 'Your data is safe with us' },
  { Icon: Zap, title: 'Quick & Easy', detail: 'Get started in just a few minutes' },
];

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
      <h1 className="text-center text-[32px] sm:text-[34px] font-bold text-[#0F172A] tracking-[-0.035em] leading-[1.15]">
        Create Your Account
      </h1>
      <p className="mt-2.5 text-center text-[#475569] text-[15px]">
        Join MotoJobs.in and start your journey today
      </p>

      <div className="mt-8">
        <RoleTabs value={role} onChange={switchRole} />
      </div>

      <form onSubmit={handleSubmit} className="mt-7 space-y-5">
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

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
          placeholder={isEmployer ? 'hr@yourcompany.com' : 'Enter your email address'}
          autoComplete="email"
          error={fieldErrors.email}
        />

        <Field
          id="phone"
          label="Mobile number"
          type="tel"
          icon={Phone}
          value={form.phone}
          onChange={set('phone')}
          placeholder="Enter your mobile number"
          autoComplete="tel"
          required={false}
          error={fieldErrors.phone}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Field
              id="password"
              label="Password"
              type="password"
              icon={Lock}
              value={form.password}
              onChange={set('password')}
              placeholder="Create a password"
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
                      className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
                        i < strength.score ? strength.tone : 'bg-[#E2E8F0]'
                      }`}
                    />
                  ))}
                </div>
                <span className={`text-[11.5px] font-bold ${strength.text}`}>{strength.label}</span>
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
            placeholder="Confirm your password"
            autoComplete="new-password"
            error={mismatch ? 'Passwords do not match' : fieldErrors.confirmPassword}
          />
        </div>

        <label className="flex items-start gap-3 cursor-pointer group">
          <span className="relative mt-px shrink-0">
            <input
              type="checkbox"
              checked={accepted}
              onChange={(e) => setAccepted(e.target.checked)}
              className="peer sr-only"
            />
            <span className="block w-[18px] h-[18px] rounded-[5px] border border-[#CBD5E1] bg-white transition-colors duration-200 peer-checked:bg-[#2563EB] peer-checked:border-[#2563EB] peer-focus-visible:shadow-[0_0_0_3px_rgba(37,99,235,0.15)] group-hover:border-[#93C5FD]" />
            <Check
              className="absolute left-[3px] top-[3px] w-3 h-3 text-white opacity-0 transition-opacity duration-200 peer-checked:opacity-100 pointer-events-none"
              strokeWidth={3.5}
            />
          </span>
          <span className="text-[13px] text-[#475569] leading-[1.6]">
            I agree to the{' '}
            <Link href="/terms" className="font-semibold text-[#2563EB] hover:text-[#1D4ED8]">
              Terms &amp; Conditions
            </Link>{' '}
            and{' '}
            <Link href="/privacy" className="font-semibold text-[#2563EB] hover:text-[#1D4ED8]">
              Privacy Policy
            </Link>
            .
          </span>
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
          <SubmitButton
            loading={loading}
            loadingLabel="Creating account…"
            tone={isEmployer ? 'ignite' : 'brand'}
          >
            {isEmployer ? 'Create Employer Account' : 'Create Account'}
          </SubmitButton>
        </div>

        <p className="text-center text-[12px] text-[#94A3B8]">
          We&apos;ll email you a 6-digit code to verify your address.
        </p>
      </form>

      <div className="mt-8 pt-7 border-t border-[#F1F5F9] grid grid-cols-1 sm:grid-cols-3 gap-5">
        {TRUST.map(({ Icon, title, detail }) => (
          <div key={title} className="flex items-start gap-3">
            <span className="w-9 h-9 shrink-0 rounded-full bg-[#EFF6FF] flex items-center justify-center">
              <Icon className="w-[16px] h-[16px] text-[#2563EB]" strokeWidth={1.9} />
            </span>
            <span>
              <span className="block text-[13px] font-semibold text-[#0F172A]">{title}</span>
              <span className="block text-[12px] text-[#64748B] leading-[1.5] mt-0.5">{detail}</span>
            </span>
          </div>
        ))}
      </div>
    </>
  );
}

export default function RegisterPage() {
  return (
    <AuthShell
      headline={
        <>
          Your Next Opportunity
          <br />
          <span className="text-[#3B82F6]">Starts Here.</span>
        </>
      }
      subtitle="Join thousands of professionals and top automotive companies building the future together."
      features={[
        {
          Icon: Briefcase,
          title: '10K+ Job Opportunities',
          detail: 'Updated daily from top companies',
        },
        {
          Icon: Building2,
          title: 'Trusted by Top Employers',
          detail: 'Leading automotive brands hire here',
        },
        {
          Icon: TrendingUp,
          title: 'Grow Your Career',
          detail: 'Find the right job and grow faster',
        },
      ]}
      testimonial={{
        quote: 'MotoJobs.in helped me find the perfect job that matched my skills and passion.',
        name: 'Rahul Verma',
        role: 'Service Advisor',
      }}
      altPrompt="Already have an account?"
      altLabel="Login"
      altHref="/login"
    >
      <Suspense
        fallback={
          <div className="flex justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-[#2563EB]" />
          </div>
        }
      >
        <RegisterForm />
      </Suspense>
    </AuthShell>
  );
}
