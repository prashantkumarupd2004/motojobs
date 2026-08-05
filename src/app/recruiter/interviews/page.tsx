'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  CalendarCheck,
  CalendarPlus,
  Clock,
  Loader2,
  MapPin,
  Phone,
  Video,
  X,
} from 'lucide-react';
import { apiFetch } from '@/lib/http';
import ScheduleInterviewModal from '@/components/employer/ScheduleInterviewModal';

interface Interview {
  id: string;
  scheduledAt: string;
  durationMins: number;
  mode: string;
  venue: string | null;
  notes: string | null;
  status: string;
  outcome: string | null;
  job: { id: string; title: string };
  application: {
    id: string;
    candidate: {
      id: string;
      currentCity: string | null;
      user: { name: string; email: string; profileImage: string | null };
    };
  };
}

interface CandidateOption {
  id: string;
  job: { id: string; title: string };
  candidate: { id: string; user: { name: string } };
}

const MODE_ICON: Record<string, typeof Video> = {
  IN_PERSON: MapPin,
  PHONE: Phone,
  VIDEO: Video,
};

const MODE_LABEL: Record<string, string> = {
  IN_PERSON: 'In person',
  PHONE: 'Phone call',
  VIDEO: 'Video call',
};

const STATUS_STYLES: Record<string, string> = {
  SCHEDULED: 'bg-brand-50 text-brand-700 border-brand-100',
  COMPLETED: 'bg-positive-soft text-[#0A7A54] border-[#BEE7D8]',
  CANCELLED: 'bg-critical-soft text-[#B32B2B] border-[#F3C9C9]',
};

function formatWhen(iso: string) {
  return new Date(iso).toLocaleString('en-IN', {
    dateStyle: 'full',
    timeStyle: 'short',
  });
}

