'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, MapPin, Briefcase, IndianRupee, X, SlidersHorizontal, Loader2 } from 'lucide-react';
import type { Job } from '@/types';
import { JOB_CATEGORIES, JOB_TYPES, WORK_MODES, EXPERIENCE_LEVELS, salaryRangeLabel } from '@/lib/automotive';

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [location, setLocation] = useState('');
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedModes, setSelectedModes] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedExperience, setSelectedExperience] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchJobs();
  }, [page, selectedTypes, selectedModes, selectedCategories, selectedExperience]);

  async function fetchJobs() {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: '12',
        ...(search && { search }),
        ...(location && { location }),
        ...(selectedTypes.length && { jobType: selectedTypes.join(',') }),
        ...(selectedModes.length && { workMode: selectedModes.join(',') }),
        ...(selectedCategories.length && { category: selectedCategories.join(',') }),
        ...(selectedExperience.length && { experience: selectedExperience[0] }),
      });
      const res = await fetch(`/api/jobs?${params}`);
      const data = await res.json();
      setJobs(data.jobs || []);
      setTotal(data.total || 0);
    } catch {
      setJobs([]);
    } finally {
      setLoading(false);
    }
  }

  const toggleFilter = (arr: string[], setArr: (a: string[]) => void, val: string) => {
    setArr(arr.includes(val) ? arr.filter(v => v !== val) : [...arr, val]);
    setPage(1);
  };

  const clearAll = () => {
    setSelectedTypes([]);
    setSelectedModes([]);
    setSelectedCategories([]);
    setSelectedExperience([]);
    setPage(1);
  };

  const hasFilters =
    selectedTypes.length > 0 || selectedModes.length > 0 ||
    selectedCategories.length > 0 || selectedExperience.length > 0;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchJobs();
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Search Header */}
      <div className="bg-gradient-to-br from-brand-950 to-canvas border-b border-line py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-ink mb-2">Browse Automobile Jobs</h1>
          <p className="text-ink-muted mb-6">{total.toLocaleString()} openings across dealerships, workshops and OEMs</p>
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
            <div className="flex items-center gap-3 flex-1 bg-white border border-line rounded-[16px] px-4 py-3">
              <Search className="w-5 h-5 text-ink-muted shrink-0" />
              <input value={search} onChange={e => setSearch(e.target.value)} type="text" placeholder="Service Advisor, Technician, dealership name..." className="bg-transparent text-ink placeholder-ink-faint outline-none flex-1 text-sm" />
            </div>
            <div className="flex items-center gap-3 bg-white border border-line rounded-[16px] px-4 py-3 sm:w-64">
              <MapPin className="w-5 h-5 text-ink-muted shrink-0" />
              <input value={location} onChange={e => setLocation(e.target.value)} type="text" placeholder="City or state..." className="bg-transparent text-ink placeholder-ink-faint outline-none flex-1 text-sm" />
            </div>
            <button type="submit" className="bg-brand-600 hover:bg-brand-500 text-white px-6 py-3 rounded-[16px] font-medium transition-colors">
              Search
            </button>
            <button type="button" onClick={() => setShowFilters(!showFilters)} className={`flex items-center gap-2 border rounded-[16px] px-4 py-3 transition-colors text-sm ${showFilters ? 'bg-brand-50 border-brand-300 text-brand-700' : 'border-line text-ink-soft hover:border-line'}`}>
              <SlidersHorizontal className="w-4 h-4" /> Filters
            </button>
          </form>

          {/* Filters */}
          {showFilters && (
            <div className="mt-4 bg-white border border-line rounded-[16px] p-5 space-y-4">
              <div>
                <p className="text-sm font-medium text-ink-soft mb-3">Department</p>
                <div className="flex flex-wrap gap-2">
                  {JOB_CATEGORIES.map(c => (
                    <button key={c.id} type="button" onClick={() => toggleFilter(selectedCategories, setSelectedCategories, c.id)} className={`text-xs px-3 py-1.5 rounded-full border transition-all ${selectedCategories.includes(c.id) ? 'bg-brand-600 border-brand-300 text-white' : 'border-line text-ink-muted hover:border-brand-200'}`}>{c.label}</button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-ink-soft mb-3">Job Type</p>
                <div className="flex flex-wrap gap-2">
                  {JOB_TYPES.map(t => (
                    <button key={t} type="button" onClick={() => toggleFilter(selectedTypes, setSelectedTypes, t)} className={`text-xs px-3 py-1.5 rounded-full border transition-all ${selectedTypes.includes(t) ? 'bg-brand-600 border-brand-300 text-white' : 'border-line text-ink-muted hover:border-brand-200'}`}>{t}</button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-ink-soft mb-3">Work Mode</p>
                <div className="flex flex-wrap gap-2">
                  {WORK_MODES.map(m => (
                    <button key={m} type="button" onClick={() => toggleFilter(selectedModes, setSelectedModes, m)} className={`text-xs px-3 py-1.5 rounded-full border transition-all ${selectedModes.includes(m) ? 'bg-brand-600 border-brand-300 text-white' : 'border-line text-ink-muted hover:border-brand-200'}`}>{m}</button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-ink-soft mb-3">Experience</p>
                <div className="flex flex-wrap gap-2">
                  {EXPERIENCE_LEVELS.map(x => (
                    <button key={x} type="button" onClick={() => setSelectedExperience(selectedExperience[0] === x ? [] : [x])} className={`text-xs px-3 py-1.5 rounded-full border transition-all ${selectedExperience[0] === x ? 'bg-brand-600 border-brand-300 text-white' : 'border-line text-ink-muted hover:border-brand-200'}`}>{x}</button>
                  ))}
                </div>
              </div>
              {hasFilters && (
                <button type="button" onClick={clearAll} className="flex items-center gap-1 text-xs text-[#B32B2B] hover:text-[#B32B2B]">
                  <X className="w-3 h-3" /> Clear filters
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Job Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-brand-600 animate-spin" />
          </div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-20">
            <Briefcase className="w-16 h-16 text-ink-faint mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-ink mb-2">No jobs found</h3>
            <p className="text-ink-muted">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {jobs.map(job => (
              <Link key={job.id} href={`/jobs/${job.id}`} className="block bg-white border border-line rounded-[16px] p-5 hover:border-brand-100 hover:-translate-y-1 transition-all duration-200 group">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#1F5D95] to-[#0F4C81] flex items-center justify-center text-white text-xs font-bold shrink-0">
                      {job.company?.name?.[0] || job.title[0]}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-ink text-sm truncate group-hover:text-brand-700 transition-colors">{job.title}</h3>
                      <p className="text-ink-muted text-xs truncate">{job.company?.name || 'Company'}</p>
                    </div>
                  </div>
                  <span className="text-xs bg-positive-soft text-[#0A7A54] border border-[#BEE7D8] rounded-full px-2 py-1 shrink-0">{job.jobType}</span>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-xs text-ink-muted mb-4">
                  {job.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{job.location}</span>}
                  <span className="flex items-center gap-1"><Briefcase className="w-3 h-3" />{job.workMode}</span>
                  {(job.minSalary || job.maxSalary) && (
                    <span className="flex items-center gap-1 font-medium text-ink-soft">
                      <IndianRupee className="w-3 h-3" />{salaryRangeLabel(job.minSalary, job.maxSalary).replace('₹', '')}
                    </span>
                  )}
                </div>
                {job.skills.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {job.skills.slice(0, 4).map(skill => (
                      <span key={skill} className="text-xs bg-canvas text-ink-soft rounded-md px-2 py-0.5">{skill}</span>
                    ))}
                    {job.skills.length > 4 && <span className="text-xs text-ink-faint">+{job.skills.length - 4}</span>}
                  </div>
                )}
              </Link>
            ))}
          </div>
        )}

        {/* Pagination */}
        {total > 12 && (
          <div className="flex items-center justify-center gap-3 mt-10">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-4 py-2 border border-line text-ink-soft rounded-lg hover:border-brand-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-sm">
              Previous
            </button>
            <span className="text-ink-muted text-sm">Page {page} of {Math.ceil(total / 12)}</span>
            <button onClick={() => setPage(p => p + 1)} disabled={page >= Math.ceil(total / 12)} className="px-4 py-2 border border-line text-ink-soft rounded-lg hover:border-brand-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-sm">
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
