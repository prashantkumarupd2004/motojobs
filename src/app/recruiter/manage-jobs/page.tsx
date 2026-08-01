'use client';
import { apiFetch } from '@/lib/http';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Briefcase, MapPin, Users, Edit, Trash2, Eye, Plus, Loader2, ToggleLeft, ToggleRight, Search } from 'lucide-react';

interface Job {
  id: string;
  title: string;
  location: string;
  jobType: string;
  status: string;
  experienceLevel: string;
  minSalary?: number;
  maxSalary?: number;
  createdAt: string;
  deadline?: string;
  _count?: { applications: number };
}

export default function ManageJobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('ALL');

  useEffect(() => { fetchJobs(); }, []);

  async function fetchJobs() {
    try {
      const res = await apiFetch('/api/recruiter/jobs');
      if (res.ok) { const data = await res.json(); setJobs(data.data || []); }
    } finally { setLoading(false); }
  }

  async function toggleStatus(job: Job) {
    const newStatus = job.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE';
    await apiFetch('/api/recruiter/jobs', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: job.id, status: newStatus }),
    });
    setJobs(prev => prev.map(j => j.id === job.id ? { ...j, status: newStatus } : j));
  }

  async function deleteJob(id: string) {
    if (!confirm('Delete this job listing?')) return;
    await apiFetch(`/api/recruiter/jobs?id=${id}`, { method: 'DELETE' });
    setJobs(prev => prev.filter(j => j.id !== id));
  }

  const filtered = jobs.filter(j => {
    const matchSearch = !search || j.title.toLowerCase().includes(search.toLowerCase()) || j.location.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'ALL' || j.status === filter;
    return matchSearch && matchFilter;
  });

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 text-ignite-600 animate-spin" /></div>;

  return (
    <div className="space-y-7">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-[28px] font-extrabold text-ink tracking-[-0.035em]">Manage Jobs</h1>
          <p className="text-ink-muted text-[15px] mt-1.5">{jobs.length} job{jobs.length !== 1 ? 's' : ''} posted</p>
        </div>
        <Link href="/recruiter/post-job" className="sweep press inline-flex shrink-0 items-center justify-center gap-2 grad-ignite text-white font-semibold px-6 py-3 rounded-[14px] text-sm shadow-[0_4px_12px_rgba(255,107,0,0.22)] hover:shadow-[0_8px_22px_rgba(255,107,0,0.32)] hover:-translate-y-0.5 transition-all duration-300 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)]">
          <Plus className="w-4 h-4" /> Post New Job
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-faint pointer-events-none" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search jobs..." className="w-full bg-white border border-line rounded-[14px] pl-11 pr-4 py-3 text-sm text-ink placeholder-ink-faint shadow-[inset_0_1px_2px_rgba(16,24,40,0.04)] focus:border-brand-600 focus:shadow-[0_0_0_4px_rgba(15,76,129,0.10)] outline-none transition-all duration-300" />
        </div>
        <div className="flex gap-2 overflow-x-auto scroll-none">
          {['ALL', 'ACTIVE', 'PAUSED', 'CLOSED'].map(s => (
            <button key={s} onClick={() => setFilter(s)} className={`press shrink-0 px-4 py-3 rounded-[14px] text-[12.5px] font-bold uppercase tracking-[0.07em] transition-all duration-300 ${filter === s ? 'grad-ignite text-white shadow-[0_4px_12px_rgba(255,107,0,0.22)]' : 'bg-white border border-line text-ink-muted hover:border-brand-200 hover:bg-brand-50/60 hover:text-brand-700 shadow-[0_1px_2px_rgba(16,24,40,0.04)]'}`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="surface sheen text-center py-16 px-6">
          <div className="w-16 h-16 rounded-[20px] bg-canvas border border-line-soft flex items-center justify-center mx-auto mb-5">
            <Briefcase className="w-7 h-7 text-ink-faint" />
          </div>
          <h3 className="text-[17px] font-bold text-ink tracking-[-0.025em] mb-2">{jobs.length === 0 ? 'No jobs posted yet' : 'No results found'}</h3>
          <p className="text-ink-muted text-[14px]">
            {jobs.length === 0 ? 'Create your first job listing to start hiring' : 'Try adjusting your search or filter'}
          </p>
          {jobs.length === 0 && (
            <Link href="/recruiter/post-job" className="sweep press mt-6 inline-flex items-center gap-2 grad-ignite text-white font-semibold px-6 py-3 rounded-[14px] text-sm shadow-[0_4px_12px_rgba(255,107,0,0.22)] hover:shadow-[0_8px_22px_rgba(255,107,0,0.32)] hover:-translate-y-0.5 transition-all duration-300">
              <Plus className="w-4 h-4" /> Post First Job
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(job => (
            <div key={job.id} className="surface sheen lift p-6">
              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-5">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2.5 flex-wrap mb-2.5">
                    <h3 className="text-[17px] font-bold text-ink tracking-[-0.025em]">{job.title}</h3>
                    <span className={`text-[10.5px] font-bold uppercase tracking-[0.08em] border rounded-full px-2.5 py-1.5 ${job.status === 'ACTIVE' ? 'bg-positive-soft text-positive border-positive/20' : job.status === 'PAUSED' ? 'bg-caution-soft text-caution border-caution/20' : 'bg-canvas text-ink-muted border-line'}`}>
                      {job.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-x-5 gap-y-2 text-[13.5px] text-ink-muted flex-wrap">
                    <span className="flex items-center gap-1.5 min-w-0"><MapPin className="w-4 h-4 text-ink-faint shrink-0" /><span className="truncate">{job.location}</span></span>
                    <span className="flex items-center gap-1.5"><Briefcase className="w-4 h-4 text-ink-faint shrink-0" />{job.jobType.replace('_', ' ')}</span>
                    <span className="flex items-center gap-1.5"><Users className="w-4 h-4 text-ink-faint shrink-0" />{job._count?.applications || 0} applicants</span>
                    {job.minSalary && <span className="font-semibold text-ink-soft">₹{job.minSalary / 100000}–{job.maxSalary ? job.maxSalary / 100000 : '?'}L</span>}
                  </div>
                  <p className="text-[12.5px] text-ink-faint mt-3">Posted {new Date(job.createdAt).toLocaleDateString()}{job.deadline && ` · Deadline: ${new Date(job.deadline).toLocaleDateString()}`}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button onClick={() => toggleStatus(job)} className={`press flex items-center gap-1.5 px-3.5 py-2.5 rounded-[13px] text-[13px] font-semibold transition-all duration-300 border shadow-[0_1px_2px_rgba(16,24,40,0.04)] ${job.status === 'ACTIVE' ? 'bg-positive-soft border-positive/25 text-positive hover:border-positive/45' : 'bg-white border-line text-ink-muted hover:text-brand-700 hover:border-brand-200 hover:bg-brand-50/60'}`}>
                    {job.status === 'ACTIVE' ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                    <span className="hidden sm:block">{job.status === 'ACTIVE' ? 'Pause' : 'Activate'}</span>
                  </button>
                  <Link href={`/jobs/${job.id}`} className="press p-2.5 bg-white text-ink-muted hover:text-brand-700 border border-line hover:border-brand-200 hover:bg-brand-50/60 rounded-[13px] shadow-[0_1px_2px_rgba(16,24,40,0.04)] transition-all duration-300">
                    <Eye className="w-4 h-4" />
                  </Link>
                  <button onClick={() => deleteJob(job.id)} className="press p-2.5 bg-white text-ink-muted hover:text-critical border border-line hover:border-critical/30 hover:bg-critical-soft rounded-[13px] shadow-[0_1px_2px_rgba(16,24,40,0.04)] transition-all duration-300">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
