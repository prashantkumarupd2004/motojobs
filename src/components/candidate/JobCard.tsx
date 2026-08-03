'use client';

import Link from 'next/link';
import { Bookmark, Briefcase, Clock3, IndianRupee, MapPin } from 'lucide-react';
import { salaryRangeLabel } from '@/lib/automotive';

export interface JobCardJob {
  id: string;
  title: string;
  location?: string | null;
  jobType?: string | null;
  experience?: string | null;
  minSalary?: number | null;
  maxSalary?: number | null;
  createdAt: string;
  category?: string | null;
  company?: { name: string; logo?: string | null } | null;
  matchScore?: number;
  isSaved?: boolean;
}

function postedLabel(iso: string) {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
  if (days <= 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 30) return `${days} days ago`;
  return `${Math.floor(days / 30)} mo ago`;
}

/** Green above a strong match, amber for a partial one — never red, a weak match is still a job. */
function matchTone(score: number) {
  if (score >= 70) return 'bg-positive-soft text-positive border-positive/25';
  if (score >= 40) return 'bg-caution-soft text-caution border-caution/25';
  return 'bg-canvas text-ink-muted border-line';
}

export default function JobCard({
  job,
  onToggleSave,
}: {
  job: JobCardJob;
  onToggleSave?: (id: string) => void;
}) {
  const salary = salaryRangeLabel(job.minSalary ?? null, job.maxSalary ?? null);

  return (
    <article className="bg-white border border-line rounded-[16px] p-5 hover:border-brand-200 hover:shadow-e2 transition-all duration-200">
      <div className="flex items-start gap-3.5">
        {job.company?.logo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={job.company.logo}
            alt=""
            className="w-11 h-11 rounded-[12px] object-cover border border-line shrink-0"
          />
        ) : (
          <span className="w-11 h-11 rounded-[12px] bg-brand-50 border border-brand-100 flex items-center justify-center shrink-0 text-brand-700 font-bold text-[15px]">
            {(job.company?.name ?? 'J')[0].toUpperCase()}
          </span>
        )}

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <Link
                href={`/jobs/${job.id}`}
                className="block text-[15px] font-bold text-ink hover:text-brand-700 truncate transition-colors"
              >
                {job.title}
              </Link>
              <p className="text-[13px] text-ink-muted truncate mt-0.5">
                {job.company?.name ?? 'Confidential'}
              </p>
            </div>

            {typeof job.matchScore === 'number' && (
              <span
                className={`shrink-0 border rounded-full px-2.5 py-1 text-[11px] font-bold ${matchTone(job.matchScore)}`}
              >
                {job.matchScore}% match
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-3 text-[12.5px] text-ink-muted">
            {job.location && (
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 shrink-0" /> {job.location}
              </span>
            )}
            {salary && (
              <span className="inline-flex items-center gap-1.5">
                <IndianRupee className="w-3.5 h-3.5 shrink-0" /> {salary}
              </span>
            )}
            {job.experience && (
              <span className="inline-flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 shrink-0" /> {job.experience}
              </span>
            )}
            <span className="inline-flex items-center gap-1.5">
              <Clock3 className="w-3.5 h-3.5 shrink-0" /> {postedLabel(job.createdAt)}
            </span>
          </div>

          <div className="flex items-center gap-2.5 mt-4">
            <Link
              href={`/jobs/${job.id}`}
              className="inline-flex items-center justify-center grad-brand text-white font-semibold text-[13.5px] rounded-[11px] px-4 py-2.5 hover:shadow-e2 transition-shadow"
            >
              Apply now
            </Link>
            {onToggleSave && (
              <button
                type="button"
                onClick={() => onToggleSave(job.id)}
                aria-label={job.isSaved ? 'Unsave job' : 'Save job'}
                className={`inline-flex items-center gap-1.5 border rounded-[11px] px-3.5 py-2.5 text-[13.5px] font-semibold transition-colors ${
                  job.isSaved
                    ? 'border-brand-200 bg-brand-50 text-brand-700'
                    : 'border-line text-ink-muted hover:text-brand-700 hover:border-brand-200'
                }`}
              >
                <Bookmark
                  className="w-4 h-4"
                  fill={job.isSaved ? 'currentColor' : 'none'}
                />
                {job.isSaved ? 'Saved' : 'Save'}
              </button>
            )}
            {job.jobType && (
              <span className="ml-auto text-[11.5px] font-semibold text-ink-faint uppercase tracking-[0.06em]">
                {job.jobType}
              </span>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
