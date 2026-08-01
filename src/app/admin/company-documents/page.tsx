'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  BadgeCheck,
  Building2,
  CheckCircle,
  Clock,
  ExternalLink,
  FileText,
  Loader2,
  MapPin,
  ShieldCheck,
  XCircle,
} from 'lucide-react';
import { apiFetch } from '@/lib/http';
import { COMPANY_DOCUMENT_TYPES } from '@/lib/automotive';

interface ReviewDoc {
  id: string;
  type: string;
  fileUrl: string;
  fileName: string | null;
  status: string;
  adminNotes: string | null;
  uploadedAt: string;
  company: {
    id: string;
    name: string;
    slug: string | null;
    gstNumber: string | null;
    city: string | null;
    state: string | null;
    isVerified: boolean;
  };
}

const TABS = [
  { id: 'PENDING', label: 'Pending' },
  { id: 'APPROVED', label: 'Approved' },
  { id: 'REJECTED', label: 'Rejected' },
  { id: 'ALL', label: 'All' },
];

const LABEL_BY_TYPE = Object.fromEntries(
  COMPANY_DOCUMENT_TYPES.map((d) => [d.id, d.label])
);

const STATUS_STYLES: Record<string, string> = {
  PENDING: 'bg-ignite-50 border-ignite-500/20 text-ignite-600',
  APPROVED: 'bg-positive-soft border-positive/20 text-positive',
  REJECTED: 'bg-critical-soft border-critical/20 text-critical',
};

