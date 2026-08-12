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

/** Green above a strong match, amber for partial, gray for weak — never red */
function matchTone(score: number) {
  if (score >= 70) return 'bg-[#ECFDF5] text-[#059669] border-[#A7F3D0]';
  if (score >= 40) return 'bg-[#FFFBEB] text-[#D97706] border-[#FDE68A]';
  return 'bg-[#F8FAFC] text-[#64748B] border-[#E2E8F0]';
}

export default function JobCard({
  job,
  onToggleSave,
}: {
  job: JobCardJob;
  onToggleSave?: (id: string) => void;
}) {
  const salary = salaryRangeLabel(job.minSalary ?? null, job.maxSalary ?? null);
  const companyInitial = (job.company?.name ?? 'J')[0].toUpperCase();

  return (
    <article className="bg-white border border-[#E5E7EB] rounded-[18px] p-5 hover:border-[#BFDBFE] hover:shadow-[0_8px_24px_rgba(15,23,42,0.09)] transition-all duration-250 group">
      {/* ── Top row: logo + title + match badge ─────────────────── */}
      <div className="flex items-start gap-3.5">
        {/* Company logo / fallback */}
        {job.company?.logo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={job.company.logo}
            alt={job.company.name}
            className="w-12 h-12 rounded-[12px] object-cover border border-[#E2E8F0] shrink-0 shadow-sm"
          />
        ) : (
          <span className="w-12 h-12 rounded-[12px] bg-[#EFF6FF] border border-[#BFDBFE] flex items-center justify-center shrink-0 text-[#1D4ED8] font-extrabold text-[16px] shadow-sm">
            {companyInitial}
          </span>
        )}

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              {/* Job title */}
              <Link
                href={`/jobs/${job.id}`}
                className="block text-[15.5px] font-bold text-[#0F172A] hover:text-[#1D4ED8] truncate transition-colors leading-snug"
              >
                {job.title}
              </Link>
              {/* Company name */}
              <p className="text-[13px] text-[#64748B] truncate mt-0.5">
                {job.company?.name ?? 'Confidential'}
              </p>
            </div>

            {/* Match badge */}
            {typeof job.matchScore === 'number' && (
              <span
                className={`shrink-0 border rounded-full px-2.5 py-1 text-[11px] font-bold whitespace-nowrap ${matchTone(job.matchScore)}`}
              >
                {job.matchScore}% match
              </span>
            )}
          </div>

          {/* ── Meta row ─────────────────────────────────────────── */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-3 text-[12.5px] text-[#64748B]">
            {job.location && (
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 shrink-0 text-[#94A3B8]" />
                {job.location}
              </span>
            )}
            {salary && (
              <span className="inline-flex items-center gap-1.5">
                <IndianRupee className="w-3.5 h-3.5 shrink-0 text-[#94A3B8]" />
                {salary}
              </span>
            )}
            {job.experience && (
              <span className="inline-flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 shrink-0 text-[#94A3B8]" />
                {job.experience}
              </span>
            )}
            <span className="inline-flex items-center gap-1.5">
              <Clock3 className="w-3.5 h-3.5 shrink-0 text-[#94A3B8]" />
              {postedLabel(job.createdAt)}
            </span>
          </div>

          {/* ── Action row ───────────────────────────────────────── */}
          <div className="flex items-center gap-2.5 mt-4">
            <Link
              href={`/jobs/${job.id}`}
              className="inline-flex items-center justify-center grad-brand text-white font-semibold text-[13.5px] rounded-[11px] px-5 py-2.5 hover:shadow-[0_4px_12px_rgba(29,78,216,0.30)] transition-all duration-200 sweep press"
            >
              Apply now
            </Link>
            {onToggleSave && (
              <button
                type="button"
                onClick={() => onToggleSave(job.id)}
                aria-label={job.isSaved ? 'Unsave job' : 'Save job'}
                className={`inline-flex items-center gap-1.5 border rounded-[11px] px-3.5 py-2.5 text-[13.5px] font-semibold transition-all duration-200 ${
                  job.isSaved
                    ? 'border-[#BFDBFE] bg-[#EFF6FF] text-[#1D4ED8]'
                    : 'border-[#E2E8F0] text-[#64748B] hover:text-[#1D4ED8] hover:border-[#BFDBFE] hover:bg-[#EFF6FF]'
                }`}
              >
                <Bookmark
                  className="w-4 h-4"
                  fill={job.isSaved ? 'currentColor' : 'none'}
                />
                {job.isSaved ? 'Saved' : 'Save'}
              </button>
            )}

            {/* Employment type badge — always shown when available */}
            {job.jobType && (
              <span className="ml-auto shrink-0 text-[10.5px] font-bold text-[#64748B] bg-[#F1F5F9] border border-[#E2E8F0] px-2.5 py-1 rounded-full uppercase tracking-[0.07em]">
                {job.jobType.replace(/_/g, ' ')}
              </span>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
