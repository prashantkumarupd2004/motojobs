'use client';
import { apiFetch } from '@/lib/http';
import { useState, useEffect } from 'react';
import { Star, Loader2, Search, ThumbsUp, ThumbsDown, MessageSquare } from 'lucide-react';

interface Rating {
  id: string;
  rating: number;
  feedback?: string;
  communicationScore?: number;
  technicalScore?: number;
  cultureFitScore?: number;
  createdAt: string;
  candidate?: { user?: { name: string; email: string }; headline?: string };
  job?: { title: string };
}

function StarRating({ value, onChange }: { value: number; onChange?: (v: number) => void }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map(i => (
        <button
          key={i}
          type={onChange ? 'button' : undefined}
          onClick={() => onChange?.(i)}
          onMouseEnter={() => setHover(i)}
          onMouseLeave={() => setHover(0)}
          className={`${onChange ? 'cursor-pointer' : 'cursor-default'} transition-colors`}
        >
          <Star className={`w-5 h-5 ${i <= (hover || value) ? 'text-[#9A5D00] fill-amber-400' : 'text-ink-faint'}`} />
        </button>
      ))}
    </div>
  );
}

export default function RatingsPage() {
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({
    candidateId: '',
    jobId: '',
    rating: 0,
    feedback: '',
    communicationScore: 0,
    technicalScore: 0,
    cultureFitScore: 0,
    recommend: false,
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { fetchRatings(); }, []);

  async function fetchRatings() {
    try {
      const res = await apiFetch('/api/recruiter/ratings');
      if (res.ok) { const data = await res.json(); setRatings(data.data || []); }
    } finally { setLoading(false); }
  }

  async function submitRating() {
    if (!form.rating || !form.candidateId) return;
    setSubmitting(true);
    try {
      const res = await apiFetch('/api/recruiter/ratings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        await fetchRatings();
        setShowForm(false);
        setForm({ candidateId: '', jobId: '', rating: 0, feedback: '', communicationScore: 0, technicalScore: 0, cultureFitScore: 0, recommend: false });
      }
    } finally { setSubmitting(false); }
  }

  const filtered = ratings.filter(r =>
    !search ||
    r.candidate?.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
    r.job?.title?.toLowerCase().includes(search.toLowerCase())
  );

  const avgRating = ratings.length > 0 ? (ratings.reduce((s, r) => s + r.rating, 0) / ratings.length).toFixed(1) : '0.0';

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 text-[#0A7A54] animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink">Candidate Ratings</h1>
          <p className="text-ink-muted mt-1">Track and review candidate interview performance</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 bg-positive hover:bg-positive text-ink font-semibold px-4 py-2.5 rounded-[16px] text-sm transition-all">
          <Star className="w-4 h-4" /> Add Rating
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Rated', value: ratings.length },
          { label: 'Average Rating', value: `${avgRating} ★` },
          { label: 'Recommended', value: ratings.filter(r => r.rating >= 4).length },
        ].map(({ label, value }) => (
          <div key={label} className="bg-white border border-line rounded-[16px] p-4 text-center">
            <div className="text-2xl font-bold text-ink mb-1">{value}</div>
            <div className="text-xs text-ink-muted">{label}</div>
          </div>
        ))}
      </div>

      {/* Add Rating Form */}
      {showForm && (
        <div className="bg-white border border-[#BEE7D8] rounded-[16px] p-6 space-y-5 animate-fade-in">
          <h2 className="font-bold text-ink">Rate Candidate</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-ink-soft mb-2">Candidate ID</label>
              <input value={form.candidateId} onChange={e => setForm({ ...form, candidateId: e.target.value })} placeholder="Candidate ID" className="w-full bg-canvas border border-line text-ink placeholder-ink-faint rounded-[16px] px-4 py-3 text-sm focus:outline-none focus:border-[#BEE7D8]" />
            </div>
            <div>
              <label className="block text-sm text-ink-soft mb-2">Job ID</label>
              <input value={form.jobId} onChange={e => setForm({ ...form, jobId: e.target.value })} placeholder="Job ID" className="w-full bg-canvas border border-line text-ink placeholder-ink-faint rounded-[16px] px-4 py-3 text-sm focus:outline-none focus:border-[#BEE7D8]" />
            </div>
          </div>
          <div className="space-y-4">
            {[
              { key: 'rating', label: 'Overall Rating' },
              { key: 'technicalScore', label: 'Technical Skills' },
              { key: 'communicationScore', label: 'Communication' },
              { key: 'cultureFitScore', label: 'Culture Fit' },
            ].map(({ key, label }) => (
              <div key={key} className="flex items-center justify-between">
                <label className="text-sm text-ink-soft">{label}</label>
                <StarRating value={form[key as keyof typeof form] as number} onChange={v => setForm({ ...form, [key]: v })} />
              </div>
            ))}
          </div>
          <div>
            <label className="block text-sm text-ink-soft mb-2">Feedback Notes</label>
            <textarea value={form.feedback} onChange={e => setForm({ ...form, feedback: e.target.value })} rows={3} placeholder="Interview notes and observations..." className="w-full bg-canvas border border-line text-ink placeholder-ink-faint rounded-[16px] px-4 py-3 text-sm focus:outline-none focus:border-[#BEE7D8] resize-none" />
          </div>
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => setForm({ ...form, recommend: !form.recommend })} className={`flex items-center gap-2 px-4 py-2 rounded-[16px] border text-sm transition-all ${form.recommend ? 'bg-positive-soft border-[#BEE7D8] text-[#0A7A54]' : 'border-line text-ink-muted'}`}>
              <ThumbsUp className="w-4 h-4" /> Recommend
            </button>
          </div>
          <div className="flex gap-3">
            <button onClick={submitRating} disabled={submitting || !form.rating || !form.candidateId} className="flex items-center gap-2 bg-positive hover:bg-positive disabled:opacity-50 text-ink font-semibold px-5 py-2.5 rounded-[16px] text-sm transition-all">
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Star className="w-4 h-4" />} Submit Rating
            </button>
            <button onClick={() => setShowForm(false)} className="px-5 py-2.5 text-ink-muted hover:text-ink border border-line rounded-[16px] text-sm transition-all">Cancel</button>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-muted" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search ratings..." className="w-full bg-white border border-line text-ink placeholder-ink-faint rounded-[16px] pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-[#BEE7D8]" />
      </div>

      {/* Ratings List */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-white border border-line rounded-[16px]">
          <Star className="w-12 h-12 text-ink-faint mx-auto mb-3" />
          <h3 className="font-semibold text-ink mb-2">No ratings yet</h3>
          <p className="text-ink-muted text-sm">Rate candidates after interviews to track your evaluations</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(rating => (
            <div key={rating.id} className="bg-white border border-line rounded-[16px] p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#1F5D95] to-[#0F4C81] flex items-center justify-center text-white font-bold text-sm shrink-0">
                    {rating.candidate?.user?.name?.[0] || '?'}
                  </div>
                  <div>
                    <p className="font-semibold text-ink">{rating.candidate?.user?.name || 'Unknown'}</p>
                    <p className="text-sm text-ink-muted">{rating.job?.title || ''}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <StarRating value={rating.rating} />
                      <span className="text-sm text-[#9A5D00] font-semibold">{rating.rating}/5</span>
                    </div>
                  </div>
                </div>
                <span className="text-xs text-ink-faint">{new Date(rating.createdAt).toLocaleDateString()}</span>
              </div>
              {rating.feedback && (
                <div className="mt-3 ml-13 flex items-start gap-2 bg-white rounded-[16px] p-3">
                  <MessageSquare className="w-4 h-4 text-ink-muted shrink-0 mt-0.5" />
                  <p className="text-sm text-ink-soft">{rating.feedback}</p>
                </div>
              )}
              {(rating.technicalScore || rating.communicationScore || rating.cultureFitScore) && (
                <div className="mt-3 grid grid-cols-3 gap-3">
                  {[
                    { label: 'Technical', value: rating.technicalScore },
                    { label: 'Communication', value: rating.communicationScore },
                    { label: 'Culture Fit', value: rating.cultureFitScore },
                  ].map(({ label, value }) => value ? (
                    <div key={label} className="text-center bg-white rounded-[16px] p-2">
                      <div className="text-sm font-bold text-ink">{value}/5</div>
                      <div className="text-xs text-ink-muted">{label}</div>
                    </div>
                  ) : null)}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