export default function CompanyDocumentsAdminPage() {
  const [documents, setDocuments] = useState<ReviewDoc[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [tab, setTab] = useState('PENDING');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState('');
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [error, setError] = useState('');

  const load = useCallback(
    () =>
      apiFetch(`/api/admin/company-documents?status=${tab}`).then((res) =>
        res.ok ? res.json() : { documents: [], counts: {} }
      ),
    [tab]
  );

  // The spinner is raised by the tab handler and by review(), never here:
  // setting state synchronously inside an effect triggers a cascading render.
  useEffect(() => {
    let cancelled = false;
    load()
      .then((data) => {
        if (cancelled) return;
        setDocuments(data.documents ?? []);
        setCounts(data.counts ?? {});
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [load]);

  async function review(doc: ReviewDoc, status: 'APPROVED' | 'REJECTED') {
    const adminNotes = notes[doc.id]?.trim();
    if (status === 'REJECTED' && !adminNotes) {
      setError('Add a note explaining the rejection so the employer can fix it.');
      return;
    }

    setError('');
    setBusy(doc.id);
    try {
      const res = await apiFetch('/api/admin/company-documents', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: doc.id, status, adminNotes }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not review the document');

      const refreshed = await load();
      setDocuments(refreshed.documents ?? []);
      setCounts(refreshed.counts ?? {});
      setNotes((n) => {
        const next = { ...n };
        delete next[doc.id];
        return next;
      });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Could not review the document');
    } finally {
      setBusy('');
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-7">
      <div>
        <h1 className="text-[28px] font-extrabold text-ink tracking-[-0.035em]">
          Company Documents
        </h1>
        <p className="text-ink-muted text-[15px] mt-1.5">
          Review employer registration and identity proof. A company earns its
          verified badge once one registration proof and one identity proof are
          approved.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {TABS.map(({ id, label }) => {
          const active = tab === id;
          const count = counts[id];
          return (
            <button
              key={id}
              type="button"
              onClick={() => {
                setLoading(true);
                setTab(id);
              }}
              aria-pressed={active}
              className={`px-4 py-2.5 rounded-[12px] text-[13.5px] font-semibold border transition-all duration-300 ${
                active
                  ? 'bg-brand-600 border-brand-600 text-white shadow-[0_3px_10px_rgba(15,76,129,0.22)]'
                  : 'bg-white border-line text-ink-muted hover:border-brand-200 hover:text-brand-700'
              }`}
            >
              {label}
              {count != null && id !== 'ALL' && (
                <span className={active ? 'ml-2 opacity-80' : 'ml-2 text-ink-faint'}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {error && (
        <div
          role="alert"
          className="bg-critical-soft border border-critical/20 text-critical rounded-[14px] px-4 py-3 text-sm font-medium"
        >
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-ignite-600 animate-spin" />
        </div>
      ) : documents.length === 0 ? (
        <div className="surface p-12 text-center">
          <ShieldCheck className="w-10 h-10 text-ink-faint mx-auto" />
          <h2 className="text-[18px] font-bold text-ink mt-4">Nothing to review</h2>
          <p className="text-ink-muted text-[14.5px] mt-2">
            New employer documents will appear here as they are submitted.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {documents.map((doc) => (
            <div key={doc.id} className="surface p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0">
                  <h2 className="text-[16.5px] font-bold text-ink tracking-[-0.02em] flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-ink-faint shrink-0" />
                    {doc.company.name}
                    {doc.company.isVerified && (
                      <BadgeCheck
                        className="w-4 h-4 text-brand-600 shrink-0"
                        aria-label="Verified"
                      />
                    )}
                  </h2>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-2 text-[13px] text-ink-faint font-medium">
                    {(doc.company.city || doc.company.state) && (
                      <span className="inline-flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5" />
                        {[doc.company.city, doc.company.state].filter(Boolean).join(', ')}
                      </span>
                    )}
                    {doc.company.gstNumber && (
                      <span className="font-mono text-[12.5px]">
                        GST {doc.company.gstNumber}
                      </span>
                    )}
                    {doc.company.slug && (
                      <a
                        href={`/company/${doc.company.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-brand-600 hover:text-brand-700"
                      >
                        View profile
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </div>
                <span
                  className={`inline-flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-[0.08em] px-2.5 py-1.5 rounded-full border shrink-0 ${
                    STATUS_STYLES[doc.status] ?? STATUS_STYLES.PENDING
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  {doc.status}
                </span>
              </div>

              <div className="flex items-center gap-3 bg-canvas border border-line rounded-[14px] px-4 py-3 mt-5">
                <div className="w-9 h-9 rounded-[10px] bg-white border border-line flex items-center justify-center shrink-0">
                  <FileText className="w-4 h-4 text-brand-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-ink truncate">
                    {LABEL_BY_TYPE[doc.type] ?? doc.type}
                  </p>
                  <p className="text-[12.5px] text-ink-faint truncate">
                    {doc.fileName || 'Uploaded document'}
                  </p>
                </div>
                <a
                  href={doc.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 inline-flex items-center gap-1.5 text-[13px] font-semibold text-brand-600 hover:text-brand-700"
                >
                  Open
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              {doc.status !== 'PENDING' && doc.adminNotes && (
                <p className="text-[13px] text-ink-muted mt-3">
                  <span className="font-semibold text-ink">Note:</span> {doc.adminNotes}
                </p>
              )}

              <div className="flex flex-col sm:flex-row gap-3 mt-5">
                <input
                  value={notes[doc.id] ?? ''}
                  onChange={(e) =>
                    setNotes((n) => ({ ...n, [doc.id]: e.target.value }))
                  }
                  placeholder="Note to the employer (required to reject)"
                  aria-label={`Review note for ${doc.company.name}`}
                  className="flex-1 bg-white text-ink placeholder-ink-faint text-sm rounded-[14px] px-4 py-3 border border-line outline-none transition-all duration-300 hover:border-[#D9DEE9] focus:border-brand-600 focus:shadow-[0_0_0_4px_rgba(15,76,129,0.10)]"
                />
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => review(doc, 'APPROVED')}
                    disabled={busy === doc.id}
                    className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 bg-positive disabled:opacity-50 text-white font-semibold text-[14px] px-5 py-3 rounded-[14px] hover:-translate-y-0.5 transition-all duration-300"
                  >
                    {busy === doc.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <CheckCircle className="w-4 h-4" />
                    )}
                    Approve
                  </button>
                  <button
                    type="button"
                    onClick={() => review(doc, 'REJECTED')}
                    disabled={busy === doc.id}
                    className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 bg-white border border-critical/30 disabled:opacity-50 text-critical font-semibold text-[14px] px-5 py-3 rounded-[14px] hover:bg-critical-soft transition-all duration-300"
                  >
                    <XCircle className="w-4 h-4" />
                    Reject
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
