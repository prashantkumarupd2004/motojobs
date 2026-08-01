'use client';
import { apiFetch } from '@/lib/http';
import { useState, useEffect } from 'react';
import { User, MapPin, Briefcase, DollarSign, GitBranch, Link2, Globe, Save, Loader2, CheckCircle } from 'lucide-react';

interface ProfileData {
  headline?: string;
  summary?: string;
  location?: string;
  experience?: number;
  currentSalary?: number;
  expectedSalary?: number;
  noticePeriod?: number;
  linkedinUrl?: string;
  githubUrl?: string;
  portfolioUrl?: string;
  isOpenToWork?: boolean;
  user?: { name: string; email: string; phone?: string; profileImage?: string; };
}

const FIELD = 'w-full bg-white border border-line rounded-[14px] px-4 py-3 text-sm text-ink placeholder-ink-faint shadow-[inset_0_1px_2px_rgba(16,24,40,0.04)] focus:border-brand-600 focus:shadow-[0_0_0_4px_rgba(15,76,129,0.10)] outline-none transition-all duration-300';
const LABEL = 'block text-[13px] font-semibold text-ink-soft mb-2';

export default function CandidateProfilePage() {
  const [profile, setProfile] = useState<ProfileData>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  async function fetchProfile() {
    try {
      const res = await apiFetch('/api/candidate/profile');
      if (res.ok) {
        const data = await res.json();
        setProfile(data.data || {});
        setName(data.data?.user?.name || '');
        setPhone(data.data?.user?.phone || '');
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const res = await apiFetch('/api/candidate/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...profile, name, phone }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 text-brand-600 animate-spin" /></div>;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-7">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-[28px] font-extrabold text-ink tracking-[-0.035em]">My Profile</h1>
          <p className="text-ink-muted text-[15px] mt-1.5">Keep your profile updated to get better matches</p>
        </div>
        {saved && (
          <div className="flex items-center gap-2 shrink-0 bg-positive-soft border border-positive/20 text-positive text-[13px] font-semibold px-3.5 py-2 rounded-full animate-scale-in">
            <CheckCircle className="w-4 h-4" /> Saved!
          </div>
        )}
      </div>

      {error && <div className="bg-critical-soft border border-critical/25 text-critical rounded-[14px] px-4 py-3.5 text-sm font-medium">{error}</div>}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Basic Info */}
        <div className="surface sheen p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-[13px] bg-brand-50 border border-brand-100 flex items-center justify-center shrink-0">
              <User className="w-5 h-5 text-brand-600" strokeWidth={2.1} />
            </div>
            <h2 className="text-[17px] font-bold text-ink tracking-[-0.025em]">Basic Information</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className={LABEL}>Full Name</label>
              <input value={name} onChange={e => setName(e.target.value)} className={FIELD} />
            </div>
            <div>
              <label className={LABEL}>Phone</label>
              <input value={phone} onChange={e => setPhone(e.target.value)} className={FIELD} />
            </div>
            <div className="sm:col-span-2">
              <label className={LABEL}>Professional Headline</label>
              <input value={profile.headline || ''} onChange={e => setProfile({...profile, headline: e.target.value})} placeholder="e.g. Full Stack Developer with 3 years experience" className={FIELD} />
            </div>
            <div>
              <label className={LABEL}>Location</label>
              <div className="relative">
                <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-ink-faint pointer-events-none" />
                <input value={profile.location || ''} onChange={e => setProfile({...profile, location: e.target.value})} placeholder="City, Country" className={`${FIELD} pl-11`} />
              </div>
            </div>
            <div>
              <label className={LABEL}>Years of Experience</label>
              <div className="relative">
                <Briefcase className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-ink-faint pointer-events-none" />
                <input type="number" value={profile.experience || ''} onChange={e => setProfile({...profile, experience: Number(e.target.value)})} min={0} className={`${FIELD} pl-11`} />
              </div>
            </div>
            <div className="sm:col-span-2">
              <label className={LABEL}>Professional Summary</label>
              <textarea value={profile.summary || ''} onChange={e => setProfile({...profile, summary: e.target.value})} rows={4} placeholder="Tell recruiters about yourself..." className={`${FIELD} resize-none leading-[1.7]`} />
            </div>
          </div>
        </div>

        {/* Salary & Availability */}
        <div className="surface sheen p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-[13px] bg-ignite-50 border border-ignite-100 flex items-center justify-center shrink-0">
              <DollarSign className="w-5 h-5 text-ignite-600" strokeWidth={2.1} />
            </div>
            <h2 className="text-[17px] font-bold text-ink tracking-[-0.025em]">Salary & Availability</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div>
              <label className={LABEL}>Current CTC (LPA)</label>
              <input type="number" value={profile.currentSalary ? profile.currentSalary / 100000 : ''} onChange={e => setProfile({...profile, currentSalary: Number(e.target.value) * 100000})} placeholder="0" className={FIELD} />
            </div>
            <div>
              <label className={LABEL}>Expected CTC (LPA)</label>
              <input type="number" value={profile.expectedSalary ? profile.expectedSalary / 100000 : ''} onChange={e => setProfile({...profile, expectedSalary: Number(e.target.value) * 100000})} placeholder="0" className={FIELD} />
            </div>
            <div>
              <label className={LABEL}>Notice Period (days)</label>
              <input type="number" value={profile.noticePeriod || ''} onChange={e => setProfile({...profile, noticePeriod: Number(e.target.value)})} placeholder="30" className={FIELD} />
            </div>
          </div>
          <div className="mt-6 flex items-center gap-3 bg-canvas border border-line-soft rounded-[14px] px-4 py-3.5">
            <button type="button" onClick={() => setProfile({...profile, isOpenToWork: !profile.isOpenToWork})} className={`relative w-12 h-6 rounded-full shrink-0 transition-all duration-300 ${profile.isOpenToWork ? 'grad-brand shadow-[0_2px_8px_rgba(15,76,129,0.25)]' : 'bg-line border border-line'}`}>
              <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-[0_1px_3px_rgba(16,24,40,0.20)] transition-transform duration-300 ${profile.isOpenToWork ? 'translate-x-7' : 'translate-x-1'}`} />
            </button>
            <span className="text-[14px] font-semibold text-ink-soft">Open to work</span>
          </div>
        </div>

        {/* Social Links */}
        <div className="surface sheen p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-[13px] bg-informative-soft border border-brand-100 flex items-center justify-center shrink-0">
              <Globe className="w-5 h-5 text-brand-600" strokeWidth={2.1} />
            </div>
            <h2 className="text-[17px] font-bold text-ink tracking-[-0.025em]">Social Links</h2>
          </div>
          <div className="space-y-4">
            <div className="relative">
              <Link2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-brand-600 pointer-events-none" />
              <input value={profile.linkedinUrl || ''} onChange={e => setProfile({...profile, linkedinUrl: e.target.value})} placeholder="https://linkedin.com/in/..." className={`${FIELD} pl-11`} />
            </div>
            <div className="relative">
              <GitBranch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-ink-muted pointer-events-none" />
              <input value={profile.githubUrl || ''} onChange={e => setProfile({...profile, githubUrl: e.target.value})} placeholder="https://github.com/..." className={`${FIELD} pl-11`} />
            </div>
            <div className="relative">
              <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-ignite-500 pointer-events-none" />
              <input value={profile.portfolioUrl || ''} onChange={e => setProfile({...profile, portfolioUrl: e.target.value})} placeholder="https://yourportfolio.com" className={`${FIELD} pl-11`} />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button type="submit" disabled={saving} className="sweep press flex items-center gap-2 grad-brand disabled:opacity-50 text-white font-semibold px-6 py-3 rounded-[14px] shadow-[0_4px_12px_rgba(15,76,129,0.20)] hover:shadow-[0_8px_22px_rgba(15,76,129,0.30)] hover:-translate-y-0.5 transition-all duration-300">
            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            Save Profile
          </button>
        </div>
      </form>
    </div>
  );
}
