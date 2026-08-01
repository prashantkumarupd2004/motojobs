'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Briefcase, FileText, Bookmark, Clock, TrendingUp, CheckCircle, ArrowRight, Zap, Star, Bell, Target } from 'lucide-react';

const QUICK_ACTIONS = [
  { href: '/jobs', icon: Briefcase, label: 'Find Jobs', color: 'grad-brand' },
  { href: '/candidate/resume', icon: FileText, label: 'Build Resume', color: 'bg-gradient-to-br from-[#12B37E] to-[#0A8A5F]' },
  { href: '/candidate/skill-tests', icon: Star, label: 'Take Test', color: 'grad-ignite' },
  { href: '/candidate/ai-assistant', icon: Zap, label: 'AI Assistant', color: 'bg-gradient-to-br from-[#4A7FB4] to-[#0C3D68]' },
];

export default function CandidateDashboard() {
  const [stats, setStats] = useState({ applied: 0, saved: 0, interviews: 0, profileScore: 0 });
  const [recentApplications, setRecentApplications] = useState<Array<{id: string; job?: {title: string; company?: {name: string}}; status: string; appliedAt: string}>>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  async function fetchDashboardData() {
    try {
      const [appRes, profileRes] = await Promise.all([
        fetch('/api/candidate/applications?limit=5'),
        fetch('/api/candidate/profile'),
      ]);
      if (appRes.ok) {
        const appData = await appRes.json();
        const apps = appData.data || [];
        setRecentApplications(apps.slice(0, 5));
        setStats(prev => ({ ...prev, applied: appData.total || apps.length, interviews: apps.filter((a: {status: string}) => a.status === 'INTERVIEW').length }));
      }
      if (profileRes.ok) {
        const profileData = await profileRes.json();
        setStats(prev => ({ ...prev, profileScore: profileData.data?.profileScore || 0 }));
      }
    } catch {}
  }

  const STATUS_STYLES: Record<string, string> = {
    APPLIED: 'bg-brand-50 text-brand-700 border-brand-200',
    SCREENING: 'bg-caution-soft text-caution border-caution/25',
    SHORTLISTED: 'bg-ignite-50 text-ignite-700 border-ignite-200',
    INTERVIEW: 'bg-informative-soft text-informative border-brand-200',
    OFFERED: 'bg-positive-soft text-positive border-positive/25',
    REJECTED: 'bg-critical-soft text-critical border-critical/25',
    HIRED: 'bg-positive-soft text-positive border-positive/25',
  };

  return (
    <div className="space-y-7">
      <div>
        <h1 className="text-[28px] font-extrabold text-ink tracking-[-0.035em]">Dashboard</h1>
        <p className="text-ink-muted text-[15px] mt-1.5">Welcome back! Here&apos;s your career overview.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          { label: 'Applications', value: stats.applied, icon: Briefcase, color: 'text-brand-600', bg: 'bg-brand-50 border-brand-100' },
          { label: 'Profile Score', value: `${stats.profileScore}%`, icon: TrendingUp, color: 'text-positive', bg: 'bg-positive-soft border-positive/15' },
          { label: 'Interviews', value: stats.interviews, icon: Target, color: 'text-ignite-600', bg: 'bg-ignite-50 border-ignite-100' },
          { label: 'Saved Jobs', value: stats.saved, icon: Bookmark, color: 'text-caution', bg: 'bg-caution-soft border-caution/15' },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="surface sheen lift p-6 group">
            <div className={`w-11 h-11 ${bg} border rounded-[14px] flex items-center justify-center mb-4 icon-lift`}>
              <Icon className={`w-[21px] h-[21px] ${color}`} strokeWidth={2.1} />
            </div>
            <div className="text-[30px] font-extrabold text-ink tracking-[-0.035em] leading-none">{value}</div>
            <div className="text-[12px] font-semibold text-ink-faint uppercase tracking-[0.1em] mt-2.5">{label}</div>
          </div>
        ))}
      </div>

      {/* Profile Score */}
      <div className="surface sheen p-6 sm:p-8">
        <div className="flex items-start justify-between gap-4 mb-5">
          <div className="min-w-0">
            <h2 className="text-[17px] font-bold text-ink tracking-[-0.025em]">Profile Completion</h2>
            <p className="text-ink-muted text-[14.5px] mt-1 leading-[1.7]">Complete your profile to get better job matches</p>
          </div>
          <span className="text-[30px] font-extrabold text-brand-600 tracking-[-0.035em] leading-none shrink-0">{stats.profileScore}%</span>
        </div>
        <div className="w-full h-2 bg-line-soft rounded-full overflow-hidden">
          <div className="h-full grad-brand rounded-full transition-all duration-700" style={{ width: `${stats.profileScore}%` }} />
        </div>
        {stats.profileScore < 80 && (
          <Link href="/candidate/profile" className="group inline-flex items-center gap-1.5 text-brand-600 hover:text-brand-700 text-[13.5px] font-semibold mt-4 transition-colors duration-200">
            Complete profile <ArrowRight className="w-3.5 h-3.5 arrow-slide" />
          </Link>
        )}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-[17px] font-bold text-ink tracking-[-0.025em] mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
          {QUICK_ACTIONS.map(({ href, icon: Icon, label, color }) => (
            <Link key={href} href={href} className="surface sheen lift press p-6 text-center group">
              <div className={`w-12 h-12 rounded-[15px] ${color} flex items-center justify-center mx-auto mb-4 shadow-[0_4px_12px_rgba(16,24,40,0.10)] icon-lift`}>
                <Icon className="w-[22px] h-[22px] text-ink" strokeWidth={2.1} />
              </div>
              <p className="text-[13.5px] font-semibold text-ink-soft group-hover:text-brand-700 transition-colors duration-300">{label}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Applications */}
      <div className="surface sheen overflow-hidden">
        <div className="flex items-center justify-between gap-4 px-6 py-5 border-b border-line">
          <h2 className="text-[17px] font-bold text-ink tracking-[-0.025em]">Recent Applications</h2>
          <Link href="/candidate/applied-jobs" className="text-[13.5px] font-semibold text-brand-600 hover:text-brand-700 transition-colors duration-200 shrink-0">View all</Link>
        </div>
        {recentApplications.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-[20px] bg-canvas border border-line-soft flex items-center justify-center mx-auto mb-4">
              <Briefcase className="w-7 h-7 text-ink-faint" strokeWidth={1.8} />
            </div>
            <p className="text-ink font-bold text-[15px]">No applications yet</p>
            <Link href="/jobs" className="group inline-flex items-center gap-1.5 text-brand-600 hover:text-brand-700 text-[13.5px] font-semibold mt-2.5">Browse jobs <ArrowRight className="w-3.5 h-3.5 arrow-slide" /></Link>
          </div>
        ) : (
          <div className="divide-y divide-line-soft">
            {recentApplications.map(app => (
              <div key={app.id} className="flex items-center justify-between gap-4 px-6 py-4 hover:bg-canvas transition-colors duration-200">
                <div className="min-w-0">
                  <p className="text-[14.5px] font-semibold text-ink truncate">{app.job?.title || 'Unknown Job'}</p>
                  <p className="text-[12.5px] text-ink-muted mt-0.5 truncate">{app.job?.company?.name || ''} · {new Date(app.appliedAt).toLocaleDateString()}</p>
                </div>
                <span className={`shrink-0 border rounded-full px-2.5 py-1.5 text-[10.5px] font-bold uppercase tracking-[0.08em] ${STATUS_STYLES[app.status] || 'bg-canvas text-ink-muted border-line'}`}>
                  {app.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
