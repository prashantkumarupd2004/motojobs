'use client';

import { useCallback, useEffect, useState } from 'react';
import { CheckCircle2, Clock3, FileText, IdCard, Loader2 } from 'lucide-react';
import { MAX_RESUME_BYTES } from '@/lib/automotive';
import { apiFetch } from '@/lib/http';
import { FileUpload } from '@/components/form';

interface FileRef {
  url: string;
  name: string;
}

export default function CandidateDocumentsPage() {
  const [resume, setResume] = useState<FileRef | null>(null);
  const [panCard, setPanCard] = useState<FileRef | null>(null);
  const [panNumber, setPanNumber] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    let cancelled = false;
    fetch('/api/candidate/profile')
      .then((r) => (r.ok ? r.json() : null))
      .then((res) => {
        if (cancelled || !res?.data) return;
        const d = res.data;
        if (d.resumeUrl) setResume({ url: d.resumeUrl, name: d.resumeName ?? 'Resume' });
        if (d.panCardUrl) setPanCard({ url: d.panCardUrl, name: 'PAN card' });
        setPanNumber(d.panNumber ?? '');
      })
      .catch(() => {})
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  const persist = useCallback(async (patch: Record<string, unknown>) => {
    setSaving(true);
    setMessage('');
    try {
      const res = await apiFetch('/api/candidate/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? 'Could not save');
      setMessage('Saved');
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Could not save');
    } finally {
      setSaving(false);
    }
  }, []);

  if (loading) {
    return (
      <div className="max-w-[760px] space-y-4">
        <div className="bg-white border border-line rounded-[16px] h-40 skeleton" />
        <div className="bg-white border border-line rounded-[16px] h-40 skeleton" />
      </div>
    );
  }

  return (
    <div className="max-w-[760px] space-y-6">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-[24px] font-extrabold text-ink tracking-[-0.03em]">Documents</h1>
          <p className="text-[14px] text-ink-muted mt-1">
            Stored privately. Employers only see your resume when you apply.
          </p>
        </div>
        {saving ? (
          <Loader2 className="w-4 h-4 text-brand-600 animate-spin mt-2 shrink-0" />
        ) : (
          message && (
            <span className="text-[13px] font-semibold text-positive mt-2 shrink-0">{message}</span>
          )
        )}
      </header>

      <DocCard
        icon={FileText}
        title="Resume"
        hint="PDF, DOC or DOCX. Up to 5MB."
        uploaded={!!resume}
      >
        <FileUpload
          accept=".pdf,.doc,.docx"
          maxBytes={MAX_RESUME_BYTES}
          value={resume?.url}
          fileName={resume?.name}
          onChange={(file) => {
            setResume(file);
            void persist({ resumeUrl: file?.url, resumeName: file?.name });
          }}
          label="Drag and drop your resume"
          hint="or click to browse"
        />
      </DocCard>

      <DocCard
        icon={IdCard}
        title="PAN card"
        hint="Only used for payroll once you are hired."
        uploaded={!!panCard}
      >
        <div className="space-y-4">
          <label className="block">
            <span className="block text-[13px] font-semibold text-ink mb-1.5">PAN number</span>
            <input
              value={panNumber}
              maxLength={10}
              onChange={(e) => setPanNumber(e.target.value.toUpperCase())}
              onBlur={() => panNumber && void persist({ panNumber })}
              placeholder="ABCDE1234F"
              className="w-full h-[46px] bg-white border border-line rounded-[12px] px-3.5 text-[14px] text-ink outline-none focus:border-brand-600 transition-colors"
            />
          </label>

          <FileUpload
            accept=".pdf,.jpg,.jpeg,.png,.webp"
            maxBytes={MAX_RESUME_BYTES}
            value={panCard?.url}
            fileName={panCard?.name}
            onChange={(file) => {
              setPanCard(file);
              void persist({ panCardUrl: file?.url });
            }}
            label="Upload PAN card"
            hint="Drag and drop, or click to browse"
          />
        </div>
      </DocCard>
    </div>
  );
}

function DocCard({
  icon: Icon,
  title,
  hint,
  uploaded,
  children,
}: {
  icon: typeof FileText;
  title: string;
  hint: string;
  uploaded: boolean;
  children: React.ReactNode;
}) {
  return (
    <section className="bg-white border border-line rounded-[16px] p-6">
      <div className="flex items-start justify-between gap-4 mb-5">
        <div className="flex items-start gap-3 min-w-0">
          <span className="w-10 h-10 rounded-[12px] bg-brand-50 border border-brand-100 flex items-center justify-center shrink-0">
            <Icon className="w-[18px] h-[18px] text-brand-600" strokeWidth={2.1} />
          </span>
          <div className="min-w-0">
            <h2 className="text-[15.5px] font-bold text-ink">{title}</h2>
            <p className="text-[12.5px] text-ink-muted mt-0.5 leading-[1.5]">{hint}</p>
          </div>
        </div>

        <span
          className={`shrink-0 inline-flex items-center gap-1.5 border rounded-full px-2.5 py-1 text-[11px] font-bold ${
            uploaded
              ? 'bg-positive-soft text-positive border-positive/25'
              : 'bg-caution-soft text-caution border-caution/25'
          }`}
        >
          {uploaded ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Clock3 className="w-3.5 h-3.5" />}
          {uploaded ? 'Uploaded' : 'Pending'}
        </span>
      </div>

      {children}
    </section>
  );
}
