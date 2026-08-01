'use client';
import { useState, useEffect } from 'react';
import { Search, MapPin, Briefcase, Filter, User, Star, MessageSquare, Loader2, SlidersHorizontal } from 'lucide-react';

interface Candidate {
  id: string;
  headline?: string;
  location?: string;
  experience?: number;
  expectedSalary?: number;
  isOpenToWork?: boolean;
  profileScore?: number;
  user?: { name: string; email: string };
}

export default function CandidateSearchPage() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [expFilter, setExpFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => { fetchCandidates(); }, []);

  async function fetchCandidates() {
    try {
      const params = new URLSearchParams();
      if (search) params.set('q', search);
      if (locationFilter) params.set('location', locationFilter);
      if (expFilter) params.set('experience', expFilter);
      const res = await fetch(`/api/recruiter/candidates?${params}`);
      if (res.ok) { const data = await res.json(); setCandidates(data.data || []); }
    } finally { setLoading(false); }
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    fetchCandidates();
  }

  return (
    <div className="space-y-7">
      <div>
        <h1 className="text-[28px] font-extrabold text-ink tracking-[-0.035em]">Find Candidates</h1>
        <p className="text-ink-muted text-[15px] mt-1.5">Search our talent database of {candidates.length}+ candidates</p>
      </div>

      {/* Search & Filters */}
      <form onSubmit={handleSearch} className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-faint pointer-events-none" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by skills, role, or keyword..."
              className="w-full bg-white border border-line rounded-[14px] pl-11 pr-4 py-3 text-sm text-ink placeholder-ink-faint shadow-[inset_0_1px_2px_rgba(16,24,40,0.04)] focus:border-brand-600 focus:shadow-[0_0_0_4px_rgba(15,76,129,0.10)] outline-none transition-all duration-300"
            />
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className={`press flex flex-1 sm:flex-none items-center justify-center gap-2 px-5 py-3 rounded-[14px] text-sm font-semibold transition-all duration-300 ${showFilters ? 'grad-ignite text-white shadow-[0_4px_12px_rgba(255,107,0,0.22)]' : 'bg-white border border-line text-ink-muted hover:border-brand-200 hover:bg-brand-50/60 hover:text-brand-700 shadow-[0_1px_2px_rgba(16,24,40,0.04)]'}`}
            >
              <SlidersHorizontal className="w-4 h-4" /> Filters
            </button>
            <button type="submit" className="sweep press flex flex-1 sm:flex-none items-center justify-center gap-2 grad-brand text-white font-semibold px-6 py-3 rounded-[14px] text-sm shadow-[0_4px_12px_rgba(15,76,129,0.20)] hover:shadow-[0_8px_22px_rgba(15,76,129,0.30)] hover:-translate-y-0.5 transition-all duration-300 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)]">
              <Search className="w-4 h-4" /> Search
            </button>
          </div>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 surface sheen p-6 animate-fade-in">
            <div>
              <label className="block text-[13px] font-semibold text-ink-soft mb-2">Location</label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-faint pointer-events-none" />
                <input value={locationFilter} onChange={e => setLocationFilter(e.target.value)} placeholder="City, Country" className="w-full bg-white border border-line rounded-[14px] pl-11 pr-4 py-3 text-sm text-ink placeholder-ink-faint shadow-[inset_0_1px_2px_rgba(16,24,40,0.04)] focus:border-brand-600 focus:shadow-[0_0_0_4px_rgba(15,76,129,0.10)] outline-none transition-all duration-300" />
              </div>
            </div>
            <div>
              <label className="block text-[13px] font-semibold text-ink-soft mb-2">Min Experience (years)</label>
              <select value={expFilter} onChange={e => setExpFilter(e.target.value)} className="w-full bg-white border border-line rounded-[14px] px-4 py-3 text-sm text-ink shadow-[inset_0_1px_2px_rgba(16,24,40,0.04)] focus:border-brand-600 focus:shadow-[0_0_0_4px_rgba(15,76,129,0.10)] outline-none transition-all duration-300">
                <option value="">Any</option>
                <option value="0">Fresher (0)</option>
                <option value="1">1+ years</option>
                <option value="3">3+ years</option>
                <option value="5">5+ years</option>
                <option value="10">10+ years</option>
              </select>
            </div>
          </div>
        )}
      </form>

      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 text-ignite-600 animate-spin" /></div>
      ) : candidates.length === 0 ? (
        <div className="surface sheen text-center py-16 px-6">
          <div className="w-16 h-16 rounded-[20px] bg-canvas border border-line-soft flex items-center justify-center mx-auto mb-5">
            <User className="w-7 h-7 text-ink-faint" />
          </div>
          <h3 className="text-[17px] font-bold text-ink tracking-[-0.025em] mb-2">No candidates found</h3>
          <p className="text-ink-muted text-[14px]">Try broadening your search criteria</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {candidates.map(candidate => (
            <div key={candidate.id} className="surface sheen lift p-6 group">
              <div className="flex items-start gap-3.5 mb-5">
                <div className="relative w-11 h-11 rounded-[15px] grad-brand flex items-center justify-center text-white font-bold text-[15px] shrink-0 shadow-[0_4px_10px_rgba(16,24,40,0.14)]">
                  {candidate.user?.name?.[0] || '?'}
                  <span className="absolute inset-x-2.5 top-px h-px bg-white/40 rounded-full" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 min-w-0">
                    <h3 className="text-[15.5px] font-bold text-ink tracking-[-0.02em] truncate">{candidate.user?.name || 'Anonymous'}</h3>
                    {candidate.isOpenToWork && (
                      <span className="shrink-0 text-[9.5px] font-bold uppercase tracking-[0.08em] bg-positive-soft text-positive border border-positive/20 rounded-full px-2 py-1">Open</span>
                    )}
                  </div>
                  <p className="text-[13.5px] text-ink-muted truncate mt-1">{candidate.headline || 'Candidate'}</p>
                </div>
              </div>

              <div className="space-y-2.5 mb-5">
                {candidate.location && (
                  <div className="flex items-center gap-2 text-[13px] text-ink-muted">
                    <MapPin className="w-3.5 h-3.5 shrink-0 text-ink-faint" />
                    <span className="truncate">{candidate.location}</span>
                  </div>
                )}
                {candidate.experience !== undefined && (
                  <div className="flex items-center gap-2 text-[13px] text-ink-muted">
                    <Briefcase className="w-3.5 h-3.5 shrink-0 text-ink-faint" />
                    <span>{candidate.experience} year{candidate.experience !== 1 ? 's' : ''} experience</span>
                  </div>
                )}
                {candidate.expectedSalary && (
                  <div className="flex items-center gap-2 text-[13px] text-ink-muted">
                    <span className="text-ink-faint">Expected:</span>
                    <span className="font-semibold text-ink-soft">₹{candidate.expectedSalary / 100000}L</span>
                  </div>
                )}
              </div>

              {candidate.profileScore !== undefined && (
                <div className="mb-5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11.5px] font-semibold text-ink-faint uppercase tracking-[0.09em]">Profile Score</span>
                    <span className="text-[13px] text-ignite-600 font-bold">{candidate.profileScore}%</span>
                  </div>
                  <div className="h-2 bg-line-soft rounded-full overflow-hidden">
                    <div className="h-full grad-ignite rounded-full transition-all duration-700" style={{ width: `${candidate.profileScore}%` }} />
                  </div>
                </div>
              )}

              <div className="flex gap-2.5">
                <button className="press flex-1 flex items-center justify-center gap-1.5 bg-ignite-50 hover:bg-ignite-100 border border-ignite-100 hover:border-ignite-200 text-ignite-700 text-[13px] font-semibold py-2.5 rounded-[13px] transition-all duration-300">
                  <Star className="w-3.5 h-3.5" /> Shortlist
                </button>
                <button className="press flex-1 flex items-center justify-center gap-1.5 bg-white border border-line hover:border-brand-200 hover:bg-brand-50/60 text-ink-muted hover:text-brand-700 text-[13px] font-semibold py-2.5 rounded-[13px] transition-all duration-300">
                  <MessageSquare className="w-3.5 h-3.5" /> Message
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
