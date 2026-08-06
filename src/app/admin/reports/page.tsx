'use client';

import { useEffect, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { BarChart3, Download, Loader2 } from 'lucide-react';
import { EmptyState, PageHeader, Panel, Select, StatCard } from '@/components/admin/ui';

interface Point {
  label: string;
  value: number;
}

interface Report {
  totals: {
    candidates: number;
    employers: number;
    jobs: number;
    applications: number;
    interviews: number;
    hires: number;
    hiringRate: number;
  };
  series: {
    candidates: Point[];
    employers: Point[];
    jobs: Point[];
    applications: Point[];
    interviews: Point[];
  };
  topCompanies: Array<{
    id: string;
    name: string;
    city: string | null;
    jobs: number;
    applications: number;
    hires: number;
  }>;
  topCities: Point[];
  topCategories: Point[];
}

const AXIS = { fontSize: 12, fill: '#64748B' };

const TOOLTIP = {
  borderRadius: 12,
  border: '1px solid #E2E8F0',
  fontSize: 13,
  boxShadow: '0 8px 24px rgba(15,23,42,0.08)',
};

export default function AdminReportsPage() {
  const [months, setMonths] = useState('6');
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch(`/api/admin/reports?months=${months}`)
      .then(async (res) => {
        const data = await res.json();
        if (cancelled) return;
        if (!res.ok) {
          setError(data.error ?? 'Could not load reports');
          return;
        }
        setReport(data);
        setError('');
      })
      .catch(() => !cancelled && setError('Could not load reports'))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [months]);

  if (loading && !report) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-7 h-7 text-brand-600 animate-spin" />
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="bg-critical-soft border border-critical/20 text-critical rounded-[14px] px-4 py-3 text-[13.5px] font-medium">
        {error || 'Could not load reports'}
      </div>
    );
  }

  const { totals } = report;

  // Recharts wants one row per x-value with a key per series.
  const growth = report.series.candidates.map((point, i) => ({
    label: point.label,
    'Job seekers': point.value,
    Employers: report.series.employers[i]?.value ?? 0,
  }));

  const activity = report.series.jobs.map((point, i) => ({
    label: point.label,
    Jobs: point.value,
    Applications: report.series.applications[i]?.value ?? 0,
    Interviews: report.series.interviews[i]?.value ?? 0,
  }));

  return (
    <div className="space-y-5">
      <PageHeader
        title="Reports & Analytics"
        subtitle="Growth and hiring performance across the platform"
        action={
          <div className="flex items-center gap-2">
            <Select
              value={months}
              onChange={setMonths}
              aria-label="Reporting period"
              options={[
                { value: '3', label: 'Last 3 months' },
                { value: '6', label: 'Last 6 months' },
                { value: '12', label: 'Last 12 months' },
              ]}
            />
            <a
              href="/api/admin/reports?export=csv"
              className="press inline-flex items-center gap-2 bg-white border border-line text-ink font-semibold px-4 py-2.5 rounded-[12px] text-[13.5px] hover:border-brand-200 hover:text-brand-700 transition-all"
            >
              <Download className="w-4 h-4" /> Export
            </a>
          </div>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Job seekers" value={totals.candidates} />
        <StatCard label="Employers" value={totals.employers} />
        <StatCard label="Jobs posted" value={totals.jobs} />
        <StatCard label="Applications" value={totals.applications} />
        <StatCard label="Interviews" value={totals.interviews} />
        <StatCard label="Hires" value={totals.hires} tone="positive" />
        <StatCard label="Hiring rate" value={`${totals.hiringRate}%`} tone="positive" />
        <StatCard
          label="Apps per job"
          value={totals.jobs > 0 ? (totals.applications / totals.jobs).toFixed(1) : '0'}
        />
      </div>

      <Panel title="User growth">
        <div className="p-5 h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={growth} margin={{ top: 4, right: 8, bottom: 4, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
              <XAxis dataKey="label" tick={AXIS} tickLine={false} axisLine={{ stroke: '#E2E8F0' }} />
              <YAxis tick={AXIS} tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip contentStyle={TOOLTIP} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Line
                type="monotone"
                dataKey="Job seekers"
                stroke="#0F4C81"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="Employers"
                stroke="#0A7A54"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Panel>

      <Panel title="Hiring activity">
        <div className="p-5 h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={activity} margin={{ top: 4, right: 8, bottom: 4, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
              <XAxis dataKey="label" tick={AXIS} tickLine={false} axisLine={{ stroke: '#E2E8F0' }} />
              <YAxis tick={AXIS} tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip cursor={{ fill: 'rgba(15,76,129,0.06)' }} contentStyle={TOOLTIP} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="Jobs" fill="#0F4C81" radius={[5, 5, 0, 0]} maxBarSize={28} />
              <Bar dataKey="Applications" fill="#4E8CBE" radius={[5, 5, 0, 0]} maxBarSize={28} />
              <Bar dataKey="Interviews" fill="#0A7A54" radius={[5, 5, 0, 0]} maxBarSize={28} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Panel>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <RankChart title="Top cities by applicants" data={report.topCities} />
        <RankChart title="Top job categories" data={report.topCategories} />
      </div>

      <Panel title="Top hiring companies">
        {report.topCompanies.length === 0 ? (
          <div className="py-14 px-6">
            <EmptyState
              icon={BarChart3}
              title="No hiring data yet"
              body="Companies appear here once they post jobs and receive applications."
            />
          </div>
        ) : (
          <div className="overflow-x-auto scroll-slim">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-line bg-canvas">
                  {['Company', 'City', 'Jobs', 'Applications', 'Hires'].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-[11.5px] font-bold uppercase tracking-[0.08em] text-ink-faint whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-line-soft">
                {report.topCompanies.map((c) => (
                  <tr key={c.id} className="hover:bg-canvas transition-colors">
                    <td className="px-4 py-3 text-[13.5px] font-semibold text-ink">{c.name}</td>
                    <td className="px-4 py-3 text-[13.5px] text-ink-soft">{c.city ?? '—'}</td>
                    <td className="px-4 py-3 text-[13.5px] text-ink-soft">{c.jobs}</td>
                    <td className="px-4 py-3 text-[13.5px] text-ink-soft">{c.applications}</td>
                    <td className="px-4 py-3 text-[13.5px] font-semibold text-[#0A7A54]">
                      {c.hires}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </div>
  );
}

function RankChart({ title, data }: { title: string; data: Point[] }) {
  return (
    <Panel title={title}>
      {data.length === 0 ? (
        <p className="text-[13.5px] text-ink-muted py-12 text-center">Not enough data yet.</p>
      ) : (
        <div className="p-5 h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              layout="vertical"
              margin={{ top: 4, right: 16, bottom: 4, left: 8 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" horizontal={false} />
              <XAxis type="number" tick={AXIS} tickLine={false} axisLine={false} allowDecimals={false} />
              <YAxis
                type="category"
                dataKey="label"
                tick={AXIS}
                tickLine={false}
                axisLine={false}
                width={110}
              />
              <Tooltip cursor={{ fill: 'rgba(15,76,129,0.06)' }} contentStyle={TOOLTIP} />
              <Bar dataKey="value" fill="#0F4C81" radius={[0, 5, 5, 0]} maxBarSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </Panel>
  );
}
