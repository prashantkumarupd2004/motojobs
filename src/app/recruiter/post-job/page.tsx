'use client';
import { apiFetch } from '@/lib/http';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Briefcase, MapPin, IndianRupee, Clock, Tag, FileText, Loader2, CheckCircle, Wand2, GraduationCap } from 'lucide-react';
import {
  JOB_CATEGORIES, ROLES_BY_CATEGORY, JOB_TYPES, WORK_MODES,
  EXPERIENCE_LEVELS, QUALIFICATIONS, SALARY_BANDS, type CategoryId,
} from '@/lib/automotive';

const INPUT_CLASS = 'w-full bg-white border border-line rounded-[14px] px-4 py-3 text-sm text-ink placeholder-ink-faint shadow-[inset_0_1px_2px_rgba(16,24,40,0.04)] focus:border-brand-600 focus:shadow-[0_0_0_4px_rgba(15,76,129,0.10)] outline-none transition-all duration-300';
const INPUT_ICON_CLASS = 'w-full bg-white border border-line rounded-[14px] pl-11 pr-4 py-3 text-sm text-ink placeholder-ink-faint shadow-[inset_0_1px_2px_rgba(16,24,40,0.04)] focus:border-brand-600 focus:shadow-[0_0_0_4px_rgba(15,76,129,0.10)] outline-none transition-all duration-300';
const LABEL_CLASS = 'block text-[13px] font-semibold text-ink-soft mb-2';

interface JobForm {
  title: string;
  category: CategoryId;
  description: string;
  requirements: string;
  responsibilities: string;
  location: string;
  jobType: string;
  workMode: string;
  experience: string;
  education: string;
  minSalary: string;
  maxSalary: string;
  skills: string;
  openings: string;
  deadline: string;
}

const DEFAULT_FORM: JobForm = {
  title: '', category: 'service', description: '', requirements: '', responsibilities: '',
  location: '', jobType: 'Full-time', workMode: 'On-site', experience: '1-3 years',
  education: 'ITI - Motor Mechanic Vehicle (MMV)', minSalary: '', maxSalary: '',
  skills: '', openings: '1', deadline: '',
};

