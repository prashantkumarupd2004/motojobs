'use client';
import { apiFetch } from '@/lib/http';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Bookmark, MapPin, Briefcase, DollarSign, Trash2, ArrowRight, Loader2 } from 'lucide-react';

export default function SavedJobsPage() {
  const [savedJobs, setSavedJobs] = useState<Array<{id: string; jobId: string; job?: {id: string; title: string; location?: string; jobType: string; workMode: string; minSalary?: number; maxSalary?: number; skills: string[]; company?: {name: string}}}>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/candidate/saved-jobs').then(r => r.json()).then(d => {
      setSavedJobs(d.data || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  async function handleRemove(id: string) {
    await apiFetch(`/api/candidate/saved-jobs?id=${id}`, { method: 'DELETE' });
    setSavedJobs(prev => prev.filter(s => s.id !== id));
  }

  return (
    <div className="space-y-7">
      <div>
        <h1 className="text-[28px] font-extrabold text-ink tracking-[-0.035em]">Saved Jobs</h1>
        <p className="text-ink-muted text-[15px] mt-1.5">{savedJobs.length} saved jobs</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {[0, 1, 2, 3].map(i => (
            <div key={i} className="surface p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="skeleton w-11 h-11 rounded-[13px] shrink-0" />
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="skeleton skeleton-text w-2/3" />
                  <div className="skeleton skeleton-text w-1/3" />
                </div>
              </div>
              <div className="skeleton skeleton-text w-full mb-3" />
              <div className="skeleton skeleton-text w-1/2" />
            </div>
          ))}
        </div>
      ) : savedJobs.length === 0 ? (
        <div className="surface sheen text-center py-16">
          <div className="w-16 h-16 rounded-[20px] bg-canvas border border-line-soft flex items-center justify-center mx-auto mb-5">
            <Bookmark className="w-7 h-7 text-ink-faint" strokeWidth={1.8} />
          </div>
          <h3 className="text-[18px] font-bold text-ink tracking-[-0.025em] mb-2">No saved jobs</h3>
          <p className="text-ink-muted text-[14px] mb-5">Save jobs to review them later</p>
          <Link href="/jobs" className="group inline-flex items-center gap-2 text-brand-600 hover:text-brand-700 text-[14px] font-semibold">Browse Jobs <ArrowRight className="w-4 h-4 arrow-slide" /></Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {savedJobs.map(saved => (
            <div key={saved.id} className="surface sheen lift p-6 group flex flex-col">
              <div className="flex items-start justify-between gap-3 mb-5">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-11 h-11 rounded-[13px] grad-brand flex items-center justify-center text-white text-[13px] font-bold shrink-0 shadow-[0_3px_8px_rgba(15,76,129,0.20)]">
                    {saved.job?.company?.name?.[0] || 'J'}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-[15px] font-bold text-ink tracking-[-0.02em] truncate group-hover:text-brand-700 transition-colors duration-300">{saved.job?.title}</h3>
                    <p className="text-ink-muted text-[12.5px] truncate mt-0.5">{saved.job?.company?.name}</p>
                  </div>
                </div>
                <button onClick={() => handleRemove(saved.id)} className="shrink-0 text-ink-faint hover:text-critical hover:bg-critical-soft p-2 rounded-[10px] transition-all duration-200">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-2 text-[12.5px] text-ink-muted font-medium mb-4">
                {saved.job?.location && <span className="flex items-center gap-1.5 min-w-0"><MapPin className="w-3.5 h-3.5 text-ink-faint shrink-0" /><span className="truncate">{saved.job.location}</span></span>}
                <span className="flex items-center gap-1.5"><Briefcase className="w-3.5 h-3.5 text-ink-faint shrink-0" />{saved.job?.jobType}</span>
                {(saved.job?.minSalary || saved.job?.maxSalary) && (
                  <span className="flex items-center gap-1.5 font-bold text-positive">
                    <DollarSign className="w-3.5 h-3.5 shrink-0" />
                    {saved.job.minSalary ? `${(saved.job.minSalary/100000).toFixed(0)}L` : ''}
                    {saved.job.maxSalary ? `-${(saved.job.maxSalary/100000).toFixed(0)}L` : ''} PA
                  </span>
                )}
              </div>
              {saved.job?.skills && (
                <div className="flex flex-wrap gap-2 mb-5">
                  {saved.job.skills.slice(0,3).map(s => (
                    <span key={s} className="text-[11.5px] font-semibold bg-canvas border border-line-soft text-ink-soft rounded-full px-2.5 py-1">{s}</span>
                  ))}
                </div>
              )}
              <Link href={`/jobs/${saved.job?.id}`} className="mt-auto inline-flex items-center gap-1.5 text-brand-600 hover:text-brand-700 text-[13.5px] font-semibold transition-colors duration-200">
                View Job <ArrowRight className="w-3.5 h-3.5 arrow-slide" />
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
