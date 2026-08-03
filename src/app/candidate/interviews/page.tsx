'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, CalendarCheck, MapPin } from 'lucide-react';

interface Interview {
  id: string;
  status: string;
  stage: string | null;
  appliedAt: string;
  updatedAt: string;
  job?: {
    id: string;
    title: string;
    location?: string | null;
    company?: { name: string; logo?: string | null } | null;
  } | null;
}

const TONE: Record<string, string> = {
  SHORTLISTED: 'bg-ignite-50 text-ignite-700 border-ignite-200',
  INTERVIEW: 'bg-brand-50 text-brand-700 border-brand-200',
};

const LABEL: Record<string, string> = {
  SHORTLISTED: 'Shortlisted',
  INTERVIEW: 'Interview Scheduled',
};

export default function CandidateInterviewsPage() {
  const [items, setItems] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/candidate/applications?status=INTERVIEW,SHORTLISTED&limit=50')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!cancelled && data?.applications) setItems(data.applications);
      })
      .catch(() => {})
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="max-w-[900px] space-y-6">
      <header>
        <h1 className="text-[24px] font-extrabold text-ink tracking-[-0.03em]">Interviews</h1>
        <p className="text-[14px] text-ink-muted mt-1">
          Applications where an employer has moved you forward.
        </p>
      </header>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white border border-line rounded-[16px] h-[92px] skeleton" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="bg-white border border-line rounded-[16px] text-center px-5 py-16">
          <span className="w-12 h-12 rounded-[14px] bg-canvas border border-line-soft flex items-center justify-center mx-auto mb-3.5">
            <CalendarCheck className="w-5 h-5 text-ink-faint" strokeWidth={1.9} />
          </span>
          <p className="text-[15px] font-bold text-ink">No interviews yet</p>
          <p className="text-[13px] text-ink-muted mt-1 max-w-sm mx-auto leading-[1.6]">
            When an employer shortlists you or schedules an interview, it will show up here.
          </p>
          <Link
            href="/jobs"
            className="inline-flex items-center gap-1.5 text-brand-600 hover:text-brand-700 text-[13.5px] font-semibold mt-4"
          >
            Find jobs to apply <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      ) : (
        <ul className="space-y-3">
          {items.map((it) => (
            <li
              key={it.id}
              className="bg-white border border-line rounded-[16px] p-5 flex items-start gap-3.5 hover:border-brand-200 transition-colors"
            >
              {it.job?.company?.logo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={it.job.company.logo}
                  alt=""
                  className="w-11 h-11 rounded-[12px] object-cover border border-line shrink-0"
                />
              ) : (
                <span className="w-11 h-11 rounded-[12px] bg-brand-50 border border-brand-100 flex items-center justify-center shrink-0 text-brand-700 font-bold text-[15px]">
                  {(it.job?.company?.name ?? 'J')[0].toUpperCase()}
                </span>
              )}

              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <Link
                      href={it.job ? `/jobs/${it.job.id}` : '#'}
                      className="block text-[15px] font-bold text-ink hover:text-brand-700 truncate"
                    >
                      {it.job?.title ?? 'Job removed'}
                    </Link>
                    <p className="text-[13px] text-ink-muted truncate mt-0.5">
                      {it.job?.company?.name ?? '—'}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 border rounded-full px-2.5 py-1 text-[10.5px] font-bold uppercase tracking-[0.05em] ${
                      TONE[it.status] ?? 'bg-canvas text-ink-muted border-line'
                    }`}
                  >
                    {LABEL[it.status] ?? it.status}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-2.5 text-[12.5px] text-ink-muted">
                  {it.job?.location && (
                    <span className="inline-flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 shrink-0" /> {it.job.location}
                    </span>
                  )}
                  <span>
                    Applied{' '}
                    {new Date(it.appliedAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                  {it.stage && <span>Stage: {it.stage}</span>}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
