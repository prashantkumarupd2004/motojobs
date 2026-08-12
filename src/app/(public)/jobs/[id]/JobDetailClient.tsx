'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  MapPin, Briefcase, Clock, DollarSign, Users, CheckCircle,
  BookmarkPlus, ArrowLeft, Building2, Calendar, GraduationCap, Loader2,
} from 'lucide-react';
import { apiFetch } from '@/lib/http';
import type { Job } from '@/types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function JobDetailClient({ job }: { job: any }) {
  const router = useRouter();
  const [applying,       setApplying]       = useState(false);
  const [applied,        setApplied]        = useState(false);
  const [saving,         setSaving]         = useState(false);
  const [saved,          setSaved]          = useState(false);
  const [error,          setError]          = useState('');
  const [coverLetter,    setCoverLetter]    = useState('');
  const [showApplyModal, setShowApplyModal] = useState(false);

  async function handleApply() {
    setApplying(true);
    setError('');
    try {
      const res = await apiFetch('/api/candidate/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId: job.id, coverLetter }),
      });
      if (res.status === 401) { router.push('/login'); return; }
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setApplied(true);
      setShowApplyModal(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to apply');
    } finally {
      setApplying(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    try {
      const res = await apiFetch('/api/candidate/saved-jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId: job.id }),
      });
      if (res.ok) setSaved(true);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link href="/jobs" className="inline-flex items-center gap-2 text-ink-muted hover:text-ink transition-colors mb-8 text-sm">
          <ArrowLeft className="w-4 h-4" /> Back to Jobs
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* ── Main Content ── */}
          <div className="lg:col-span-2 space-y-6">
            {/* Job Header */}
            <div className="bg-white border border-line rounded-[20px] p-6">
              <div className="flex items-start gap-4 mb-5">
                <div className="w-16 h-16 rounded-[16px] bg-gradient-to-br from-[#1F5D95] to-[#0F4C81] flex items-center justify-center text-white text-2xl font-bold shrink-0">
                  {job.company?.name?.[0] || job.title[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <h1 className="text-2xl font-bold text-ink mb-1">{job.title}</h1>
                  <p className="text-brand-600 font-medium">{job.company?.name || 'Company'}</p>
                  {job.company?.website && (
                    <a href={job.company.website} target="_blank" rel="noopener noreferrer" className="text-sm text-ink-muted hover:text-ink-soft transition-colors">
                      {job.company.website}
                    </a>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5">
                {job.location && (
                  <div className="bg-canvas rounded-[16px] p-3">
                    <MapPin className="w-5 h-5 text-brand-600 mb-1" />
                    <p className="text-xs text-ink-muted">Location</p>
                    <p className="text-sm text-ink font-medium">{job.location}</p>
                  </div>
                )}
                <div className="bg-canvas rounded-[16px] p-3">
                  <Briefcase className="w-5 h-5 text-ignite-600 mb-1" />
                  <p className="text-xs text-ink-muted">Type</p>
                  <p className="text-sm text-ink font-medium">{job.jobType}</p>
                </div>
                <div className="bg-canvas rounded-[16px] p-3">
                  <Building2 className="w-5 h-5 text-brand-600 mb-1" />
                  <p className="text-xs text-ink-muted">Work Mode</p>
                  <p className="text-sm text-ink font-medium">{job.workMode}</p>
                </div>
                {(job.minSalary || job.maxSalary) && (
                  <div className="bg-canvas rounded-[16px] p-3">
                    <DollarSign className="w-5 h-5 text-[#0A7A54] mb-1" />
                    <p className="text-xs text-ink-muted">Salary</p>
                    <p className="text-sm text-ink font-medium">
                      {job.minSalary ? `${(job.minSalary / 100000).toFixed(0)}L` : ''}
                      {job.maxSalary ? `-${(job.maxSalary / 100000).toFixed(0)}L` : ''} PA
                    </p>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                {job.skills?.map((skill: string) => (
                  <span key={skill} className="text-sm bg-brand-50 text-brand-700 border border-brand-100 rounded-lg px-3 py-1">{skill}</span>
                ))}
              </div>
            </div>

            {/* Description */}
            <div className="bg-white border border-line rounded-[20px] p-6">
              <h2 className="text-lg font-bold text-ink mb-4">Job Description</h2>
              <div className="text-ink-soft leading-relaxed whitespace-pre-wrap text-sm">{job.description}</div>
            </div>

            {job.requirements && (
              <div className="bg-white border border-line rounded-[20px] p-6">
                <h2 className="text-lg font-bold text-ink mb-4">Requirements</h2>
                <div className="text-ink-soft leading-relaxed whitespace-pre-wrap text-sm">{job.requirements}</div>
              </div>
            )}

            {job.responsibilities && (
              <div className="bg-white border border-line rounded-[20px] p-6">
                <h2 className="text-lg font-bold text-ink mb-4">Responsibilities</h2>
                <div className="text-ink-soft leading-relaxed whitespace-pre-wrap text-sm">{job.responsibilities}</div>
              </div>
            )}
          </div>

          {/* ── Sidebar ── */}
          <div className="space-y-5">
            {/* Apply Card */}
            <div className="bg-white border border-line rounded-[20px] p-5 sticky top-20">
              <div className="text-center mb-4">
                <p className="text-ink-muted text-sm">{job._count?.applications || 0} applicants</p>
              </div>
              {error && <div className="bg-critical-soft border border-[#F3C9C9] text-[#B32B2B] rounded-lg px-3 py-2 mb-4 text-xs">{error}</div>}
              {applied ? (
                <div className="text-center">
                  <CheckCircle className="w-12 h-12 text-[#0A7A54] mx-auto mb-3" />
                  <p className="text-ink font-semibold">Application Sent!</p>
                  <p className="text-ink-muted text-sm mt-1">We&apos;ll notify you of any updates</p>
                </div>
              ) : (
                <>
                  <button onClick={() => setShowApplyModal(true)} className="w-full bg-gradient-to-r from-[#1F5D95] to-[#0F4C81] hover:from-brand-500 hover:to-ignite-500 text-white font-semibold py-3 rounded-[16px] transition-all mb-3">
                    Apply Now
                  </button>
                  <button onClick={handleSave} disabled={saving || saved} className={`w-full border py-3 rounded-[16px] font-medium transition-all text-sm flex items-center justify-center gap-2 ${saved ? 'border-[#BEE7D8] text-[#0A7A54]' : 'border-line text-ink-soft hover:border-brand-300'}`}>
                    <BookmarkPlus className="w-4 h-4" />{saved ? 'Saved' : 'Save Job'}
                  </button>
                </>
              )}

              <div className="mt-4 pt-4 border-t border-line space-y-3">
                {job.experience && (
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4 text-ink-muted" />
                    <span className="text-ink-muted">Experience:</span>
                    <span className="text-ink">{job.experience}</span>
                  </div>
                )}
                {job.education && (
                  <div className="flex items-center gap-2 text-sm">
                    <GraduationCap className="w-4 h-4 text-ink-muted" />
                    <span className="text-ink-muted">Education:</span>
                    <span className="text-ink">{job.education}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm">
                  <Users className="w-4 h-4 text-ink-muted" />
                  <span className="text-ink-muted">Openings:</span>
                  <span className="text-ink">{job.openings}</span>
                </div>
                {job.deadline && (
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-ink-muted" />
                    <span className="text-ink-muted">Deadline:</span>
                    <span className="text-ink">{new Date(job.deadline).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Company Info */}
            {job.company && (
              <div className="bg-white border border-line rounded-[20px] p-5">
                <h3 className="font-bold text-ink mb-3">About Company</h3>
                <div className="space-y-2 text-sm">
                  {job.company.industry && <p className="text-ink-muted"><span className="text-ink-soft">Industry:</span> {job.company.industry}</p>}
                  {job.company.size && <p className="text-ink-muted"><span className="text-ink-soft">Size:</span> {job.company.size}</p>}
                  {job.company.headquarters && <p className="text-ink-muted"><span className="text-ink-soft">HQ:</span> {job.company.headquarters}</p>}
                  {job.company.description && <p className="text-ink-muted mt-2 leading-relaxed">{job.company.description}</p>}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Apply Modal ── */}
      {showApplyModal && (
        <div className="fixed inset-0 bg-[#0B1220]/35 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="bg-white border border-line rounded-[20px] p-6 w-full max-w-lg">
            <h3 className="text-xl font-bold text-ink mb-4">Apply for {job.title}</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-ink-soft mb-2">Cover Letter (optional)</label>
              <textarea
                value={coverLetter}
                onChange={e => setCoverLetter(e.target.value)}
                rows={5}
                placeholder="Tell the recruiter why you're a great fit..."
                className="w-full bg-canvas border border-line text-ink placeholder-ink-faint rounded-[16px] p-3 text-sm focus:outline-none focus:border-brand-300 transition-colors resize-none"
              />
            </div>
            {error && <div className="bg-critical-soft border border-[#F3C9C9] text-[#B32B2B] rounded-lg px-3 py-2 mb-4 text-xs">{error}</div>}
            <div className="flex gap-3">
              <button onClick={() => setShowApplyModal(false)} className="flex-1 border border-line text-ink-soft py-3 rounded-[16px] hover:border-brand-200 transition-colors">Cancel</button>
              <button onClick={handleApply} disabled={applying} className="flex-1 bg-brand-600 hover:bg-brand-500 text-white py-3 rounded-[16px] font-semibold transition-colors flex items-center justify-center gap-2">
                {applying ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Submit Application'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
