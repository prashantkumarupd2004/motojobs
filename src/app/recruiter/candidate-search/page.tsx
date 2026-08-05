'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  Bookmark,
  BookmarkCheck,
  Briefcase,
  FileText,
  IndianRupee,
  Loader2,
  MapPin,
  Search,
  SlidersHorizontal,
  User,
} from 'lucide-react';
import { apiFetch } from '@/lib/http';
import { formatINR, INDIAN_STATES } from '@/lib/automotive';

interface Candidate {
  id: string;
  headline: string | null;
  location: string | null;
  currentCity: string | null;
  currentState: string | null;
  totalExperience: string | null;
  qualification: string | null;
  expectedSalary: number | null;
  isOpenToWork: boolean;
  resumeUrl: string | null;
  user: { id: string; name: string; email: string; profileImage: string | null };
  skills: Array<{ skill: { name: string } }>;
  resumes: Array<{ id: string; title: string; fileUrl: string | null }>;
}

export default function CandidateSearchPage() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const [search, setSearch] = useState('');
  const [skills, setSkills] = useState('');
  const [state, setState] = useState('');
  const [location, setLocation] = useState('');
  const [experience, setExperience] = useState('');

  const fetchCandidates = useCallback(async () => {
    setError('');
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (skills) params.set('skills', skills);
    if (location) params.set('location', location);
    if (state) params.set('state', state);
    if (experience) params.set('experience', experience);

    const res = await fetch(`/api/recruiter/candidates?${params}`);
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? 'Could not search candidates');
      setCandidates([]);
      return;
    }
    setCandidates(data.candidates ?? []);
  }, [search, skills, location, state, experience]);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      fetchCandidates(),
      fetch('/api/recruiter/saved-candidates')
        .then((r) => (r.ok ? r.json() : null))
        .then((d) => {
          if (cancelled || !d) return;
          setSavedIds(
            new Set((d.saved ?? []).map((s: { candidate: { id: string } }) => s.candidate.id))
          );
        })
        .catch(() => {}),
    ]).finally(() => {
      if (!cancelled) setLoading(false);
    });
    return () => {
      cancelled = true;
    };
    // Only on mount — subsequent runs go through the search form.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    fetchCandidates().finally(() => setLoading(false));
  }

  async function toggleSave(candidate: Candidate) {
    const id = candidate.id;
    const wasSaved = savedIds.has(id);
    setBusy(id);
    setSavedIds((prev) => {
      const next = new Set(prev);
      if (wasSaved) next.delete(id);
      else next.add(id);
      return next;
    });

    try {
      const res = wasSaved
        ? await apiFetch(`/api/recruiter/saved-candidates?candidateId=${id}`, {
            method: 'DELETE',
          })
        : await apiFetch('/api/recruiter/saved-candidates', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ candidateId: id }),
          });

      if (!res.ok) {
        // Put the row back the way it was.
        setSavedIds((prev) => {
          const next = new Set(prev);
          if (wasSaved) next.add(id);
          else next.delete(id);
          return next;
        });
      }
    } finally {
      setBusy(null);
    }
  }

  /** Records an intentional profile open, which the candidate's dashboard counts. */
  function recordView(candidateId: string) {
    void apiFetch('/api/recruiter/candidates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ candidateId }),
    }).catch(() => {});
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[26px] sm:text-[28px] font-extrabold text-ink tracking-[-0.035em]">
          Candidate Search
        </h1>
        <p className="text-ink-muted text-[14.5px] mt-1.5">
          Search automobile talent across India
        </p>
      </div>

      <form onSubmit={submit} className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-faint pointer-events-none" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or role…"
              className={`${INPUT} pl-11`}
            />
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setShowFilters((v) => !v)}
              className={`press flex flex-1 sm:flex-none items-center justify-center gap-2 px-5 py-2.5 rounded-[12px] text-[13.5px] font-semibold border transition-all duration-300 ${
                showFilters
                  ? 'grad-brand text-white border-transparent shadow-brand'
                  : 'bg-white border-line text-ink-muted hover:border-brand-200 hover:text-brand-700'
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" /> Filters
            </button>
            <button
              type="submit"
              className="sweep press flex flex-1 sm:flex-none items-center justify-center gap-2 grad-brand text-white font-semibold px-6 py-2.5 rounded-[12px] text-[13.5px] shadow-brand hover:-translate-y-0.5 transition-all duration-300"
            >
              <Search className="w-4 h-4" /> Search
            </button>
          </div>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 surface sheen p-5 animate-fade-in">
            <Labelled label="Skills" hint="Comma separated">
              <input
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                placeholder="Engine Diagnostics, DMS Software"
                className={INPUT}
              />
            </Labelled>

            <Labelled label="State">
              <select
                value={state}
                onChange={(e) => setState(e.target.value)}
                className={INPUT}
              >
                <option value="">Any state</option>
                {INDIAN_STATES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </Labelled>

            <Labelled label="City">
              <input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Pune"
                className={INPUT}
              />
            </Labelled>

            <Labelled label="Minimum experience">
              <select
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                className={INPUT}
              >
                <option value="">Any</option>
                <option value="0">Fresher</option>
                <option value="1">1+ years</option>
                <option value="3">3+ years</option>
                <option value="5">5+ years</option>
                <option value="10">10+ years</option>
              </select>
            </Labelled>
          </div>
        )}
      </form>

      {error && (
        <p
          role="alert"
          className="bg-critical-soft border border-critical/20 text-critical rounded-[12px] px-4 py-3 text-[13.5px] font-medium"
        >
          {error}
        </p>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-7 h-7 text-brand-600 animate-spin" />
        </div>
      ) : candidates.length === 0 ? (
        <div className="surface sheen text-center py-16 px-6">
          <div className="w-14 h-14 rounded-[18px] bg-canvas border border-line-soft flex items-center justify-center mx-auto mb-4">
            <User className="w-6 h-6 text-ink-faint" />
          </div>
          <h3 className="text-[16px] font-bold text-ink tracking-[-0.02em] mb-1.5">
            No candidates found
          </h3>
          <p className="text-ink-muted text-[14px]">Try broadening your search.</p>
        </div>
      ) : (
        <>
          <p className="text-[13px] text-ink-muted">
            {candidates.length} candidate{candidates.length === 1 ? '' : 's'} found
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {candidates.map((c) => {
              const saved = savedIds.has(c.id);
              const resume = c.resumes[0]?.fileUrl ?? c.resumeUrl;
              const skillNames = c.skills.map((s) => s.skill.name).slice(0, 4);

              return (
                <article key={c.id} className="surface sheen lift p-5 flex flex-col">
                  <div className="flex items-start gap-3.5 mb-4">
                    {c.user.profileImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={c.user.profileImage}
                        alt=""
                        className="w-11 h-11 rounded-[14px] object-cover border border-line shrink-0"
                      />
                    ) : (
                      <span className="w-11 h-11 rounded-[14px] grad-brand flex items-center justify-center text-white font-bold text-[15px] shrink-0">
                        {c.user.name[0]?.toUpperCase() ?? '?'}
                      </span>
                    )}
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 min-w-0">
                        <h3 className="text-[15px] font-bold text-ink tracking-[-0.02em] truncate">
                          {c.user.name}
                        </h3>
                        {c.isOpenToWork && (
                          <span className="shrink-0 text-[9.5px] font-bold uppercase tracking-[0.08em] bg-positive-soft text-[#0A7A54] border border-[#BEE7D8] rounded-full px-2 py-0.5">
                            Open
                          </span>
                        )}
                      </div>
                      <p className="text-[13px] text-ink-muted truncate mt-0.5">
                        {c.headline || 'Candidate'}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4 flex-1">
                    {(c.currentCity || c.location) && (
                      <Row icon={MapPin} text={c.currentCity || c.location || ''} />
                    )}
                    {c.totalExperience && <Row icon={Briefcase} text={c.totalExperience} />}
                    {c.expectedSalary != null && (
                      <Row
                        icon={IndianRupee}
                        text={`${formatINR(c.expectedSalary)} expected`}
                      />
                    )}
                  </div>

                  {skillNames.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {skillNames.map((s) => (
                        <span
                          key={s}
                          className="text-[11px] font-medium bg-canvas border border-line-soft text-ink-soft rounded-full px-2.5 py-1"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <button
                      disabled={busy === c.id}
                      onClick={() => toggleSave(c)}
                      className={`press flex-1 flex items-center justify-center gap-1.5 text-[12.5px] font-semibold py-2.5 rounded-[11px] border transition-all duration-300 disabled:opacity-50 ${
                        saved
                          ? 'bg-brand-50 border-brand-200 text-brand-700'
                          : 'bg-white border-line text-ink-muted hover:border-brand-200 hover:text-brand-700'
                      }`}
                    >
                      {saved ? (
                        <>
                          <BookmarkCheck className="w-3.5 h-3.5" /> Saved
                        </>
                      ) : (
                        <>
                          <Bookmark className="w-3.5 h-3.5" /> Save
                        </>
                      )}
                    </button>

                    {resume && (
                      <a
                        href={resume}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => recordView(c.id)}
                        className="press flex-1 flex items-center justify-center gap-1.5 bg-white border border-line text-ink-muted hover:border-brand-200 hover:text-brand-700 text-[12.5px] font-semibold py-2.5 rounded-[11px] transition-all duration-300"
                      >
                        <FileText className="w-3.5 h-3.5" /> Resume
                      </a>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

const INPUT =
  'w-full bg-white border border-line rounded-[12px] px-4 py-2.5 text-[13.5px] text-ink placeholder-ink-faint outline-none focus:border-brand-600 focus:shadow-[0_0_0_4px_rgba(15,76,129,0.10)] transition-all duration-300';

function Row({ icon: Icon, text }: { icon: typeof MapPin; text: string }) {
  return (
    <div className="flex items-center gap-2 text-[12.5px] text-ink-muted">
      <Icon className="w-3.5 h-3.5 shrink-0 text-ink-faint" />
      <span className="truncate">{text}</span>
    </div>
  );
}

function Labelled({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="block text-[13px] font-semibold text-ink-soft mb-2">{label}</span>
      {children}
      {hint && <span className="block text-[12px] text-ink-faint mt-1.5">{hint}</span>}
    </label>
  );
}
