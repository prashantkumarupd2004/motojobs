'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Briefcase,
  CheckCircle2,
  FileText,
  Loader2,
  MapPin,
  UserCircle2,
} from 'lucide-react';
import {
  AUTO_HUB_CITIES,
  CANDIDATE_TYPES,
  EXPERIENCE_BANDS,
  INDUSTRIES,
  INTERESTED_ROLES,
  LANGUAGES,
  MAX_IMAGE_BYTES,
  MAX_RESUME_BYTES,
  NOTICE_PERIODS,
  OEM_BRANDS,
  PASSING_YEARS,
  QUALIFICATIONS,
} from '@/lib/automotive';
import { onboardingSchema } from '@/lib/validation/candidate';
import { apiFetch } from '@/lib/http';
import {
  Field,
  FileUpload,
  MultiSelect,
  RadioCards,
  SearchableSelect,
  Stepper,
  TextInput,
  YesNo,
} from '@/components/form';

const STEPS = ['Your background', 'Role & location', 'Experience', 'Finish up'] as const;

type Errors = Record<string, string>;

const GENDERS = ['Male', 'Female', 'Other', 'Prefer not to say'] as const;

/** Youngest permitted DOB: candidates must be at least 14 to hold an apprenticeship. */
const MAX_DOB = `${PASSING_YEARS[0] - 14}-12-31`;

