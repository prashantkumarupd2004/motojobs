'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, BadgeCheck, CheckCircle2, Loader2 } from 'lucide-react';
import { STEP_COMPLETION } from '@/lib/automotive';
import { stepSchemas } from '@/lib/validation/candidate';
import { apiFetch } from '@/lib/http';
import { Stepper } from '@/components/form';
import StepWelcome from '@/components/onboarding/StepWelcome';
import StepPersonal from '@/components/onboarding/StepPersonal';
import StepProfessional from '@/components/onboarding/StepProfessional';
import StepCategories from '@/components/onboarding/StepCategories';
import StepSkills from '@/components/onboarding/StepSkills';
import StepResume from '@/components/onboarding/StepResume';
import StepPreferences from '@/components/onboarding/StepPreferences';
import {
  INITIAL_STATE,
  LAST_STEP,
  STEP_LABELS,
  fullPayload,
  stepPayload,
  type Errors,
  type WizardState,
} from '@/components/onboarding/wizard-state';

const STEP_HEADINGS = [
  { title: 'Get started', blurb: '' },
  { title: 'Personal information', blurb: 'Basic details so employers know who they are hiring.' },
  { title: 'Professional details', blurb: 'Your education or work history in the trade.' },
  { title: 'Job categories', blurb: 'The parts of the industry you want to work in.' },
  { title: 'Skills', blurb: 'What you can do on the floor, in the bay or on the phone.' },
  { title: 'Resume', blurb: 'Upload it once and apply to any job with a single tap.' },
  { title: 'Job preferences', blurb: 'Where you want to work and what you expect to earn.' },
] as const;

export default function CandidateOnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [state, setState] = useState<WizardState>(INITIAL_STATE);
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(true);
  const [done, setDone] = useState(false);

  const patch = useCallback((updates: Partial<WizardState>) => {
    setState((s) => ({ ...s, ...updates }));
  }, []);

  // Restore any saved draft so a dropped session resumes where it left off.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/candidate/onboarding');
        if (!res.ok) return;
        const { data } = await res.json();
        if (cancelled || !data) return;
        setState((s) => hydrate(s, data));
        if (typeof data.profileStep === 'number' && data.profileStep > 0) {
          setStep(Math.min(data.profileStep, LAST_STEP));
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
      await apiFetch('/api/candidate/onboarding', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ step: index, data: stepPayload(index, state) }),
      });
    } catch {
      // Autosave is best-effort; the final submit is what must succeed.
    }
  };

  const validate = (index: number): boolean => {
    const result = stepSchemas[index].safeParse(stepPayload(index, state));
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
    setStep((s) => Math.min(s + 1, LAST_STEP));
  };

  const back = () => {
    setErrors({});
    setStep((s) => Math.max(s - 1, 0));
  };

  const skip = () => {
    void save(0);
    router.push('/candidate/dashboard');
  };

  const submit = async () => {
    if (!validate(LAST_STEP)) return;
    setSubmitting(true);
    setFormError('');
    try {
      const res = await apiFetch('/api/candidate/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fullPayload(state)),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.fieldErrors) setErrors(data.fieldErrors);
        throw new Error(data.error || 'Could not save your profile');
      }
      setDone(true);
      router.push('/candidate/dashboard');
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Could not save your profile');
      setSubmitting(false);
    }
  };

  const progress = STEP_COMPLETION[step];
  const heading = STEP_HEADINGS[step];

  const body = useMemo(() => {
    const props = { state, patch, errors };
    switch (step) {
      case 0:
        return <StepWelcome onStart={next} onSkip={skip} />;
      case 1:
        return <StepPersonal {...props} />;
      case 2:
        return <StepProfessional {...props} />;
      case 3:
        return <StepCategories {...props} />;
      case 4:
        return <StepSkills {...props} />;
      case 5:
        return <StepResume {...props} />;
      default:
        return <StepPreferences {...props} />;
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
          {step > 0 && <Stepper steps={STEP_LABELS.slice(1)} current={step - 1} />}

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

              {step < LAST_STEP ? (
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
                      Finish profile
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

/** Maps a saved candidate row back onto wizard state. */
function hydrate(base: WizardState, d: Record<string, unknown>): WizardState {
  const str = (v: unknown) => (v == null ? '' : String(v));
  const list = (v: unknown) => (Array.isArray(v) ? (v as string[]) : []);
  const file = (url: unknown, name: unknown) =>
    url ? { url: String(url), name: name ? String(name) : 'Uploaded file' } : null;
  const account = (d.account ?? {}) as Record<string, unknown>;

  return {
    ...base,
    fullName: str(account.name),
    email: str(account.email),
    phone: str(account.phone),
    dateOfBirth: d.dateOfBirth ? String(d.dateOfBirth).slice(0, 10) : '',
    gender: str(d.gender),
    currentState: str(d.currentState),
    currentCity: str(d.currentCity),
    panNumber: str(d.panNumber),
    panCard: file(d.panCardUrl, 'PAN card'),
    photo: file(account.profileImage, 'Profile photo'),

    candidateType: str(d.candidateType),
    qualification: str(d.qualification),
    passingYear: str(d.passingYear),
    college: str(d.college),
    internship: str(d.internship),
    certifications: str(d.certifications),
    totalExperience: str(d.totalExperience),
    currentCompany: str(d.currentCompany),
    currentDesignation: str(d.currentDesignation),
    currentSalary: str(d.currentSalary),
    noticePeriodBand: str(d.noticePeriodBand),
    industry: str(d.industry),
    drivingLicense: typeof d.drivingLicense === 'boolean' ? d.drivingLicense : null,
    ownVehicle: typeof d.ownVehicle === 'boolean' ? d.ownVehicle : null,

    jobTitles: list(d.jobTitles),
    brandExperience: list(d.brandExperience),
    skills: list(d.skills),

    resume: file(d.resumeUrl, d.resumeName),

    interestedRole: str(d.interestedRole),
    preferredBrand: str(d.preferredBrand),
    preferredState: str(d.preferredState),
    preferredCity: str(d.preferredCity),
    expectedSalary: str(d.expectedSalary),
    employmentType: str(d.employmentType),
    languages: list(d.languages),
    referralCode: str(d.referralCode),
    acceptTerms: Boolean(d.acceptedTermsAt),
  };
}
