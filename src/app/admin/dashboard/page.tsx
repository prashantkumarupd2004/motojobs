'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Users, Briefcase, Building2, CreditCard, TrendingUp, AlertCircle, CheckCircle, Clock, ArrowRight } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

const CHART_DATA = [
  { month: 'Jan', users: 120, jobs: 45, applications: 320 },
  { month: 'Feb', users: 180, jobs: 62, applications: 480 },
  { month: 'Mar', users: 240, jobs: 78, applications: 620 },
  { month: 'Apr', users: 310, jobs: 95, applications: 750 },
  { month: 'May', users: 420, jobs: 110, applications: 920 },
  { month: 'Jun', users: 580, jobs: 145, applications: 1150 },
];

export default function AdminDashboard() {
  const [stats, setStats] = useState({ users: 0, jobs: 0, applications: 0, revenue: 0 });
  const [pending, setPending] = useState({ candidates: 0, recruiters: 0, jobs: 0, tickets: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  async function fetchStats() {
    try {
      const res = await fetch('/api/admin/analytics');
      if (res.ok) {
        const data = await res.json();
        if (data.data) {
          setStats(data.data.stats || stats);
          setPending(data.data.pending || pending);
        }
      }
    } catch {} finally {
      setLoading(false);
    }
  }

  const STAT_CARDS = [
    { label: 'Total Users', value: stats.users || '5,234', icon: Users, color: 'text-brand-600', bg: 'bg-brand-50 border-brand-100', trend: '+12%' },
    { label: 'Active Jobs', value: stats.jobs || '1,847', icon: Briefcase, color: 'text-[#0A7A54]', bg: 'bg-positive-soft border-[#BEE7D8]', trend: '+8%' },
    { label: 'Applications', value: stats.applications || '23,891', icon: Building2, color: 'text-ignite-600', bg: 'bg-ignite-50 border-ignite-100', trend: '+24%' },
    { label: 'Revenue', value: `₹${(stats.revenue / 100000 || 12.4).toFixed(1)}L`, icon: CreditCard, color: 'text-[#9A5D00]', bg: 'bg-caution-soft border-[#F3DBB4]', trend: '+18%' },
  ];

  const PENDING_ITEMS = [
    { label: 'Candidate Verifications', value: pending.candidates || 23, href: '/admin/candidate-verification', color: 'text-brand-600', urgent: pending.candidates > 10 },
    { label: 'Recruiter Verifications', value: pending.recruiters || 8, href: '/admin/recruiter-verification', color: 'text-[#0A7A54]', urgent: false },
    { label: 'Job Approvals', value: pending.jobs || 15, href: '/admin/job-approval', color: 'text-[#9A5D00]', urgent: pending.jobs > 10 },
    { label: 'Support Tickets', value: pending.tickets || 31, href: '/admin/support-tickets', color: 'text-[#B32B2B]', urgent: pending.tickets > 20 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink">Admin Dashboard</h1>
        <p className="text-ink-muted mt-1">Platform overview and management</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STAT_CARDS.map(({ label, value, icon: Icon, color, bg, trend }) => (
          <div key={label} className="bg-white border border-line rounded-[16px] p-5">
            <div className="flex items-start justify-between mb-3">
              <div className={`w-10 h-10 ${bg} border rounded-lg flex items-center justify-center`}>
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
              <span className="text-xs text-[#0A7A54] bg-positive-soft border border-[#BEE7D8] rounded-full px-2 py-0.5">{trend}</span>
            </div>
            <div className="text-2xl font-bold text-ink">{value}</div>
            <div className="text-xs text-ink-muted mt-1">{label}</div>
          </div>
        ))}
      </div>

      {/* Pending Actions */}
      <div className="bg-white border border-line rounded-[16px] p-5">
        <h2 className="font-bold text-ink mb-4">Pending Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {PENDING_ITEMS.map(({ label, value, href, color, urgent }) => (
            <Link key={label} href={href} className={`p-4 rounded-[16px] border transition-all hover:scale-105 ${urgent ? 'bg-critical-soft border-[#F3C9C9]' : 'bg-canvas border-line hover:border-line'}`}>
              <div className="flex items-center justify-between mb-2">
                {urgent ? <AlertCircle className="w-4 h-4 text-[#B32B2B]" /> : <Clock className="w-4 h-4 text-ink-muted" />}
                <ArrowRight className="w-3.5 h-3.5 text-ink-faint" />
              </div>
              <div className={`text-2xl font-bold ${urgent ? 'text-[#B32B2B]' : color}`}>{value}</div>
              <div className="text-xs text-ink-muted mt-1">{label}</div>
            </Link>
          ))}
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-line rounded-[16px] p-5">
          <h2 className="font-bold text-ink mb-4">User Growth</h2>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={CHART_DATA}>
              <defs>
                <linearGradient id="userGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0F4C81" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#0F4C81" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E8EAF0" />
              <XAxis dataKey="month" tick={{ fill: '#9AA1AE', fontSize: 12 }} />
              <YAxis tick={{ fill: '#9AA1AE', fontSize: 12 }} />
              <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', border: '1px solid #E8EAF0', borderRadius: '14px', color: '#1A1A1A', boxShadow: '0 8px 24px rgba(16,24,40,0.08)', fontSize: 13 }} />
              <Area type="monotone" dataKey="users" stroke="#0F4C81" fill="url(#userGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white border border-line rounded-[16px] p-5">
          <h2 className="font-bold text-ink mb-4">Jobs & Applications</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={CHART_DATA}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E8EAF0" />
              <XAxis dataKey="month" tick={{ fill: '#9AA1AE', fontSize: 12 }} />
              <YAxis tick={{ fill: '#9AA1AE', fontSize: 12 }} />
              <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', border: '1px solid #E8EAF0', borderRadius: '14px', color: '#1A1A1A', boxShadow: '0 8px 24px rgba(16,24,40,0.08)', fontSize: 13 }} />
              <Bar dataKey="jobs" fill="#0E9F6E" radius={[4, 4, 0, 0]} />
              <Bar dataKey="applications" fill="#0F4C81" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
