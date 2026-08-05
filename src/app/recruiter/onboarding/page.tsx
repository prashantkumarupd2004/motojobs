'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, BadgeCheck, CheckCircle2, Loader2 } from 'lucide-react';
import { EMPLOYER_STEP_COMPLETION } from '@/lib/automotive';
import { EMPLOYER_LAST_STEP, employerStepSchemas } from '@/lib/validation/employer';
import { apiFetch } from '@/lib/http';
import { Stepper } from '@/components/form';
import StepWelcome from '@/components/employer/StepWelcome';
import StepCompanyInfo from '@/components/employer/StepCompanyInfo';
import StepCompanyAddress from '@/components/employer/StepCompanyAddress';
import StepHiringPreferences from '@/components/employer/StepHiringPreferences';
import {
  EMPLOYER_INITIAL_STATE,
  EMPLOYER_STEP_LABELS,
  employerFullPayload,
  employerStepPayload,
  type EmployerState,
  type Errors,
} from '@/components/employer/wizard-state';

const STEP_HEADINGS = [
  { title: 'Get started', blurb: '' },
  {
    title: 'Company information',
    blurb: 'The basics candidates see on every job you post.',
  },
  { title: 'Company address', blurb: 'Where your showroom, workshop or plant is located.' },
  {
    title: 'Hiring preferences',
    blurb: 'What you hire for, and who candidates should reach.',
  },
] as const;

