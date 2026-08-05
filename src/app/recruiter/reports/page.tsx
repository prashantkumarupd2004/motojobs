'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { BarChart3, Eye, Loader2 } from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

interface Report {
  jobs: { total: number; active: number; pending: number; draft: number; closed: number };
  applications: {
    total: number;
    APPLIED: number;
    SCREENING: number;
    SHORTLISTED: number;
    INTERVIEW: number;
    OFFERED: number;
    HIRED: number;
    REJECTED: number;
  };
  byCity: Array<{ label: string; value: number }>;
  byExperience: Array<{ label: string; value: number }>;
  mostViewed: Array<{
    id: string;
    title: string;
    views: number;
    status: string;
    _count: { applications: number };
  }>;
}

const AXIS = { fontSize: 12, fill: '#64748B' };

export default function ReportsPage() {
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/recruiter/reports')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!cancelled && data) setReport(data);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-7 h-7 text-brand-600 animate-spin" />
      </div>
    );
  }

  if (!report) {
    return (
      <div className="surface sheen text-center py-16 px-6">
        <p className="text-ink-muted text-[14px]">Reports could not be loaded.</p>
      </div>
    );
  }

  const jobTiles = [
    { label: 'Total jobs posted', value: report.jobs.total },
    { label: 'Active jobs', value: report.jobs.active },
    { label: 'Awaiting review', value: report.jobs.pending },
    { label: 'Closed jobs', value: report.jobs.closed },
  ];

  const pipeline = [
    { label: 'Applications', value: report.applications.total },
    { label: 'Shortlisted', value: report.applications.SHORTLISTED },
    { label: 'Interviewing', value: report.applications.INTERVIEW },
    { label: 'Selected', value: report.applications.HIRED },
    { label: 'Rejected', value: report.applications.REJECTED },
  ];

  return (
    <div className="space-y-7">
      <div>
        <h1 className="text-[26px] sm:text-[28px] font-extrabold text-ink tracking-[-0.035em]">
          Reports &amp; Analytics
        </h1>
        <p className="text-ink-muted text-[14.5px] mt-1.5">
          How your roles and applicants are performing
        </p>
      </div>

      <section>
        <h2 className="text-[15px] font-bold text-ink tracking-[-0.02em] mb-3.5">Jobs</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {jobTiles.map((t) => (
            <Tile key={t.label} {...t} />
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-[15px] font-bold text-ink tracking-[-0.02em] mb-3.5">
          Candidate pipeline
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {pipeline.map((t) => (
            <Tile key={t.label} {...t} />
          ))}
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
        <Chart
          title="Applications by city"
          data={report.byCity}
          empty="No applications to break down yet."
        />
        <Chart
          title="Applications by experience"
          data={report.byExperience}
          empty="No applications to break down yet."
        />
      </div>

      <section className="surface sheen overflow-hidden">
        <div className="px-5 sm:px-6 py-5 border-b border-line-soft">
          <h2 className="text-[16px] font-bold text-ink tracking-[-0.025em]">
            Most viewed jobs
          </h2>
        </div>

        {report.mostViewed.length === 0 ? (
          <div className="text-center py-14 px-6">
            <div className="w-14 h-14 rounded-[18px] bg-canvas border border-line-soft flex items-center justify-center mx-auto mb-4">
              <BarChart3 className="w-6 h-6 text-ink-faint" />
            </div>
            <p className="text-ink-muted text-[14px]">No jobs posted yet.</p>
          </div>
        ) : (
          <ul className="divide-y divide-line-soft">
            {report.mostViewed.map((job) => (
              <li key={job.id}>
                <Link
                  href={`/recruiter/applications?jobId=${job.id}`}
                  className="flex items-center justify-between gap-4 px-5 sm:px-6 py-4 hover:bg-canvas transition-colors"
                >
                  <div className="min-w-0">
                    <p className="text-[14px] font-semibold text-ink truncate">{job.title}</p>
                    <p className="text-[12.5px] text-ink-muted mt-0.5">
                      {job._count.applications} applicant
                      {job._count.applications === 1 ? '' : 's'}
                    </p>
                  </div>
                  <span className="shrink-0 inline-flex items-center gap-1.5 text-[13px] font-semibold text-ink-soft">
                    <Eye className="w-3.5 h-3.5 text-ink-faint" />
                    {job.views}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function Tile({ label, value }: { label: string; value: number }) {
  return (
    <div className="surface sheen p-5">
      <div className="text-[26px] font-extrabold text-ink tracking-[-0.035em] leading-none">
        {value}
      </div>
      <div className="text-[11.5px] font-semibold text-ink-faint uppercase tracking-[0.09em] mt-2.5">
        {label}
      </div>
    </div>
  );
}

function Chart({
  title,
  data,
  empty,
}: {
  title: string;
  data: Array<{ label: string; value: number }>;
  empty: string;
}) {
  return (
    <section className="surface sheen p-5 sm:p-6">
      <h2 className="text-[16px] font-bold text-ink tracking-[-0.025em] mb-5">{title}</h2>

      {data.length === 0 ? (
        <p className="text-ink-muted text-[13.5px] py-10 text-center">{empty}</p>
      ) : (
        <div className="h-[260px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 4, right: 8, bottom: 4, left: -18 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
              <XAxis
                dataKey="label"
                tick={AXIS}
                tickLine={false}
                axisLine={{ stroke: '#E2E8F0' }}
                interval={0}
                angle={-28}
                textAnchor="end"
                height={64}
              />
              <YAxis tick={AXIS} tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip
                cursor={{ fill: 'rgba(15,76,129,0.06)' }}
                contentStyle={{
                  borderRadius: 12,
                  border: '1px solid #E2E8F0',
                  fontSize: 13,
                  boxShadow: '0 8px 24px rgba(15,23,42,0.08)',
                }}
              />
              <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={44}>
                {data.map((entry) => (
                  <Cell key={entry.label} fill="#0F4C81" />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  );
}
