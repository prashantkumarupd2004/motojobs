'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Bookmark,
  BookmarkX,
  Briefcase,
  FileText,
  IndianRupee,
  Loader2,
  MapPin,
  Search,
} from 'lucide-react';
import { apiFetch } from '@/lib/http';
import { formatINR } from '@/lib/automotive';

interface SavedCandidate {
  id: string;
  notes: string | null;
  savedAt: string;
  candidate: {
    id: string;
    headline: string | null;
    currentCity: string | null;
    totalExperience: string | null;
    expectedSalary: number | null;
    resumeUrl: string | null;
    user: { id: string; name: string; email: string; profileImage: string | null };
    skills: Array<{ skill: { name: string } }>;
    resumes: Array<{ id: string; title: string; fileUrl: string | null }>;
  };
}

export default function SavedCandidatesPage() {
  const [saved, setSaved] = useState<SavedCandidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/recruiter/saved-candidates')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (cancelled || !data) return;
        setSaved(data.saved ?? []);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function remove(candidateId: string) {
    setBusy(candidateId);
    const previous = saved;
    setSaved((list) => list.filter((s) => s.candidate.id !== candidateId));
    try {
      const res = await apiFetch(
        `/api/recruiter/saved-candidates?candidateId=${candidateId}`,
        { method: 'DELETE' }
      );
      if (!res.ok) setSaved(previous);
    } catch {
      setSaved(previous);
    } finally {
      setBusy(null);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-7 h-7 text-brand-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-[26px] sm:text-[28px] font-extrabold text-ink tracking-[-0.035em]">
            Saved Candidates
          </h1>
          <p className="text-ink-muted text-[14.5px] mt-1.5">
            {saved.length} candidate{saved.length === 1 ? '' : 's'} on your shortlist
          </p>
        </div>
        <Link
          href="/recruiter/candidate-search"
          className="press inline-flex shrink-0 items-center justify-center gap-2 bg-white border border-line text-ink font-semibold px-5 py-2.5 rounded-[12px] text-[13.5px] hover:border-brand-200 hover:text-brand-700 transition-all"
        >
          <Search className="w-4 h-4" /> Find more candidates
        </Link>
      </div>

      {saved.length === 0 ? (
        <div className="surface sheen text-center py-16 px-6">
          <div className="w-14 h-14 rounded-[18px] bg-canvas border border-line-soft flex items-center justify-center mx-auto mb-4">
            <Bookmark className="w-6 h-6 text-ink-faint" />
          </div>
          <h3 className="text-[16px] font-bold text-ink tracking-[-0.02em] mb-1.5">
            No saved candidates yet
          </h3>
          <p className="text-ink-muted text-[14px]">
            Save a profile from candidate search to keep it here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {saved.map((entry) => {
            const c = entry.candidate;
            const resume = c.resumes[0]?.fileUrl ?? c.resumeUrl;
            const skills = c.skills.map((s) => s.skill.name).slice(0, 5);

            return (
              <article key={entry.id} className="surface sheen p-5 sm:p-6">
                <div className="flex items-start gap-4">
                  {c.user.profileImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={c.user.profileImage}
                      alt=""
                      className="w-12 h-12 rounded-[14px] object-cover border border-line shrink-0"
                    />
                  ) : (
                    <span className="w-12 h-12 rounded-[14px] grad-brand flex items-center justify-center text-white text-[15px] font-bold shrink-0">
                      {c.user.name[0]?.toUpperCase()}
                    </span>
                  )}

                  <div className="flex-1 min-w-0">
                    <h3 className="text-[15.5px] font-bold text-ink tracking-[-0.02em] truncate">
                      {c.user.name}
                    </h3>
                    {c.headline && (
                      <p className="text-[13px] text-ink-muted truncate mt-0.5">
                        {c.headline}
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[12.5px] text-ink-muted mt-2.5">
                      {c.totalExperience && (
                        <span className="inline-flex items-center gap-1.5">
                          <Briefcase className="w-3.5 h-3.5 text-ink-faint" />
                          {c.totalExperience}
                        </span>
                      )}
                      {c.currentCity && (
                        <span className="inline-flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-ink-faint" />
                          {c.currentCity}
                        </span>
                      )}
                      {c.expectedSalary != null && (
                        <span className="inline-flex items-center gap-1.5">
                          <IndianRupee className="w-3.5 h-3.5 text-ink-faint" />
                          {formatINR(c.expectedSalary)}
                        </span>
                      )}
                    </div>

                    {skills.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {skills.map((s) => (
                          <span
                            key={s}
                            className="text-[11.5px] font-medium bg-canvas border border-line-soft text-ink-soft rounded-full px-2.5 py-1"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    )}

                    {entry.notes && (
                      <p className="text-[12.5px] text-ink-muted bg-canvas border border-line-soft rounded-[10px] px-3 py-2 mt-3">
                        {entry.notes}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 mt-5 pt-5 border-t border-line-soft">
                  {resume && (
                    <a
                      href={resume}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="press inline-flex items-center gap-1.5 bg-white border border-line text-ink-soft hover:text-brand-700 hover:border-brand-200 rounded-[11px] px-3.5 py-2 text-[13px] font-semibold transition-all"
                    >
                      <FileText className="w-3.5 h-3.5" /> Resume
                    </a>
                  )}
                  <button
                    disabled={busy === c.id}
                    onClick={() => remove(c.id)}
                    className="press inline-flex items-center gap-1.5 bg-white border border-line text-ink-soft hover:text-[#B32B2B] hover:border-[#F3C9C9] hover:bg-critical-soft rounded-[11px] px-3.5 py-2 text-[13px] font-semibold transition-all disabled:opacity-50"
                  >
                    <BookmarkX className="w-3.5 h-3.5" /> Remove
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
