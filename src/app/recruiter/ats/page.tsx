'use client';
import { apiFetch } from '@/lib/http';
import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';

interface Application {
  id: string;
  status: string;
  appliedAt: string;
  coverLetter?: string;
  candidate?: { user?: { name: string; email: string }; headline?: string; location?: string };
  job?: { title: string };
}

const COLUMNS = [
  { key: 'APPLIED', label: 'Applied', color: 'bg-brand-50 border-brand-100 text-brand-600' },
  { key: 'SCREENING', label: 'Screening', color: 'bg-caution-soft border-[#F3DBB4] text-[#9A5D00]' },
  { key: 'SHORTLISTED', label: 'Shortlisted', color: 'bg-ignite-50 border-ignite-100 text-ignite-600' },
  { key: 'INTERVIEW', label: 'Interview', color: 'bg-brand-50 border-brand-100 text-brand-600' },
  { key: 'OFFERED', label: 'Offered', color: 'bg-positive-soft border-[#BEE7D8] text-[#0A7A54]' },
  { key: 'HIRED', label: 'Hired', color: 'bg-positive-soft border-[#BEE7D8] text-[#0A7A54]' },
  { key: 'REJECTED', label: 'Rejected', color: 'bg-critical-soft border-[#F3C9C9] text-[#B32B2B]' },
];

export default function ATSPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [dragging, setDragging] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => { fetchApplications(); }, []);

  async function fetchApplications() {
    try {
      const res = await apiFetch('/api/recruiter/ats');
      if (res.ok) { const data = await res.json(); setApplications(data.data || []); }
    } finally { setLoading(false); }
  }

  async function updateStatus(appId: string, newStatus: string) {
    setUpdating(appId);
    try {
      await apiFetch('/api/recruiter/ats', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: appId, status: newStatus }),
      });
      setApplications(prev => prev.map(a => a.id === appId ? { ...a, status: newStatus } : a));
    } finally { setUpdating(null); }
  }

  function onDragStart(e: React.DragEvent, appId: string) {
    setDragging(appId);
    e.dataTransfer.effectAllowed = 'move';
  }

  function onDrop(e: React.DragEvent, status: string) {
    e.preventDefault();
    if (dragging) {
      updateStatus(dragging, status);
      setDragging(null);
    }
  }

  function onDragOver(e: React.DragEvent) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 text-[#0A7A54] animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink">ATS Board</h1>
        <p className="text-ink-muted mt-1">Drag and drop candidates through your hiring pipeline</p>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4" style={{ minHeight: '70vh' }}>
        {COLUMNS.map(col => {
          const colApps = applications.filter(a => a.status === col.key);
          return (
            <div
              key={col.key}
              onDrop={e => onDrop(e, col.key)}
              onDragOver={onDragOver}
              className="flex-shrink-0 w-64 flex flex-col"
            >
              {/* Column Header */}
              <div className={`flex items-center justify-between px-3 py-2.5 rounded-[16px] border mb-3 ${col.color}`}>
                <span className="text-sm font-semibold">{col.label}</span>
                <span className="text-xs font-bold bg-white/10 rounded-full w-5 h-5 flex items-center justify-center">{colApps.length}</span>
              </div>

              {/* Cards */}
              <div className="flex-1 space-y-3 min-h-16 rounded-[16px] border-2 border-dashed border-transparent" style={{ transition: 'border-color 0.2s' }}>
                {colApps.map(app => (
                  <div
                    key={app.id}
                    draggable
                    onDragStart={e => onDragStart(e, app.id)}
                    className={`bg-white border border-line rounded-[16px] p-4 cursor-grab active:cursor-grabbing hover:border-line transition-all select-none ${dragging === app.id ? 'opacity-50 scale-95' : ''} ${updating === app.id ? 'opacity-70' : ''}`}
                  >
                    <div className="flex items-start gap-2.5 mb-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#1F5D95] to-[#0F4C81] flex items-center justify-center text-white text-xs font-bold shrink-0">
                        {app.candidate?.user?.name?.[0] || '?'}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-ink truncate">{app.candidate?.user?.name || 'Unknown'}</p>
                        <p className="text-xs text-ink-muted truncate">{app.candidate?.headline || app.candidate?.user?.email || ''}</p>
                      </div>
                    </div>
                    <p className="text-xs text-ink-faint mb-3 truncate">📋 {app.job?.title || 'Unknown Job'}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-ink-faint">{new Date(app.appliedAt).toLocaleDateString()}</span>
                      <select
                        value={app.status}
                        onChange={e => updateStatus(app.id, e.target.value)}
                        onClick={e => e.stopPropagation()}
                        className="text-xs bg-canvas border border-line text-ink-soft rounded-lg px-2 py-1 focus:outline-none focus:border-[#BEE7D8]"
                      >
                        {COLUMNS.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
                      </select>
                    </div>
                    {updating === app.id && <div className="mt-2 text-xs text-[#0A7A54] flex items-center gap-1"><Loader2 className="w-3 h-3 animate-spin" />Updating...</div>}
                  </div>
                ))}
                {colApps.length === 0 && (
                  <div className="text-center py-8 text-ink-faint text-xs">Drop here</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