export default function PostJobPage() {
  const [form, setForm] = useState<JobForm>(DEFAULT_FORM);
  const [posting, setPosting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [generating, setGenerating] = useState(false);
  const router = useRouter();

  function update(key: keyof JobForm, value: string) {
    setForm(prev => ({ ...prev, [key]: value }));
  }

  // Prefill the salary band when a known role is picked — keeps posted salaries realistic.
  function selectRole(role: string) {
    const band = SALARY_BANDS[role];
    setForm(prev => ({
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
          skills: form.skills ? form.skills.split(',').map(s => s.trim()).filter(Boolean) : [],
        }),
      });
      const { result } = await res.json();
      if (!result) throw new Error('No content returned');
      if (result.description) update('description', result.description);
      if (result.requirements) {
        update('requirements', Array.isArray(result.requirements) ? result.requirements.join('\n') : result.requirements);
      }
      if (result.responsibilities) {
        update('responsibilities', Array.isArray(result.responsibilities) ? result.responsibilities.join('\n') : result.responsibilities);
      }
    } catch {
      setError('Failed to generate JD. Check OpenAI API key.');
    } finally { setGenerating(false); }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title || !form.description || !form.location) {
      setError('Title, description, and location are required.');
      return;
    }
    setPosting(true);
    setError('');
    try {
      const res = await apiFetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          minSalary: form.minSalary || undefined,
          maxSalary: form.maxSalary || undefined,
          openings: Number(form.openings) || 1,
          skills: form.skills ? form.skills.split(',').map(s => s.trim()).filter(Boolean) : [],
          deadline: form.deadline ? new Date(form.deadline).toISOString() : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSuccess(true);
      setForm(DEFAULT_FORM);
      setTimeout(() => router.push('/recruiter/manage-jobs'), 2000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to post job');
    } finally { setPosting(false); }
  }

  if (success) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="surface-float sheen text-center px-10 py-14 max-w-md animate-scale-in">
        <div className="w-20 h-20 rounded-[24px] bg-positive-soft border border-positive/20 flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-9 h-9 text-positive" strokeWidth={2.1} />
        </div>
        <h2 className="text-[24px] font-extrabold text-ink tracking-[-0.03em] mb-2.5">Job Posted Successfully!</h2>
        <p className="text-ink-muted text-[14.5px]">Redirecting to job management...</p>
        <div className="progress-track mt-7" />
      </div>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto space-y-7">
      <div>
        <h1 className="text-[28px] font-extrabold text-ink tracking-[-0.035em]">Post a New Job</h1>
        <p className="text-ink-muted text-[15px] mt-1.5">Reach automobile-sector candidates across India</p>
      </div>

      {error && <div className="bg-critical-soft border border-critical/20 text-critical rounded-[14px] px-4 py-3 text-sm font-medium">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Job Basics */}
        <div className="surface sheen p-6 sm:p-8">
          <h2 className="text-[17px] font-bold text-ink tracking-[-0.025em] mb-6">Job Details</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className={LABEL_CLASS}>Department <span className="text-critical">*</span></label>
              <select
                value={form.category}
                onChange={e => setForm(prev => ({ ...prev, category: e.target.value as CategoryId, title: '' }))}
                className={INPUT_CLASS}
              >
                {JOB_CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
              </select>
            </div>
            <div>
              <label className={LABEL_CLASS}>Role <span className="text-critical">*</span></label>
              <select value={form.title} onChange={e => selectRole(e.target.value)} className={INPUT_CLASS}>
                <option value="">Select a role...</option>
                {ROLES_BY_CATEGORY[form.category].map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className={LABEL_CLASS}>Job Title <span className="text-ink-faint font-normal">(edit if needed)</span></label>
              <div className="relative">
                <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-faint pointer-events-none" />
                <input value={form.title} onChange={e => update('title', e.target.value)} placeholder="e.g. Service Advisor" className={INPUT_ICON_CLASS} />
              </div>
            </div>
            <div>
              <label className={LABEL_CLASS}>Job Type</label>
              <select value={form.jobType} onChange={e => update('jobType', e.target.value)} className={INPUT_CLASS}>
                {JOB_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className={LABEL_CLASS}>Work Mode</label>
              <select value={form.workMode} onChange={e => update('workMode', e.target.value)} className={INPUT_CLASS}>
                {WORK_MODES.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className={LABEL_CLASS}>Experience</label>
              <select value={form.experience} onChange={e => update('experience', e.target.value)} className={INPUT_CLASS}>
                {EXPERIENCE_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            <div>
              <label className={LABEL_CLASS}>Minimum Qualification</label>
              <div className="relative">
                <GraduationCap className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-faint pointer-events-none" />
                <select value={form.education} onChange={e => update('education', e.target.value)} className={INPUT_ICON_CLASS}>
                  {QUALIFICATIONS.map(q => <option key={q} value={q}>{q}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className={LABEL_CLASS}>Location <span className="text-critical">*</span></label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-faint pointer-events-none" />
                <input value={form.location} onChange={e => update('location', e.target.value)} placeholder="e.g. Pune, Maharashtra" className={INPUT_ICON_CLASS} />
              </div>
            </div>
            <div>
              <label className={LABEL_CLASS}>Number of Openings</label>
              <input type="number" min="1" value={form.openings} onChange={e => update('openings', e.target.value)} className={INPUT_CLASS} />
            </div>
            <div>
              <label className={LABEL_CLASS}>Application Deadline</label>
              <div className="relative">
                <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-faint pointer-events-none" />
                <input type="date" value={form.deadline} onChange={e => update('deadline', e.target.value)} className={INPUT_ICON_CLASS} />
              </div>
            </div>
          </div>
        </div>

        {/* Salary */}
        <div className="surface sheen p-6 sm:p-8">
          <h2 className="text-[17px] font-bold text-ink tracking-[-0.025em] mb-2">Compensation</h2>
          <p className="text-[13px] text-ink-muted mb-6">Annual CTC in rupees. Picking a role above prefills the typical band.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className={LABEL_CLASS}>Min Salary (₹ per year)</label>
              <div className="relative">
                <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-faint pointer-events-none" />
                <input type="number" value={form.minSalary} onChange={e => update('minSalary', e.target.value)} placeholder="240000" className={INPUT_ICON_CLASS} />
              </div>
            </div>
            <div>
              <label className={LABEL_CLASS}>Max Salary (₹ per year)</label>
              <div className="relative">
                <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-faint pointer-events-none" />
                <input type="number" value={form.maxSalary} onChange={e => update('maxSalary', e.target.value)} placeholder="450000" className={INPUT_ICON_CLASS} />
              </div>
            </div>
          </div>
        </div>

        {/* Skills */}
        <div className="surface sheen p-6 sm:p-8">
          <h2 className="text-[17px] font-bold text-ink tracking-[-0.025em] mb-6">Required Skills</h2>
          <div>
            <label className={LABEL_CLASS}>Skills <span className="text-ink-faint font-normal">(comma separated)</span></label>
            <div className="relative">
              <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-faint pointer-events-none" />
              <input value={form.skills} onChange={e => update('skills', e.target.value)} placeholder="Engine Diagnostics, DMS Software, Customer Handling, Warranty Claim Processing" className={INPUT_ICON_CLASS} />
            </div>
          </div>
        </div>

        {/* AI JD Generator */}
        <div className="surface sheen p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="relative w-11 h-11 rounded-[14px] grad-ignite flex items-center justify-center shrink-0 shadow-[0_4px_10px_rgba(255,107,0,0.22)]">
                <Wand2 className="w-5 h-5 text-white" strokeWidth={2.1} />
                <span className="absolute inset-x-2.5 top-px h-px bg-white/40 rounded-full" />
              </div>
              <div className="min-w-0">
                <h2 className="text-[17px] font-bold text-ink tracking-[-0.025em]">AI Job Description Generator</h2>
                <p className="text-[13px] text-ink-muted mt-0.5">Auto-generate description &amp; requirements</p>
              </div>
            </div>
            <button type="button" onClick={generateJD} disabled={generating || !form.title.trim()} className="sweep press flex shrink-0 items-center justify-center gap-2 grad-ignite disabled:opacity-50 text-white font-semibold px-5 py-2.5 rounded-[14px] text-sm shadow-[0_4px_12px_rgba(255,107,0,0.22)] hover:shadow-[0_8px_22px_rgba(255,107,0,0.32)] hover:-translate-y-0.5 transition-all duration-300 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)]">
              {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
              Generate
            </button>
          </div>
          <div className="space-y-5">
            <div>
              <label className={LABEL_CLASS}>Job Description <span className="text-critical">*</span></label>
              <div className="relative">
                <FileText className="absolute left-4 top-3.5 w-4 h-4 text-ink-faint pointer-events-none" />
                <textarea value={form.description} onChange={e => update('description', e.target.value)} rows={6} placeholder="Describe the role, the workshop or showroom, and what the day looks like..." className={`${INPUT_ICON_CLASS} leading-[1.7] resize-none scroll-slim`} />
              </div>
            </div>
            <div>
              <label className={LABEL_CLASS}>Responsibilities</label>
              <textarea value={form.responsibilities} onChange={e => update('responsibilities', e.target.value)} rows={4} placeholder="Day-to-day duties on the floor..." className={`${INPUT_CLASS} leading-[1.7] resize-none scroll-slim`} />
            </div>
            <div>
              <label className={LABEL_CLASS}>Requirements</label>
              <textarea value={form.requirements} onChange={e => update('requirements', e.target.value)} rows={4} placeholder="ITI/diploma, years of experience, brands worked on, licence requirements..." className={`${INPUT_CLASS} leading-[1.7] resize-none scroll-slim`} />
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-end gap-3">
          <button type="button" onClick={() => setForm(DEFAULT_FORM)} className="press px-6 py-3 bg-white text-ink border border-line hover:border-brand-200 hover:bg-brand-50/60 hover:text-brand-700 rounded-[14px] text-sm font-semibold shadow-[0_1px_2px_rgba(16,24,40,0.04)] hover:shadow-[0_4px_12px_rgba(16,24,40,0.07)] transition-all duration-300">
            Reset
          </button>
          <button type="submit" disabled={posting} className="sweep press flex items-center justify-center gap-2 grad-ignite disabled:opacity-50 text-white font-semibold px-6 py-3 rounded-[14px] shadow-[0_4px_12px_rgba(255,107,0,0.22)] hover:shadow-[0_8px_22px_rgba(255,107,0,0.32)] hover:-translate-y-0.5 transition-all duration-300 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)]">
            {posting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Briefcase className="w-5 h-5" />}
            Post Job
          </button>
        </div>
      </form>
    </div>
  );
}
