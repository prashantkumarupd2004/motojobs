'use client';
import { useState, useEffect } from 'react';
import { Database, Search, Download, Eye, MapPin, Briefcase, Filter, Loader2 } from 'lucide-react';

interface Resume {
  id: string;
  fileUrl?: string;
  updatedAt: string;
  candidate?: {
    headline?: string;
    location?: string;
    experience?: number;
    isOpenToWork?: boolean;
    user?: { name: string; email: string };
  };
}

export default function ResumeDatabasePage() {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => { fetchResumes(); }, []);

  async function fetchResumes() {
    try {
      const res = await fetch('/api/recruiter/candidates?hasResume=true');
      if (res.ok) {
        const data = await res.json();
        // Map candidates to resume format
        setResumes((data.data || []).map((c: { id: string; headline?: string; location?: string; experience?: number; isOpenToWork?: boolean; user?: { name: string; email: string } }) => ({
          id: c.id,
          updatedAt: new Date().toISOString(),
          candidate: c,
        })));
      }
    } finally { setLoading(false); }
  }

  const filtered = resumes.filter(r =>
    !search ||
    r.candidate?.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
    r.candidate?.headline?.toLowerCase().includes(search.toLowerCase()) ||
    r.candidate?.location?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink">Resume Database</h1>
        <p className="text-ink-muted mt-1">Browse uploaded resumes from candidates</p>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-muted" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, role, location..."
            className="w-full bg-white border border-line text-ink placeholder-ink-faint rounded-[16px] pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-[#BEE7D8]"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-line text-ink-muted hover:text-ink rounded-[16px] text-sm transition-all">
          <Filter className="w-4 h-4" /> Filter
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 text-[#0A7A54] animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-white border border-line rounded-[16px]">
          <Database className="w-12 h-12 text-ink-faint mx-auto mb-3" />
          <h3 className="font-semibold text-ink mb-2">No resumes found</h3>
          <p className="text-ink-muted text-sm">Candidates who upload resumes will appear here</p>
        </div>
      ) : (
        <div className="bg-white border border-line rounded-[16px] overflow-hidden">
          <div className="grid grid-cols-12 gap-4 px-5 py-3 text-xs text-ink-muted font-semibold uppercase tracking-wide border-b border-line">
            <div className="col-span-4">Candidate</div>
            <div className="col-span-3">Role</div>
            <div className="col-span-2">Location</div>
            <div className="col-span-1">Exp</div>
            <div className="col-span-2 text-right">Actions</div>
          </div>
          <div className="divide-y divide-line-soft">
            {filtered.map(resume => (
              <div key={resume.id} className="grid grid-cols-12 gap-4 px-5 py-4 items-center hover:bg-canvas transition-colors">
                <div className="col-span-4 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#1F5D95] to-[#0F4C81] flex items-center justify-center text-white text-xs font-bold shrink-0">
                    {resume.candidate?.user?.name?.[0] || '?'}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-ink truncate">{resume.candidate?.user?.name || 'Unknown'}</p>
                    {resume.candidate?.isOpenToWork && (
                      <span className="text-xs text-[#0A7A54]">● Open to work</span>
                    )}
                  </div>
                </div>
                <div className="col-span-3 text-sm text-ink-soft truncate">{resume.candidate?.headline || '—'}</div>
                <div className="col-span-2 text-sm text-ink-muted flex items-center gap-1 truncate">
                  {resume.candidate?.location ? <><MapPin className="w-3 h-3 shrink-0" />{resume.candidate.location}</> : '—'}
                </div>
                <div className="col-span-1 text-sm text-ink-muted">
                  {resume.candidate?.experience !== undefined ? `${resume.candidate.experience}y` : '—'}
                </div>
                <div className="col-span-2 flex items-center justify-end gap-2">
                  {resume.fileUrl ? (
                    <a href={resume.fileUrl} target="_blank" rel="noopener noreferrer" className="p-1.5 text-ink-muted hover:text-[#0A7A54] transition-colors">
                      <Eye className="w-4 h-4" />
                    </a>
                  ) : (
                    <button disabled className="p-1.5 text-ink-faint cursor-not-allowed">
                      <Eye className="w-4 h-4" />
                    </button>
                  )}
                  {resume.fileUrl && (
                    <a href={resume.fileUrl} download className="p-1.5 text-ink-muted hover:text-[#0A7A54] transition-colors">
                      <Download className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
