'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Briefcase,
  CheckCircle,
  Clock,
  FileText,
  IndianRupee,
  Loader2,
  Send,
  Tag,
  Wand2,
} from 'lucide-react';
import { apiFetch } from '@/lib/http';
import {
  CITIES_BY_STATE,
  EXPERIENCE_LEVELS,
  INDIAN_STATES,
  JOB_BENEFITS,
  JOB_CATEGORIES,
  JOB_TYPES,
  JOINING_TIMELINES,
  QUALIFICATIONS,
  ROLES_BY_CATEGORY,
  SALARY_BANDS,
  WORK_MODES,
  type CategoryId,
} from '@/lib/automotive';
import { Field, RadioCards, SearchableSelect, TextInput } from '@/components/form';
import ChipSelect from '@/components/onboarding/ChipSelect';

interface JobForm {
  title: string;
  category: CategoryId;
  description: string;
  requirements: string;
  responsibilities: string;
  state: string;
  city: string;
  jobType: string;
  workMode: string;
  experience: string;
  education: string;
  minSalary: string;
  maxSalary: string;
  skills: string;
  benefits: string[];
  joiningTimeline: string;
  openings: string;
  deadline: string;
}

const DEFAULT_FORM: JobForm = {
  title: '',
  category: 'service',
  description: '',
  requirements: '',
  responsibilities: '',
  state: '',
  city: '',
  jobType: 'Full-time',
  workMode: 'Onsite',
  experience: '1-3 years',
  education: 'ITI - Motor Mechanic Vehicle (MMV)',
  minSalary: '',
  maxSalary: '',
  skills: '',
  benefits: [],
  joiningTimeline: 'Within 30 days',
  openings: '1',
  deadline: '',
};

const WORK_MODE_OPTIONS = WORK_MODES.map((m) => ({ value: m, label: m }));
const BENEFIT_OPTIONS = JOB_BENEFITS.map((b) => ({ value: b, label: b }));

const CARD = 'surface sheen p-5 sm:p-7';
const HEADING = 'text-[16px] font-bold text-ink tracking-[-0.025em] mb-5';