export default function EmployerOnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [state, setState] = useState<EmployerState>(EMPLOYER_INITIAL_STATE);
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(true);
  const [done, setDone] = useState(false);

  const patch = useCallback((updates: Partial<EmployerState>) => {
    setState((s) => ({ ...s, ...updates }));
  }, []);

  // Restore any saved draft so a dropped session resumes where it left off.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/recruiter/onboarding');
        if (!res.ok) return;
        const { data } = await res.json();
        if (cancelled || !data) return;
        setState((s) => hydrate(s, data));
        if (typeof data.onboardingStep === 'number' && data.onboardingStep > 0) {
          setStep(Math.min(data.onboardingStep, EMPLOYER_LAST_STEP));
        }
      } catch {
        // A failed restore is not fatal — the wizard starts empty.
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const save = async (index: number) => {
    try {
      await apiFetch('/api/recruiter/onboarding', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ step: index, data: employerStepPayload(index, state) }),
      });
    } catch {
      // Autosave is best-effort; the final submit is what must succeed.
    }
  };

  const validate = (index: number): boolean => {
    const result = employerStepSchemas[index].safeParse(employerStepPayload(index, state));
    if (result.success) {
      setErrors({});
      return true;
    }
    const found: Errors = {};
    for (const issue of result.error.issues) {
      const key = String(issue.path[0] ?? 'form');
      if (!found[key]) found[key] = issue.message;
    }
    setErrors(found);
    return false;
  };

  const next = () => {
    if (step > 0 && !validate(step)) return;
    void save(step);
    setErrors({});
    setStep((s) => Math.min(s + 1, EMPLOYER_LAST_STEP));
  };

  const back = () => {
    setErrors({});
    setStep((s) => Math.max(s - 1, 0));
  };

  const skip = () => {
    void save(0);
    router.push('/recruiter/dashboard');
  };

  const submit = async () => {
    if (!validate(EMPLOYER_LAST_STEP)) return;
    setSubmitting(true);
    setFormError('');
    try {
      const res = await apiFetch('/api/recruiter/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(employerFullPayload(state)),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.fieldErrors) setErrors(data.fieldErrors);
        throw new Error(data.error || 'Could not save your company profile');
      }
      setDone(true);
      router.push('/recruiter/dashboard');
    } catch (err: unknown) {
      setFormError(
        err instanceof Error ? err.message : 'Could not save your company profile'
      );
      setSubmitting(false);
    }
  };

  const progress = EMPLOYER_STEP_COMPLETION[step];
  const heading = STEP_HEADINGS[step];

  const body = useMemo(() => {
    const props = { state, patch, errors };
    switch (step) {
      case 0:
        return <StepWelcome onStart={next} onSkip={skip} />;
      case 1:
        return <StepCompanyInfo {...props} />;
      case 2:
        return <StepCompanyAddress {...props} />;
      default:
        return <StepHiringPreferences {...props} />;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, state, errors]);

  if (done) {
    return (
      <div className="min-h-screen bg-canvas flex items-center justify-center px-4">
        <div className="text-center animate-scale-in">
          <div className="w-20 h-20 bg-positive-soft border border-[#BEE7D8] rounded-[24px] flex items-center justify-center mx-auto mb-7 shadow-[0_8px_20px_rgba(14,159,110,0.16)]">
            <CheckCircle2 className="w-10 h-10 text-positive" strokeWidth={2.1} />
          </div>
          <h1 className="text-[30px] font-extrabold text-ink mb-3 tracking-[-0.038em]">
            Profile complete
          </h1>
          <p className="text-ink-muted text-[15px]">Taking you to your dashboard…</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-canvas flex items-center justify-center">
        <Loader2 className="w-7 h-7 text-brand-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-canvas py-8 sm:py-10 px-4">
      <div className="max-w-2xl mx-auto">
        <header className="mb-7">
          <div className="flex items-end justify-between gap-4 mb-2">
            <h1 className="text-[26px] sm:text-[30px] font-extrabold text-ink tracking-[-0.038em] leading-[1.15]">
              {heading.title}
            </h1>
            <span className="text-[13px] font-bold text-brand-600 shrink-0 pb-1.5">
              {progress}%
            </span>
          </div>
          <div className="w-full h-2 bg-line-soft rounded-full overflow-hidden">
            <div
              className="h-full grad-brand rounded-full transition-all duration-700 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)]"
              style={{ width: `${progress}%` }}
              role="progressbar"
              aria-valuenow={progress}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Profile completion"
            />
          </div>
          {heading.blurb && (
            <p className="text-ink-muted text-[14.5px] leading-[1.6] mt-3">{heading.blurb}</p>
          )}
        </header>

        <div className="bg-white border border-line rounded-[24px] p-6 sm:p-8 shadow-e2">
          {step > 0 && (
            <Stepper steps={EMPLOYER_STEP_LABELS.slice(1)} current={step - 1} />
          )}

          {body}

          {formError && (
            <p className="mt-6 text-[13.5px] font-medium text-critical animate-fade-in" role="alert">
              {formError}
            </p>
          )}

          {step > 0 && (
            <div className="flex items-center justify-between gap-3 mt-9 pt-6 border-t border-line">
              <button
                type="button"
                onClick={back}
                disabled={submitting}
                className="inline-flex items-center gap-2 text-[14px] font-semibold text-ink-muted hover:text-brand-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ArrowLeft className="w-4 h-4" />
                Previous
              </button>

              {step < EMPLOYER_LAST_STEP ? (
                <button
                  type="button"
                  onClick={next}
                  className="inline-flex items-center gap-2 grad-brand text-white font-semibold text-[14.5px] rounded-[14px] px-6 py-3 shadow-brand transition-all duration-300 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:shadow-e4"
                >
                  Save &amp; continue
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={submit}
                  disabled={submitting}
                  className="inline-flex items-center gap-2 grad-brand text-white font-semibold text-[14.5px] rounded-[14px] px-6 py-3 shadow-brand transition-all duration-300 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:shadow-e4 disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-y-0"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving…
                    </>
                  ) : (
                    <>
                      <BadgeCheck className="w-4 h-4" />
                      Complete profile
                    </>
                  )}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/** Maps a saved company row back onto wizard state. */
function hydrate(base: EmployerState, d: Record<string, unknown>): EmployerState {
  const str = (v: unknown) => (v == null ? '' : String(v));
  const list = (v: unknown) => (Array.isArray(v) ? (v as string[]) : []);
  const account = (d.account ?? {}) as Record<string, unknown>;

  return {
    ...base,
    logo: str(d.logo),
    name: str(d.name),
    companyType: str(d.companyType),
    description: str(d.description),
    website: str(d.website),
    gstNumber: str(d.gstNumber),
    panNumber: str(d.panNumber),
    email: str(d.email),
    phone: str(d.phone),

    state: str(d.state),
    city: str(d.city),
    addressLine: str(d.addressLine),
    pincode: str(d.pincode),
    mapsUrl: str(d.mapsUrl),

    hiringCategories: list(d.hiringCategories),
    hiringFrequency: str(d.hiringFrequency),
    size: str(d.size),
    // Falls back to the signed-in recruiter, who is the HR contact by default.
    hrName: str(d.hrName) || str(account.name),
    hrPhone: str(d.hrPhone) || str(account.phone),
  };
}