export default function CandidateOnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [done, setDone] = useState(false);

  const [candidateType, setCandidateType] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState('');
  const [interestedRole, setInterestedRole] = useState('');
  const [currentCity, setCurrentCity] = useState('');
  const [preferredLocations, setPreferredLocations] = useState<string[]>([]);
  const [qualification, setQualification] = useState('');

  const [passingYear, setPassingYear] = useState('');
  const [college, setCollege] = useState('');
  const [internship, setInternship] = useState('');
  const [certifications, setCertifications] = useState('');

  const [totalExperience, setTotalExperience] = useState('');
  const [currentCompany, setCurrentCompany] = useState('');
  const [currentDesignation, setCurrentDesignation] = useState('');
  const [currentSalary, setCurrentSalary] = useState('');
  const [expectedSalary, setExpectedSalary] = useState('');
  const [noticePeriodBand, setNoticePeriodBand] = useState('');
  const [brandExperience, setBrandExperience] = useState<string[]>([]);
  const [industry, setIndustry] = useState('');

  const [resume, setResume] = useState<{ url: string; name: string } | null>(null);
  const [photo, setPhoto] = useState<{ url: string; name: string } | null>(null);
  const [drivingLicense, setDrivingLicense] = useState<boolean | null>(null);
  const [ownVehicle, setOwnVehicle] = useState<boolean | null>(null);
  const [languages, setLanguages] = useState<string[]>([]);
  const [referralCode, setReferralCode] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);

  const isFresher = candidateType === 'FRESHER';
  const isAutomobile = candidateType === 'AUTOMOBILE';
  const isNonAutomobile = candidateType === 'NON_AUTOMOBILE';

  const payload = useMemo(
    () => ({
      candidateType,
      dateOfBirth: dateOfBirth || undefined,
      gender: gender || undefined,
      interestedRole,
      currentCity: currentCity.trim(),
      preferredLocations,
      qualification,
      passingYear: passingYear ? Number(passingYear) : undefined,
      college: college.trim() || undefined,
      internship: internship.trim() || undefined,
      certifications: certifications.trim() || undefined,
      totalExperience: totalExperience || undefined,
      currentCompany: currentCompany.trim() || undefined,
      currentDesignation: currentDesignation.trim() || undefined,
      currentSalary: currentSalary ? Number(currentSalary) : undefined,
      expectedSalary: expectedSalary ? Number(expectedSalary) : undefined,
      noticePeriodBand: noticePeriodBand || undefined,
      brandExperience: brandExperience.length ? brandExperience : undefined,
      industry: industry || undefined,
      resumeUrl: resume?.url,
      resumeName: resume?.name,
      profileImage: photo?.url,
      drivingLicense: drivingLicense ?? false,
      ownVehicle: ownVehicle ?? false,
      languages,
      referralCode: referralCode.trim() || undefined,
      acceptTerms,
    }),
    [
      candidateType, dateOfBirth, gender, interestedRole, currentCity, preferredLocations,
      qualification, passingYear, college, internship, certifications, totalExperience,
      currentCompany, currentDesignation, currentSalary, expectedSalary, noticePeriodBand,
      brandExperience, industry, resume, photo, drivingLicense, ownVehicle, languages,
      referralCode, acceptTerms,
    ]
  );

  /** Fields owned by each step, so we only surface errors the user can see. */
  const stepFields: string[][] = [
    ['candidateType', 'qualification'],
    ['interestedRole', 'currentCity', 'preferredLocations'],
    isFresher
      ? ['passingYear', 'college']
      : [
          'totalExperience',
          'currentCompany',
          'currentDesignation',
          'noticePeriodBand',
          ...(isAutomobile ? ['brandExperience'] : []),
          ...(isNonAutomobile ? ['industry'] : []),
        ],
    ['languages', 'acceptTerms'],
  ];

  const validateStep = (index: number): boolean => {
    const result = onboardingSchema.safeParse(payload);
    if (result.success) {
      setErrors({});
      return true;
    }

    const all: Errors = {};
    for (const issue of result.error.issues) {
      const key = String(issue.path[0] ?? 'form');
      if (!all[key]) all[key] = issue.message;
    }

    const owned = stepFields[index];
    const relevant: Errors = {};
    for (const key of owned) {
      if (all[key]) relevant[key] = all[key];
    }

    setErrors(relevant);
    return Object.keys(relevant).length === 0;
  };

  const next = () => {
    if (!validateStep(step)) return;
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const back = () => {
    setErrors({});
    setStep((s) => Math.max(s - 1, 0));
  };

  const submit = async () => {
    if (!validateStep(STEPS.length - 1)) return;
    setSubmitting(true);
    setFormError('');
    try {
      const res = await apiFetch('/api/candidate/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.fieldErrors) setErrors(data.fieldErrors);
        throw new Error(data.error || 'Could not save your profile');
      }
      setDone(true);
      setTimeout(() => router.push('/candidate/dashboard'), 1600);
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Could not save your profile');
    } finally {
      setSubmitting(false);
    }
  };

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

  return (
    <div className="min-h-screen bg-canvas py-10 px-4">
      <div className="max-w-2xl mx-auto">
        <header className="mb-8">
          <h1 className="text-[30px] font-extrabold text-ink tracking-[-0.038em] leading-[1.15] mb-2">
            Complete your profile
          </h1>
          <p className="text-ink-muted text-[15px] leading-[1.6]">
            Employers across dealerships, workshops and OEMs search these details. It takes
            about three minutes.
          </p>
        </header>

        <div className="bg-white border border-line rounded-[24px] p-6 sm:p-8 shadow-e2">
          <Stepper steps={STEPS} current={step} />

          {step === 0 && (
            <section className="space-y-6 animate-fade-in">
              <SectionTitle icon={UserCircle2} title="Tell us where you are today" />

              <Field
                label="Which best describes you?"
                required
                error={errors.candidateType}
              >
                <RadioCards
                  name="candidateType"
                  value={candidateType}
                  onChange={setCandidateType}
                  options={CANDIDATE_TYPES.map((t) => ({
                    value: t.id,
                    label: t.label,
                    blurb: t.blurb,
                  }))}
                />
              </Field>

              <Field
                label="Highest qualification"
                required
                error={errors.qualification}
                htmlFor="qualification"
              >
                <SearchableSelect
                  id="qualification"
                  options={QUALIFICATIONS}
                  value={qualification}
                  onChange={setQualification}
                  placeholder="Select your qualification"
                  error={!!errors.qualification}
                />
              </Field>

              <div className="grid sm:grid-cols-2 gap-5">
                <Field label="Date of birth" htmlFor="dob">
                  <TextInput
                    id="dob"
                    type="date"
                    value={dateOfBirth}
                    max={MAX_DOB}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                  />
                </Field>

                <Field label="Gender" htmlFor="gender">
                  <SearchableSelect
                    id="gender"
                    options={GENDERS}
                    value={gender}
                    onChange={setGender}
                    placeholder="Select"
                  />
                </Field>
              </div>
            </section>
          )}

          {step === 1 && (
            <section className="space-y-6 animate-fade-in">
              <SectionTitle icon={MapPin} title="What are you looking for?" />

              <Field
                label="Interested role"
                required
                error={errors.interestedRole}
                htmlFor="role"
                hint="Search across sales, service, spare parts, body shop, EV and more."
              >
                <SearchableSelect
                  id="role"
                  options={INTERESTED_ROLES}
                  value={interestedRole}
                  onChange={setInterestedRole}
                  placeholder="Search for a role"
                  error={!!errors.interestedRole}
                />
              </Field>

              <Field
                label="Current city"
                required
                error={errors.currentCity}
                htmlFor="city"
                hint="Not listed? Type your city and pick the custom option."
              >
                <SearchableSelect
                  id="city"
                  options={AUTO_HUB_CITIES}
                  value={currentCity}
                  onChange={setCurrentCity}
                  placeholder="Search for your city"
                  allowCustom
                  error={!!errors.currentCity}
                />
              </Field>

              <Field
                label="Preferred job locations"
                required
                error={errors.preferredLocations}
                hint="Choose up to 5. More locations means more matches."
              >
                <MultiSelect
                  options={AUTO_HUB_CITIES}
                  value={preferredLocations}
                  onChange={setPreferredLocations}
                  placeholder="Select preferred locations"
                  max={5}
                  error={!!errors.preferredLocations}
                />
              </Field>
            </section>
          )}

          {step === 2 && (
            <section className="space-y-6 animate-fade-in">
              <SectionTitle icon={Briefcase} title={isFresher ? 'Your education' : 'Your experience'} />

              {isFresher ? (
                <>
                  <div className="grid sm:grid-cols-2 gap-5">
                    <Field
                      label="Passing year"
                      required
                      error={errors.passingYear}
                      htmlFor="passingYear"
                    >
                      <SearchableSelect
                        id="passingYear"
                        options={PASSING_YEARS.map(String)}
                        value={passingYear}
                        onChange={setPassingYear}
                        placeholder="Select year"
                        error={!!errors.passingYear}
                      />
                    </Field>

                    <Field
                      label="College / Institute"
                      required
                      error={errors.college}
                      htmlFor="college"
                    >
                      <TextInput
                        id="college"
                        value={college}
                        onChange={(e) => setCollege(e.target.value)}
                        placeholder="Government Polytechnic, Pune"
                        error={!!errors.college}
                      />
                    </Field>
                  </div>

                  <Field
                    label="Internship or apprenticeship"
                    htmlFor="internship"
                    hint="Where did you train, and on what?"
                  >
                    <TextInput
                      id="internship"
                      value={internship}
                      onChange={(e) => setInternship(e.target.value)}
                      placeholder="6-month apprenticeship at Maruti service centre"
                    />
                  </Field>

                  <Field
                    label="Certifications"
                    htmlFor="certifications"
                    hint="OEM training, EV safety, diagnostics tools — anything relevant."
                  >
                    <TextInput
                      id="certifications"
                      value={certifications}
                      onChange={(e) => setCertifications(e.target.value)}
                      placeholder="Maruti L2 Technician, EV HV Safety Level 1"
                    />
                  </Field>
                </>
              ) : (
                <>
                  <Field
                    label="Total experience"
                    required
                    error={errors.totalExperience}
                    htmlFor="totalExperience"
                  >
                    <SearchableSelect
                      id="totalExperience"
                      options={EXPERIENCE_BANDS}
                      value={totalExperience}
                      onChange={setTotalExperience}
                      placeholder="Select experience"
                      error={!!errors.totalExperience}
                    />
                  </Field>

                  {isNonAutomobile && (
                    <Field
                      label="Current industry"
                      required
                      error={errors.industry}
                      htmlFor="industry"
                    >
                      <SearchableSelect
                        id="industry"
                        options={INDUSTRIES}
                        value={industry}
                        onChange={setIndustry}
                        placeholder="Select your industry"
                        error={!!errors.industry}
                      />
                    </Field>
                  )}

                  <div className="grid sm:grid-cols-2 gap-5">
                    <Field
                      label="Current company"
                      required
                      error={errors.currentCompany}
                      htmlFor="currentCompany"
                    >
                      <TextInput
                        id="currentCompany"
                        value={currentCompany}
                        onChange={(e) => setCurrentCompany(e.target.value)}
                        placeholder="Company name"
                        error={!!errors.currentCompany}
                      />
                    </Field>

                    <Field
                      label="Current designation"
                      required
                      error={errors.currentDesignation}
                      htmlFor="currentDesignation"
                    >
                      <TextInput
                        id="currentDesignation"
                        value={currentDesignation}
                        onChange={(e) => setCurrentDesignation(e.target.value)}
                        placeholder="Service Advisor"
                        error={!!errors.currentDesignation}
                      />
                    </Field>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-5">
                    <Field
                      label="Current salary"
                      htmlFor="currentSalary"
                      hint="Annual CTC in ₹"
                    >
                      <TextInput
                        id="currentSalary"
                        type="number"
                        min={0}
                        value={currentSalary}
                        onChange={(e) => setCurrentSalary(e.target.value)}
                        placeholder="360000"
                      />
                    </Field>

                    <Field
                      label="Expected salary"
                      htmlFor="expectedSalary"
                      hint="Annual CTC in ₹"
                    >
                      <TextInput
                        id="expectedSalary"
                        type="number"
                        min={0}
                        value={expectedSalary}
                        onChange={(e) => setExpectedSalary(e.target.value)}
                        placeholder="480000"
                      />
                    </Field>
                  </div>

                  <Field
                    label="Notice period"
                    required
                    error={errors.noticePeriodBand}
                    htmlFor="notice"
                  >
                    <SearchableSelect
                      id="notice"
                      options={NOTICE_PERIODS}
                      value={noticePeriodBand}
                      onChange={setNoticePeriodBand}
                      placeholder="Select notice period"
                      error={!!errors.noticePeriodBand}
                    />
                  </Field>

                  {isAutomobile && (
                    <Field
                      label="Automobile brand experience"
                      required
                      error={errors.brandExperience}
                      hint="Select every brand you have worked with."
                    >
                      <MultiSelect
                        options={OEM_BRANDS}
                        value={brandExperience}
                        onChange={setBrandExperience}
                        placeholder="Select brands"
                        error={!!errors.brandExperience}
                      />
                    </Field>
                  )}
                </>
              )}
            </section>
          )}

          {step === 3 && (
            <section className="space-y-6 animate-fade-in">
              <SectionTitle icon={FileText} title="Documents and preferences" />

              <Field label="Resume" hint="PDF, DOC or DOCX. Up to 5MB.">
                <FileUpload
                  accept=".pdf,.doc,.docx"
                  maxBytes={MAX_RESUME_BYTES}
                  value={resume?.url}
                  fileName={resume?.name}
                  onChange={setResume}
                  label="Upload your resume"
                  hint="Drag and drop, or click to browse"
                />
              </Field>

              <Field label="Profile photo" hint="JPG, PNG or WEBP. Up to 2MB.">
                <FileUpload
                  accept=".jpg,.jpeg,.png,.webp"
                  maxBytes={MAX_IMAGE_BYTES}
                  value={photo?.url}
                  fileName={photo?.name}
                  onChange={setPhoto}
                  label="Upload a photo"
                  hint="A clear headshot works best"
                />
              </Field>

              <div className="grid sm:grid-cols-2 gap-5">
                <Field label="Do you have a driving licence?" required>
                  <YesNo
                    name="drivingLicense"
                    value={drivingLicense}
                    onChange={setDrivingLicense}
                  />
                </Field>

                <Field label="Do you own a vehicle?" required>
                  <YesNo name="ownVehicle" value={ownVehicle} onChange={setOwnVehicle} />
                </Field>
              </div>

              <Field
                label="Languages known"
                required
                error={errors.languages}
                hint="Field and showroom roles often need a specific local language."
              >
                <MultiSelect
                  options={LANGUAGES}
                  value={languages}
                  onChange={setLanguages}
                  placeholder="Select languages"
                  max={8}
                  error={!!errors.languages}
                />
              </Field>

              <Field label="Referral code" htmlFor="referral" hint="Optional.">
                <TextInput
                  id="referral"
                  value={referralCode}
                  onChange={(e) => setReferralCode(e.target.value)}
                  placeholder="MOTO1234"
                />
              </Field>

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded border-line cursor-pointer accent-brand-600"
                />
                <span className="text-[13px] text-ink-muted leading-[1.6]">
                  I confirm these details are accurate and accept the{' '}
                  <a href="/terms" className="font-semibold text-brand-600 hover:text-brand-700">
                    Terms &amp; Conditions
                  </a>
                  .
                </span>
              </label>
              {errors.acceptTerms && (
                <p className="-mt-3 text-[12.5px] font-medium text-critical" role="alert">
                  {errors.acceptTerms}
                </p>
              )}
            </section>
          )}

          {formError && (
            <p className="mt-6 text-[13.5px] font-medium text-critical animate-fade-in" role="alert">
              {formError}
            </p>
          )}

          <div className="flex items-center justify-between gap-3 mt-9 pt-6 border-t border-line">
            <button
              type="button"
              onClick={back}
              disabled={step === 0 || submitting}
              className="inline-flex items-center gap-2 text-[14px] font-semibold text-ink-muted hover:text-brand-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>

            {step < STEPS.length - 1 ? (
              <button
                type="button"
                onClick={next}
                className="inline-flex items-center gap-2 grad-brand text-white font-semibold text-[14.5px] rounded-[14px] px-6 py-3 shadow-brand transition-all duration-300 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:shadow-e4"
              >
                Continue
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
        </div>
      </div>
    </div>
  );
}

function SectionTitle({
  icon: Icon,
  title,
}: {
  icon: typeof UserCircle2;
  title: string;
}) {
  return (
    <div className="flex items-center gap-2.5 pb-1">
      <span className="w-9 h-9 rounded-[12px] bg-brand-50 border border-brand-100 flex items-center justify-center shrink-0">
        <Icon className="w-4.5 h-4.5 text-brand-600" strokeWidth={2.1} />
      </span>
      <h2 className="text-[17px] font-bold text-ink tracking-[-0.02em]">{title}</h2>
    </div>
  );
}