export default function PostJobPage() {
  const router = useRouter();
  const [form, setForm] = useState<JobForm>(DEFAULT_FORM);
  const [posting, setPosting] = useState<'DRAFT' | 'PENDING' | null>(null);
  const [success, setSuccess] = useState<'DRAFT' | 'PENDING' | null>(null);
  const [error, setError] = useState('');
  const [generating, setGenerating] = useState(false);

  const cities = CITIES_BY_STATE[form.state] ?? [];

  function update<K extends keyof JobForm>(key: K, value: JobForm[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  // Prefill the salary band when a known role is picked — keeps posted salaries realistic.
  function selectRole(role: string) {
    const band = SALARY_BANDS[role];
    setForm((prev) => ({
      ...prev,
      title: role,
      ...(band ? { minSalary: String(band[0]), maxSalary: String(band[1]) } : {}),
    }));
  }

  async function generateJD() {
    if (!form.title.trim()) return;
    setGenerating(true);
    setError('');
    try {
      const res = await apiFetch('/api/ai/jd-generator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title,
          experience: form.experience,
          skills: form.skills
            ? form.skills.split(',').map((s) => s.trim()).filter(Boolean)
            : [],
        }),
      });
      const { result } = await res.json();
      if (!result) throw new Error('No content returned');
      if (result.description) update('description', result.description);
      if (result.requirements) {
        update(
          'requirements',
          Array.isArray(result.requirements)
            ? result.requirements.join('\n')
            : result.requirements
        );
      }
      if (result.responsibilities) {
        update(
          'responsibilities',
          Array.isArray(result.responsibilities)
            ? result.responsibilities.join('\n')
            : result.responsibilities
        );
      }
    } catch {
      setError('Could not generate a description. Check the OpenAI API key.');
    } finally {
      setGenerating(false);
    }
  }

  async function submit(status: 'DRAFT' | 'PENDING') {
    if (!form.title.trim()) {
      setError('Pick a role or enter a job title.');
      return;
    }
    // A draft is a work in progress, so only the title is required to park it.
    if (status === 'PENDING' && (!form.description.trim() || !form.state || !form.city)) {
      setError('A description, state and city are required to publish.');
      return;
    }

    setPosting(status);
    setError('');
    try {
      const res = await apiFetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          status,
          location: [form.city, form.state].filter(Boolean).join(', '),
          minSalary: form.minSalary || undefined,
          maxSalary: form.maxSalary || undefined,
          openings: Number(form.openings) || 1,
          skills: form.skills
            ? form.skills.split(',').map((s) => s.trim()).filter(Boolean)
            : [],
          deadline: form.deadline ? new Date(form.deadline).toISOString() : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSuccess(status);
      setTimeout(() => router.push('/recruiter/manage-jobs'), 1600);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Could not post the job');
      setPosting(null);
    }
  }

  if (success) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="surface-float sheen text-center px-10 py-14 max-w-md animate-scale-in">
          <div className="w-20 h-20 rounded-[24px] bg-positive-soft border border-[#BEE7D8] flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-9 h-9 text-positive" strokeWidth={2.1} />
          </div>
          <h2 className="text-[22px] font-extrabold text-ink tracking-[-0.03em] mb-2.5">
            {success === 'DRAFT' ? 'Draft saved' : 'Job submitted'}
          </h2>
          <p className="text-ink-muted text-[14.5px]">
            {success === 'DRAFT'
              ? 'You can finish and publish it any time.'
              : 'It goes live once our team reviews it.'}
          </p>
          <div className="progress-track mt-7" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-[26px] sm:text-[28px] font-extrabold text-ink tracking-[-0.035em]">
          Post a New Job
        </h1>
        <p className="text-ink-muted text-[14.5px] mt-1.5">
          Reach automobile-sector candidates across India
        </p>
      </div>

      {error && (
        <div
          role="alert"
          className="bg-critical-soft border border-critical/20 text-critical rounded-[14px] px-4 py-3 text-sm font-medium"
        >
          {error}
        </div>
      )}

      <div className={CARD}>
        <h2 className={HEADING}>Job details</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Field label="Job category" required>
            <SearchableSelect
              options={JOB_CATEGORIES.map((c) => c.label)}
              value={JOB_CATEGORIES.find((c) => c.id === form.category)?.label ?? ''}
              onChange={(label) => {
                const found = JOB_CATEGORIES.find((c) => c.label === label);
                if (found) setForm((p) => ({ ...p, category: found.id, title: '' }));
              }}
              placeholder="Select a category"
            />
          </Field>

          <Field label="Role" required>
            <SearchableSelect
              options={ROLES_BY_CATEGORY[form.category]}
              value={form.title}
              onChange={selectRole}
              allowCustom
              placeholder="Select a role"
            />
          </Field>

          <Field
            label="Job title"
            className="sm:col-span-2"
            hint="Edit if you advertise this role under a different name."
          >
            <div className="relative">
              <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-faint pointer-events-none z-10" />
              <TextInput
                value={form.title}
                onChange={(e) => update('title', e.target.value)}
                placeholder="e.g. Service Advisor"
                className="pl-11"
              />
            </div>
          </Field>

          <Field label="Employment type">
            <SearchableSelect
              options={JOB_TYPES}
              value={form.jobType}
              onChange={(v) => update('jobType', v)}
            />
          </Field>

          <Field label="Experience required">
            <SearchableSelect
              options={EXPERIENCE_LEVELS}
              value={form.experience}
              onChange={(v) => update('experience', v)}
            />
          </Field>

          <Field label="Minimum qualification" className="sm:col-span-2">
            <SearchableSelect
              options={QUALIFICATIONS}
              value={form.education}
              onChange={(v) => update('education', v)}
            />
          </Field>

          <Field label="Number of openings">
            <TextInput
              inputMode="numeric"
              value={form.openings}
              onChange={(e) => update('openings', e.target.value.replace(/\D/g, ''))}
              placeholder="1"
            />
          </Field>

          <Field label="Application deadline">
            <div className="relative">
              <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-faint pointer-events-none z-10" />
              <TextInput
                type="date"
                value={form.deadline}
                onChange={(e) => update('deadline', e.target.value)}
                className="pl-11"
              />
            </div>
          </Field>
        </div>
      </div>

      <div className={CARD}>
        <h2 className={HEADING}>Location</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Field label="State" required>
            <SearchableSelect
              options={INDIAN_STATES}
              value={form.state}
              onChange={(v) => setForm((p) => ({ ...p, state: v, city: '' }))}
              placeholder="Select state"
            />
          </Field>

          <Field label="City" required hint={form.state ? undefined : 'Pick a state first'}>
            <SearchableSelect
              options={cities}
              value={form.city}
              onChange={(v) => update('city', v)}
              disabled={!form.state}
              allowCustom
              placeholder="Select city"
            />
          </Field>

          <Field label="Workplace type" className="sm:col-span-2">
            <RadioCards
              name="workMode"
              options={WORK_MODE_OPTIONS}
              value={form.workMode}
              onChange={(v) => update('workMode', v)}
              columns={3}
            />
          </Field>
        </div>
      </div>

      <div className={CARD}>
        <h2 className={HEADING}>Compensation</h2>
        <p className="text-[13px] text-ink-muted -mt-3 mb-5">
          Annual CTC in rupees. Picking a role above prefills the typical band.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Field label="Minimum salary (₹ per year)">
            <div className="relative">
              <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-faint pointer-events-none z-10" />
              <TextInput
                inputMode="numeric"
                value={form.minSalary}
                onChange={(e) => update('minSalary', e.target.value.replace(/\D/g, ''))}
                placeholder="240000"
                className="pl-11"
              />
            </div>
          </Field>

          <Field label="Maximum salary (₹ per year)">
            <div className="relative">
              <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-faint pointer-events-none z-10" />
              <TextInput
                inputMode="numeric"
                value={form.maxSalary}
                onChange={(e) => update('maxSalary', e.target.value.replace(/\D/g, ''))}
                placeholder="450000"
                className="pl-11"
              />
            </div>
          </Field>

          <Field label="Joining timeline" className="sm:col-span-2">
            <SearchableSelect
              options={JOINING_TIMELINES}
              value={form.joiningTimeline}
              onChange={(v) => update('joiningTimeline', v)}
            />
          </Field>
        </div>
      </div>

      <div className={CARD}>
        <h2 className={HEADING}>Skills &amp; benefits</h2>
        <div className="space-y-5">
          <Field label="Required skills" hint="Comma separated.">
            <div className="relative">
              <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-faint pointer-events-none z-10" />
              <TextInput
                value={form.skills}
                onChange={(e) => update('skills', e.target.value)}
                placeholder="Engine Diagnostics, DMS Software, Customer Handling"
                className="pl-11"
              />
            </div>
          </Field>

          <Field label="Benefits">
            <ChipSelect
              options={BENEFIT_OPTIONS}
              value={form.benefits}
              onChange={(v) => update('benefits', v)}
              columns={2}
            />
          </Field>
        </div>
      </div>

      <div className={CARD}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-11 h-11 rounded-[14px] grad-brand flex items-center justify-center shrink-0 shadow-brand">
              <Wand2 className="w-5 h-5 text-white" strokeWidth={2.1} />
            </div>
            <div className="min-w-0">
              <h2 className="text-[16px] font-bold text-ink tracking-[-0.025em]">
                Job description
              </h2>
              <p className="text-[13px] text-ink-muted mt-0.5">
                Write your own, or generate a first draft.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={generateJD}
            disabled={generating || !form.title.trim()}
            className="sweep press inline-flex shrink-0 items-center justify-center gap-2 grad-brand disabled:opacity-50 text-white font-semibold px-5 py-2.5 rounded-[12px] text-[13.5px] shadow-brand hover:-translate-y-0.5 transition-all duration-300 disabled:translate-y-0"
          >
            {generating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Wand2 className="w-4 h-4" />
            )}
            Generate
          </button>
        </div>

        <div className="space-y-5">
          <Field label="Job description" required>
            <div className="relative">
              <FileText className="absolute left-4 top-3.5 w-4 h-4 text-ink-faint pointer-events-none z-10" />
              <textarea
                value={form.description}
                onChange={(e) => update('description', e.target.value)}
                rows={6}
                placeholder="Describe the role, the workshop or showroom, and what the day looks like…"
                className={`${TEXTAREA} pl-11`}
              />
            </div>
          </Field>

          <Field label="Responsibilities">
            <textarea
              value={form.responsibilities}
              onChange={(e) => update('responsibilities', e.target.value)}
              rows={4}
              placeholder="Day-to-day duties on the floor…"
              className={TEXTAREA}
            />
          </Field>

          <Field label="Requirements">
            <textarea
              value={form.requirements}
              onChange={(e) => update('requirements', e.target.value)}
              rows={4}
              placeholder="ITI/diploma, years of experience, brands worked on, licence requirements…"
              className={TEXTAREA}
            />
          </Field>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-end gap-3 pb-2">
        <button
          type="button"
          onClick={() => submit('DRAFT')}
          disabled={posting !== null}
          className="press inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-ink border border-line hover:border-brand-200 hover:bg-brand-50/60 hover:text-brand-700 rounded-[14px] text-[14px] font-semibold transition-all duration-300 disabled:opacity-50"
        >
          {posting === 'DRAFT' ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <FileText className="w-4 h-4" />
          )}
          Save draft
        </button>
        <button
          type="button"
          onClick={() => submit('PENDING')}
          disabled={posting !== null}
          className="sweep press inline-flex items-center justify-center gap-2 grad-brand text-white font-semibold px-6 py-3 rounded-[14px] text-[14px] shadow-brand hover:-translate-y-0.5 hover:shadow-e4 transition-all duration-300 disabled:opacity-50 disabled:translate-y-0"
        >
          {posting === 'PENDING' ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
          Publish job
        </button>
      </div>
    </div>
  );
}

const TEXTAREA =
  'w-full bg-white text-ink placeholder-ink-faint text-sm rounded-[14px] px-4 py-3 border border-line outline-none shadow-[inset_0_1px_2px_rgba(16,24,40,0.04)] transition-all duration-300 leading-[1.7] resize-none scroll-slim hover:border-[#D9DEE9] focus:border-brand-600 focus:shadow-[0_0_0_4px_rgba(15,76,129,0.10)]';