export default function InterviewsPage() {
  const [upcoming, setUpcoming] = useState<Interview[]>([]);
  const [past, setPast] = useState<Interview[]>([]);
  const [candidates, setCandidates] = useState<CandidateOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [tab, setTab] = useState<'upcoming' | 'past'>('upcoming');
  const [scheduling, setScheduling] = useState<CandidateOption | null>(null);
  const [picking, setPicking] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch('/api/recruiter/interviews');
    if (!res.ok) return;
    const data = await res.json();
    setUpcoming(data.upcoming ?? []);
    setPast(data.past ?? []);
    setCandidates(data.candidates ?? []);
  }, []);

  useEffect(() => {
    let cancelled = false;
    load()
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [load]);

  async function act(id: string, action: 'cancel' | 'complete' | 'reschedule', when?: string) {
    setBusy(id);
    try {
      await apiFetch('/api/recruiter/interviews', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action, scheduledAt: when }),
      });
      await load();
    } finally {
      setBusy(null);
    }
  }

  function reschedule(interview: Interview) {
    const current = new Date(interview.scheduledAt);
    const input = window.prompt(
      'New date and time (YYYY-MM-DD HH:MM)',
      `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}-${String(
        current.getDate()
      ).padStart(2, '0')} ${String(current.getHours()).padStart(2, '0')}:${String(
        current.getMinutes()
      ).padStart(2, '0')}`
    );
    if (!input) return;
    const next = new Date(input.replace(' ', 'T'));
    if (Number.isNaN(next.getTime())) {
      window.alert('That date could not be read. Use the format YYYY-MM-DD HH:MM.');
      return;
    }
    void act(interview.id, 'reschedule', next.toISOString());
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-7 h-7 text-brand-600 animate-spin" />
      </div>
    );
  }

  const list = tab === 'upcoming' ? upcoming : past;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-[26px] sm:text-[28px] font-extrabold text-ink tracking-[-0.035em]">
            Interviews
          </h1>
          <p className="text-ink-muted text-[14.5px] mt-1.5">
            {upcoming.length} upcoming · {past.length} completed or cancelled
          </p>
        </div>
        <button
          onClick={() => setPicking(true)}
          disabled={candidates.length === 0}
          className="sweep press inline-flex shrink-0 items-center justify-center gap-2 grad-brand text-white font-semibold px-6 py-3 rounded-[14px] text-[14px] shadow-brand hover:-translate-y-0.5 hover:shadow-e4 transition-all duration-300 disabled:opacity-50 disabled:translate-y-0"
        >
          <CalendarPlus className="w-4 h-4" /> Schedule interview
        </button>
      </div>

      <div className="flex gap-2">
        {(['upcoming', 'past'] as const).map((key) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`press px-4 py-2.5 rounded-[12px] text-[12.5px] font-semibold border transition-all duration-300 ${
              tab === key
                ? 'grad-brand text-white border-transparent shadow-brand'
                : 'bg-white border-line text-ink-muted hover:border-brand-200 hover:text-brand-700'
            }`}
          >
            {key === 'upcoming' ? 'Upcoming' : 'Past'}
          </button>
        ))}
      </div>

      {list.length === 0 ? (
        <div className="surface sheen text-center py-16 px-6">
          <div className="w-14 h-14 rounded-[18px] bg-canvas border border-line-soft flex items-center justify-center mx-auto mb-4">
            <CalendarCheck className="w-6 h-6 text-ink-faint" />
          </div>
          <h3 className="text-[16px] font-bold text-ink tracking-[-0.02em] mb-1.5">
            {tab === 'upcoming' ? 'No interviews scheduled' : 'Nothing here yet'}
          </h3>
          <p className="text-ink-muted text-[14px]">
            {tab === 'upcoming'
              ? 'Shortlist a candidate, then book a slot from their application.'
              : 'Completed and cancelled interviews appear here.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {list.map((interview) => {
            const ModeIcon = MODE_ICON[interview.mode] ?? MapPin;
            const candidate = interview.application.candidate;
            return (
              <article key={interview.id} className="surface sheen p-5 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                  {candidate.user.profileImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={candidate.user.profileImage}
                      alt=""
                      className="w-12 h-12 rounded-[14px] object-cover border border-line shrink-0"
                    />
                  ) : (
                    <span className="w-12 h-12 rounded-[14px] grad-brand flex items-center justify-center text-white text-[15px] font-bold shrink-0">
                      {candidate.user.name[0]?.toUpperCase()}
                    </span>
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <h3 className="text-[16px] font-bold text-ink tracking-[-0.02em]">
                        {candidate.user.name}
                      </h3>
                      <span
                        className={`text-[10px] font-bold uppercase tracking-[0.08em] border rounded-full px-2.5 py-1 ${
                          STATUS_STYLES[interview.status] ?? 'bg-canvas text-ink-muted border-line'
                        }`}
                      >
                        {interview.status}
                      </span>
                    </div>

                    <p className="text-[13.5px] text-ink-muted mt-1">{interview.job.title}</p>

                    <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[13px] text-ink-soft mt-3">
                      <span className="inline-flex items-center gap-1.5 font-semibold">
                        <Clock className="w-3.5 h-3.5 text-ink-faint" />
                        {formatWhen(interview.scheduledAt)}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <ModeIcon className="w-3.5 h-3.5 text-ink-faint" />
                        {MODE_LABEL[interview.mode] ?? interview.mode} ·{' '}
                        {interview.durationMins} min
                      </span>
                    </div>

                    {interview.venue && (
                      <p className="text-[13px] text-ink-muted mt-2 break-words">
                        {interview.venue}
                      </p>
                    )}
                    {interview.notes && (
                      <p className="text-[12.5px] text-ink-muted bg-canvas border border-line-soft rounded-[10px] px-3 py-2 mt-3">
                        {interview.notes}
                      </p>
                    )}
                  </div>
                </div>

                {interview.status === 'SCHEDULED' && (
                  <div className="flex flex-wrap items-center gap-2 mt-5 pt-5 border-t border-line-soft">
                    <button
                      disabled={busy === interview.id}
                      onClick={() => act(interview.id, 'complete')}
                      className="press inline-flex items-center gap-1.5 bg-white border border-line text-ink-soft hover:text-[#0A7A54] hover:border-[#BEE7D8] hover:bg-positive-soft rounded-[11px] px-3.5 py-2 text-[13px] font-semibold transition-all disabled:opacity-50"
                    >
                      <CalendarCheck className="w-3.5 h-3.5" /> Mark completed
                    </button>
                    <button
                      disabled={busy === interview.id}
                      onClick={() => reschedule(interview)}
                      className="press inline-flex items-center gap-1.5 bg-white border border-line text-ink-soft hover:text-brand-700 hover:border-brand-200 rounded-[11px] px-3.5 py-2 text-[13px] font-semibold transition-all disabled:opacity-50"
                    >
                      <Clock className="w-3.5 h-3.5" /> Reschedule
                    </button>
                    <button
                      disabled={busy === interview.id}
                      onClick={() => act(interview.id, 'cancel')}
                      className="press inline-flex items-center gap-1.5 bg-white border border-line text-ink-soft hover:text-[#B32B2B] hover:border-[#F3C9C9] hover:bg-critical-soft rounded-[11px] px-3.5 py-2 text-[13px] font-semibold transition-all disabled:opacity-50"
                    >
                      <X className="w-3.5 h-3.5" /> Cancel
                    </button>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}

      {picking && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B1220]/35 backdrop-blur-[6px] animate-fade-in"
          onClick={() => setPicking(false)}
        >
          <div
            className="w-full max-w-md bg-white border border-line rounded-[24px] shadow-e4 sheen max-h-[80vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-5 border-b border-line-soft">
              <h2 className="text-[16px] font-bold text-ink tracking-[-0.02em]">
                Pick a candidate
              </h2>
              <p className="text-[13px] text-ink-muted mt-1">
                Anyone you have shortlisted or moved into review.
              </p>
            </div>
            <ul className="overflow-y-auto scroll-slim divide-y divide-line-soft">
              {candidates.map((c) => (
                <li key={c.id}>
                  <button
                    onClick={() => {
                      setScheduling(c);
                      setPicking(false);
                    }}
                    className="w-full text-left px-6 py-3.5 hover:bg-canvas transition-colors"
                  >
                    <p className="text-[14px] font-semibold text-ink">
                      {c.candidate.user.name}
                    </p>
                    <p className="text-[12.5px] text-ink-muted mt-0.5">{c.job.title}</p>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {scheduling && (
        <ScheduleInterviewModal
          applicationId={scheduling.id}
          candidateName={scheduling.candidate.user.name}
          jobTitle={scheduling.job.title}
          onClose={() => setScheduling(null)}
          onScheduled={() => {
            setScheduling(null);
            void load();
          }}
        />
      )}
    </div>
  );
}
