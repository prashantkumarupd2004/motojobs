'use client';
import { apiFetch } from '@/lib/http';
import { useState, useEffect } from 'react';
import { Bell, Plus, Trash2, Briefcase, MapPin, DollarSign, Loader2, CheckCircle, BellOff } from 'lucide-react';

interface Alert {
  id: string;
  keyword: string;
  location?: string;
  minSalary?: number;
  maxSalary?: number;
  jobType?: string;
  active: boolean;
  createdAt: string;
}

const JOB_TYPES = ['Full-time', 'Part-time', 'Contract', 'Remote', 'Internship'];

export default function JobAlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [success, setSuccess] = useState('');
  const [form, setForm] = useState({
    keyword: '',
    location: '',
    minSalary: '',
    maxSalary: '',
    jobType: '',
  });

  useEffect(() => {
    fetchAlerts();
  }, []);

  async function fetchAlerts() {
    try {
      const res = await apiFetch('/api/candidate/job-alerts');
      if (res.ok) {
        const data = await res.json();
        setAlerts(data.data || []);
      }
    } finally {
      setLoading(false);
    }
  }

  async function createAlert() {
    if (!form.keyword.trim()) return;
    setCreating(true);
    try {
      const res = await apiFetch('/api/candidate/job-alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          keyword: form.keyword,
          location: form.location || undefined,
          minSalary: form.minSalary ? Number(form.minSalary) * 100000 : undefined,
          maxSalary: form.maxSalary ? Number(form.maxSalary) * 100000 : undefined,
          jobType: form.jobType || undefined,
        }),
      });
      if (res.ok) {
        await fetchAlerts();
        setForm({ keyword: '', location: '', minSalary: '', maxSalary: '', jobType: '' });
        setShowForm(false);
        setSuccess('Alert created!');
        setTimeout(() => setSuccess(''), 3000);
      }
    } finally {
      setCreating(false);
    }
  }

  async function deleteAlert(id: string) {
    await apiFetch(`/api/candidate/job-alerts?id=${id}`, { method: 'DELETE' });
    setAlerts(prev => prev.filter(a => a.id !== id));
  }

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 text-brand-600 animate-spin" /></div>;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink">Job Alerts</h1>
          <p className="text-ink-muted mt-1">Get notified when matching jobs are posted</p>
        </div>
        <div className="flex items-center gap-3">
          {success && <div className="flex items-center gap-2 text-[#0A7A54] text-sm"><CheckCircle className="w-4 h-4" />{success}</div>}
          <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 bg-brand-600 hover:bg-brand-500 text-white font-semibold px-4 py-2.5 rounded-[16px] text-sm transition-all">
            <Plus className="w-4 h-4" /> New Alert
          </button>
        </div>
      </div>

      {/* Create Form */}
      {showForm && (
        <div className="bg-white border border-brand-100 rounded-[16px] p-6 space-y-4 animate-fade-in">
          <h2 className="font-bold text-ink">Create New Alert</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-sm text-ink-soft mb-2">Keyword <span className="text-[#B32B2B]">*</span></label>
              <div className="relative">
                <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-muted" />
                <input
                  value={form.keyword}
                  onChange={e => setForm({ ...form, keyword: e.target.value })}
                  placeholder="e.g. React Developer, Product Manager..."
                  className="w-full bg-canvas border border-line text-ink placeholder-ink-faint rounded-[16px] pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-brand-300"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm text-ink-soft mb-2">Location</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-muted" />
                <input
                  value={form.location}
                  onChange={e => setForm({ ...form, location: e.target.value })}
                  placeholder="e.g. Mumbai, Remote..."
                  className="w-full bg-canvas border border-line text-ink placeholder-ink-faint rounded-[16px] pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-brand-300"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm text-ink-soft mb-2">Job Type</label>
              <select
                value={form.jobType}
                onChange={e => setForm({ ...form, jobType: e.target.value })}
                className="w-full bg-canvas border border-line text-ink rounded-[16px] px-4 py-3 text-sm focus:outline-none focus:border-brand-300"
              >
                <option value="">Any type</option>
                {JOB_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm text-ink-soft mb-2">Min Salary (LPA)</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-muted" />
                <input
                  type="number"
                  value={form.minSalary}
                  onChange={e => setForm({ ...form, minSalary: e.target.value })}
                  placeholder="0"
                  className="w-full bg-canvas border border-line text-ink placeholder-ink-faint rounded-[16px] pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-brand-300"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm text-ink-soft mb-2">Max Salary (LPA)</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-muted" />
                <input
                  type="number"
                  value={form.maxSalary}
                  onChange={e => setForm({ ...form, maxSalary: e.target.value })}
                  placeholder="50"
                  className="w-full bg-canvas border border-line text-ink placeholder-ink-faint rounded-[16px] pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-brand-300"
                />
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={createAlert} disabled={creating || !form.keyword.trim()} className="flex items-center gap-2 bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white font-semibold px-5 py-2.5 rounded-[16px] text-sm transition-all">
              {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Bell className="w-4 h-4" />}
              Create Alert
            </button>
            <button onClick={() => setShowForm(false)} className="px-5 py-2.5 text-ink-muted hover:text-ink border border-line hover:border-brand-200 rounded-[16px] text-sm transition-all">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Alerts List */}
      {alerts.length === 0 ? (
        <div className="text-center py-16 bg-white border border-line rounded-[16px]">
          <BellOff className="w-12 h-12 text-ink-faint mx-auto mb-3" />
          <h3 className="font-semibold text-ink mb-2">No job alerts yet</h3>
          <p className="text-ink-muted text-sm">Create your first alert to get notified when matching jobs appear</p>
          <button onClick={() => setShowForm(true)} className="mt-4 inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-500 text-white font-semibold px-5 py-2.5 rounded-[16px] text-sm transition-all">
            <Plus className="w-4 h-4" /> Create Alert
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {alerts.map(alert => (
            <div key={alert.id} className="bg-white border border-line hover:border-line rounded-[16px] p-5 transition-all group">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-[16px] flex items-center justify-center shrink-0 ${alert.active ? 'bg-brand-50 border border-brand-100' : 'bg-canvas border border-line'}`}>
                    <Bell className={`w-5 h-5 ${alert.active ? 'text-brand-600' : 'text-ink-faint'}`} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-ink">{alert.keyword}</h3>
                      <span className={`text-xs border rounded-full px-2 py-0.5 ${alert.active ? 'bg-positive-soft text-[#0A7A54] border-[#BEE7D8]' : 'bg-canvas text-ink-muted border-line'}`}>
                        {alert.active ? 'Active' : 'Paused'}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-1 flex-wrap">
                      {alert.location && (
                        <span className="text-xs text-ink-muted flex items-center gap-1"><MapPin className="w-3 h-3" />{alert.location}</span>
                      )}
                      {alert.jobType && (
                        <span className="text-xs text-ink-muted flex items-center gap-1"><Briefcase className="w-3 h-3" />{alert.jobType}</span>
                      )}
                      {(alert.minSalary || alert.maxSalary) && (
                        <span className="text-xs text-ink-muted flex items-center gap-1">
                          <DollarSign className="w-3 h-3" />
                          {alert.minSalary ? `${alert.minSalary / 100000}L` : '0'} – {alert.maxSalary ? `${alert.maxSalary / 100000}L` : 'Any'}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-ink-faint mt-1">Created {new Date(alert.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <button onClick={() => deleteAlert(alert.id)} className="opacity-0 group-hover:opacity-100 text-ink-muted hover:text-[#B32B2B] transition-all">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
