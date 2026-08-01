'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Users, Briefcase, Plus, ArrowRight, CheckCircle, Filter, Loader2, TrendingUp, Eye } from 'lucide-react';

interface Job { id: string; title: string; location: string; status: string; _count?: { applications: number }; createdAt: string; }
interface Application { id: string; status: string; candidate?: { user?: { name: string } }; job?: { title: string }; appliedAt: string; }
interface Entitlements {
  planName: string;
  jobPostLimit: number | null;
  jobPostsUsed: number;
  canPostJob: boolean;
  billingEnabled: boolean;
}

export default function RecruiterDashboard() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [apps, setApps] = useState<Application[]>([]);
  const [plan, setPlan] = useState<Entitlements | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ activeJobs: 0, totalApps: 0, shortlisted: 0, hired: 0 });

  useEffect(() => {
    async function fetchData() {
      try {
        const [jobRes, appRes, planRes] = await Promise.all([
          fetch('/api/recruiter/jobs'),
          fetch('/api/recruiter/ats'),
          fetch('/api/recruiter/subscription'),
        ]);
        if (jobRes.ok) {
          const jd = await jobRes.json();
          const jobList: Job[] = jd.jobs || [];
          setJobs(jobList.slice(0, 5));
          const totalApps = jobList.reduce((sum: number, j: Job) => sum + (j._count?.applications || 0), 0);
          setStats(prev => ({ ...prev, activeJobs: jobList.filter(j => j.status === 'APPROVED').length, totalApps }));
        }
        if (appRes.ok) {
          const ad = await appRes.json();
          const appList: Application[] = ad.applications || [];
          setApps(appList.slice(0, 6));
          setStats(prev => ({
            ...prev,
            shortlisted: appList.filter(a => a.status === 'SHORTLISTED').length,
            hired: appList.filter(a => a.status === 'HIRED').length,
          }));
        }
        if (planRes.ok) {
          const pd = await planRes.json();
          setPlan(pd.entitlements ?? null);
        }
      } finally { setLoading(false); }
    }
    fetchData();
  }, []);

  const STATUS_STYLES: Record<string, string> = {
    APPLIED: 'bg-informative-soft text-brand-700 border-brand-100',
    SCREENING: 'bg-caution-soft text-caution border-caution/20',
    SHORTLISTED: 'bg-ignite-50 text-ignite-700 border-ignite-100',
    INTERVIEW: 'bg-brand-50 text-brand-600 border-brand-100',
    OFFERED: 'bg-positive-soft text-positive border-positive/20',
    HIRED: 'bg-positive-soft text-positive border-positive/20',
    REJECTED: 'bg-critical-soft text-critical border-critical/20',
  };

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 text-ignite-600 animate-spin" /></div>;

  return (
    <div className="space-y-7">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-[28px] font-extrabold text-ink tracking-[-0.035em]">Recruiter Dashboard</h1>
          <p className="text-ink-muted text-[15px] mt-1.5">Overview of your hiring pipeline</p>
        </div>
        <Link href="/recruiter/post-job" className="sweep press inline-flex shrink-0 items-center justify-center gap-2 grad-ignite text-white font-semibold px-6 py-3 rounded-[14px] text-sm shadow-[0_4px_12px_rgba(255,107,0,0.22)] hover:shadow-[0_8px_22px_rgba(255,107,0,0.32)] hover:-translate-y-0.5 transition-all duration-300 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)]">
          <Plus className="w-4 h-4" /> Post Job
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          { label: 'Active Jobs', value: stats.activeJobs, icon: Briefcase, color: 'text-ignite-600', bg: 'bg-ignite-50 border-ignite-100', href: '/recruiter/manage-jobs' },
          { label: 'Applications', value: stats.totalApps, icon: Users, color: 'text-brand-600', bg: 'bg-brand-50 border-brand-100', href: '/recruiter/ats' },
          { label: 'Shortlisted', value: stats.shortlisted, icon: Filter, color: 'text-caution', bg: 'bg-caution-soft border-caution/15', href: '/recruiter/ats' },
          { label: 'Hired', value: stats.hired, icon: CheckCircle, color: 'text-positive', bg: 'bg-positive-soft border-positive/15', href: '/recruiter/ats' },
        ].map(({ label, value, icon: Icon, color, bg, href }) => (
          <Link key={label} href={href} className="surface sheen lift p-6 group">
            <div className={`w-11 h-11 ${bg} border rounded-[14px] flex items-center justify-center mb-4`}>
              <Icon className={`w-5 h-5 ${color} icon-lift`} strokeWidth={2.1} />
            </div>
            <div className="text-[30px] font-extrabold text-ink tracking-[-0.035em] leading-none">{value}</div>
            <div className="text-[12px] font-semibold text-ink-faint uppercase tracking-[0.1em] mt-2.5">{label}</div>
          </Link>
        ))}
      </div>

      {plan && (
        <div className="surface sheen p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2.5">
                <h2 className="text-[17px] font-bold text-ink tracking-[-0.025em]">
                  {plan.billingEnabled ? `${plan.planName} plan` : 'Free access'}
                </h2>
                <span className="text-[10.5px] font-bold uppercase tracking-[0.08em] border rounded-full px-2.5 py-1 bg-brand-50 text-brand-700 border-brand-100">
                  {plan.billingEnabled ? 'Active' : 'No charges'}
                </span>
              </div>
              <p className="text-[13.5px] text-ink-muted mt-1.5">
                {!plan.billingEnabled
                  ? `${plan.jobPostsUsed} active job post${plan.jobPostsUsed === 1 ? '' : 's'} · everything is free while we grow`
                  : plan.jobPostLimit === null
                    ? `${plan.jobPostsUsed} active job posts · unlimited`
                    : `${plan.jobPostsUsed} of ${plan.jobPostLimit} job slot${plan.jobPostLimit === 1 ? '' : 's'} in use`}
              </p>
            </div>
            {plan.billingEnabled && (
              <Link
                href="/pricing"
                className="press shrink-0 inline-flex items-center gap-1.5 border border-line bg-white text-ink font-semibold px-5 py-2.5 rounded-[12px] text-[13.5px] hover:border-brand-200 transition-all duration-300"
              >
                {plan.canPostJob ? 'View plans' : 'Upgrade plan'} <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>

          {plan.jobPostLimit !== null && (
            <div className="mt-5 h-2 rounded-full bg-canvas border border-line-soft overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${plan.canPostJob ? 'grad-brand' : 'grad-ignite'}`}
                style={{ width: `${Math.min(100, (plan.jobPostsUsed / plan.jobPostLimit) * 100)}%` }}
              />
            </div>
          )}

          {!plan.canPostJob && plan.billingEnabled && (
            <p className="text-[13px] text-ignite-700 bg-ignite-50 border border-ignite-100 rounded-[12px] px-4 py-3 mt-4">
              You have used every job slot on this plan. Close a role to free a slot, or upgrade to post more.
            </p>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Jobs */}
        <div className="surface sheen overflow-hidden">
          <div className="flex items-center justify-between p-6 border-b border-line-soft">
            <h2 className="text-[17px] font-bold text-ink tracking-[-0.025em]">Active Job Listings</h2>
            <Link href="/recruiter/manage-jobs" className="group text-[13px] font-semibold text-ignite-600 hover:text-ignite-700 transition-colors duration-200 flex items-center gap-1.5">
              Manage <ArrowRight className="w-3.5 h-3.5 arrow-slide" />
            </Link>
          </div>
          {jobs.length === 0 ? (
            <div className="text-center py-16 px-6">
              <div className="w-16 h-16 rounded-[20px] bg-canvas border border-line-soft flex items-center justify-center mx-auto mb-4">
                <Briefcase className="w-7 h-7 text-ink-faint" />
              </div>
              <p className="text-ink-muted text-[14px]">No jobs posted yet</p>
              <Link href="/recruiter/post-job" className="group inline-flex items-center gap-1.5 text-ignite-600 hover:text-ignite-700 text-[14px] font-semibold mt-3 transition-colors duration-200">
                Post your first job <ArrowRight className="w-3.5 h-3.5 arrow-slide" />
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-line-soft">
              {jobs.map(job => (
                <div key={job.id} className="flex items-center justify-between gap-4 px-6 py-4 hover:bg-canvas transition-colors duration-200">
                  <div className="min-w-0">
                    <p className="text-[14.5px] font-semibold text-ink truncate">{job.title}</p>
                    <p className="text-[12.5px] text-ink-muted mt-0.5 truncate">{job.location} · {job._count?.applications || 0} applicants</p>
                  </div>
                  <span className={`shrink-0 text-[10.5px] font-bold uppercase tracking-[0.08em] border rounded-full px-2.5 py-1.5 ${job.status === 'ACTIVE' ? 'bg-positive-soft text-positive border-positive/20' : 'bg-canvas text-ink-muted border-line'}`}>
                    {job.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Applications */}
        <div className="surface sheen overflow-hidden">
          <div className="flex items-center justify-between p-6 border-b border-line-soft">
            <h2 className="text-[17px] font-bold text-ink tracking-[-0.025em]">Recent Applications</h2>
            <Link href="/recruiter/ats" className="group text-[13px] font-semibold text-ignite-600 hover:text-ignite-700 transition-colors duration-200 flex items-center gap-1.5">
              ATS Board <ArrowRight className="w-3.5 h-3.5 arrow-slide" />
            </Link>
          </div>
          {apps.length === 0 ? (
            <div className="text-center py-16 px-6">
              <div className="w-16 h-16 rounded-[20px] bg-canvas border border-line-soft flex items-center justify-center mx-auto mb-4">
                <Users className="w-7 h-7 text-ink-faint" />
              </div>
              <p className="text-ink-muted text-[14px]">No applications received yet</p>
            </div>
          ) : (
            <div className="divide-y divide-line-soft">
              {apps.map(app => (
                <div key={app.id} className="flex items-center justify-between gap-4 px-6 py-4 hover:bg-canvas transition-colors duration-200">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative w-9 h-9 rounded-[12px] grad-brand flex items-center justify-center text-white text-[12.5px] font-bold shrink-0 shadow-[0_4px_10px_rgba(16,24,40,0.14)]">
                      {app.candidate?.user?.name?.[0] || '?'}
                      <span className="absolute inset-x-2 top-px h-px bg-white/40 rounded-full" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[14.5px] font-semibold text-ink truncate">{app.candidate?.user?.name || 'Unknown'}</p>
                      <p className="text-[12.5px] text-ink-muted truncate mt-0.5">{app.job?.title || ''}</p>
                    </div>
                  </div>
                  <span className={`shrink-0 text-[10.5px] font-bold uppercase tracking-[0.08em] border rounded-full px-2.5 py-1.5 ${STATUS_STYLES[app.status] || 'bg-canvas text-ink-muted border-line'}`}>
                    {app.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {[
          { href: '/recruiter/candidate-search', icon: Users, label: 'Search Candidates', desc: 'Find top talent', color: 'grad-brand' },
          { href: '/recruiter/ai-tools', icon: TrendingUp, label: 'AI Tools', desc: 'JD generator & screening', color: 'grad-ignite' },
          { href: '/recruiter/bulk-hiring', icon: Eye, label: 'Bulk Hiring', desc: 'Manage mass recruitment', color: 'grad-brand' },
        ].map(({ href, icon: Icon, label, desc, color }) => (
          <Link key={href} href={href} className="surface sheen lift p-6 group">
            <div className={`relative w-11 h-11 rounded-[14px] ${color} flex items-center justify-center mb-4 shadow-[0_4px_10px_rgba(16,24,40,0.14)]`}>
              <Icon className="w-5 h-5 text-ink icon-lift" strokeWidth={2.1} />
              <span className="absolute inset-x-2.5 top-px h-px bg-white/40 rounded-full" />
            </div>
            <p className="text-[15px] font-bold text-ink tracking-[-0.02em]">{label}</p>
            <p className="text-[13.5px] text-ink-muted mt-1.5">{desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
