'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Briefcase, MapPin, Clock, ArrowRight, Loader2, Search } from 'lucide-react';

const STATUS_STYLES: Record<string, string> = {
  APPLIED: 'bg-brand-50 text-brand-600 border-brand-100',
  SCREENING: 'bg-caution-soft text-[#9A5D00] border-[#F3DBB4]',
  SHORTLISTED: 'bg-ignite-50 text-ignite-600 border-ignite-100',
  INTERVIEW: 'bg-brand-50 text-brand-600 border-brand-100',
  OFFERED: 'bg-positive-soft text-[#0A7A54] border-[#BEE7D8]',
  REJECTED: 'bg-critical-soft text-[#B32B2B] border-[#F3C9C9]',
  HIRED: 'bg-positive-soft text-[#0A7A54] border-emerald-600/20',
};

export default function AppliedJobsPage() {
  const [applications, setApplications] = useState<Array<{id: string; status: string; appliedAt: string; coverLetter?: string; job?: {id: string; title: string; location?: string; jobType: string; company?: {name: string}}}>>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch('/api/candidate/applications').then(r => r.json()).then(d => {
      setApplications(d.data || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const filtered = applications.filter(a => !search || a.job?.title.toLowerCase().includes(search.toLowerCase()) || a.job?.company?.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink">My Applications</h1>
        <p className="text-ink-muted mt-1">{applications.length} total applications</p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-muted" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search applications..." className="w-full bg-white border border-line text-ink placeholder-ink-faint pl-11 pr-4 py-3 rounded-[16px] text-sm focus:outline-none focus:border-brand-300" />
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-brand-600 animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 bg-white border border-line rounded-[16px]">
          <Briefcase className="w-16 h-16 text-ink-faint mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-ink mb-2">No applications</h3>
          <p className="text-ink-muted text-sm mb-4">You haven&apos;t applied to any jobs yet</p>
          <Link href="/jobs" className="inline-flex items-center gap-2 text-brand-600 hover:text-brand-700 text-sm">Browse Jobs <ArrowRight className="w-4 h-4" /></Link>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(app => (
            <div key={app.id} className="bg-white border border-line rounded-[16px] p-5 hover:border-line transition-colors">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#1F5D95] to-[#0F4C81] flex items-center justify-center text-white text-xs font-bold shrink-0">
                    {app.job?.company?.name?.[0] || 'J'}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-ink text-sm">{app.job?.title}</h3>
                    <p className="text-ink-muted text-xs">{app.job?.company?.name}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-ink-muted">
                      {app.job?.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{app.job.location}</span>}
                      <span className="flex items-center gap-1"><Briefcase className="w-3 h-3" />{app.job?.jobType}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{new Date(app.appliedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-3">
                  <span className={`text-xs border rounded-full px-3 py-1 ${STATUS_STYLES[app.status] || 'bg-canvas text-ink-soft border-line'}`}>
                    {app.status}
                  </span>
                  <Link href={`/jobs/${app.job?.id}`} className="text-xs text-brand-600 hover:text-brand-700 flex items-center gap-1 transition-colors">
                    View Job <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
